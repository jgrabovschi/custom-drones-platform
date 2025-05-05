<script setup>
import { ref, inject } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const room = ref("");
const displays = ref("");
const janus_ws = inject("janus-ws");

const handleSubmit = () => {
  event.preventDefault();

  const ws = new WebSocket(janus_ws, "janus-protocol");
  const roomId = JSON.parse(room.value);
  const desiredDisplays = JSON.parse(displays.value);
  const videosDiv = document.getElementById("videos");

  let sessionId = null;
  let publisherHandleId = null;
  let pcs = {}; // handle_id -> RTCPeerConnection
  let feedHandleMap = {}; // feedId -> handleId
  let transactions = {};
  let keepaliveInterval;

  const send = (msg) => {
    const transaction = Math.random().toString(36).substring(2);
    msg.transaction = transaction;
    return new Promise((resolve) => {
      transactions[transaction] = resolve;
      ws.send(JSON.stringify(msg));
    });
  };

  ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);
    const { janus, transaction } = msg;

    if (transaction && transactions[transaction]) {
      transactions[transaction](msg);
      delete transactions[transaction];
    } else if (janus === "event" && msg.plugindata) {
      const data = msg.plugindata.data;

      // Handle new publishers
      if (data.videoroom === "event" && data.publishers) {
        for (const pub of data.publishers) {
          if (desiredDisplays.includes(pub.display)) {
            console.log("Subscribing to:", pub.display);
            await subscribeToFeed(pub.id, pub.display);
          }
        }
      }

      // Handle unpublishing
      if (data.videoroom === "event" && data.unpublished) {
        const unpublishedId = data.unpublished;
        if (typeof unpublishedId !== "number") return;

        const handleId = feedHandleMap[unpublishedId];
        if (handleId) {
          cleanupFeed(handleId, unpublishedId);
        }
      }

      // Handle participant leaving
      if (data.videoroom === "event" && data.leaving) {
        const leavingId = data.leaving;
        const handleId = feedHandleMap[leavingId];
        if (handleId) {
          cleanupFeed(handleId, leavingId);
        }
      }

      // Handle remote SDP
      if (msg.jsep && msg.sender) {
        const pc = pcs[msg.sender];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.jsep));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          send({
            janus: "message",
            body: { request: "start", room: roomId },
            jsep: answer,
            session_id: sessionId,
            handle_id: msg.sender,
          });
        }
      }
    }
  };

  const cleanupFeed = (handleId, feedId) => {
    console.log(`Cleaning up feed ${feedId}, handle ${handleId}`);

    const videoEl = document.getElementById(`video-${handleId}`);
    if (videoEl) {
      videoEl.remove();
    }

    if (pcs[handleId]) {
      pcs[handleId].close();
      delete pcs[handleId];
    }

    delete feedHandleMap[feedId];

    send({
      janus: "detach",
      session_id: sessionId,
      handle_id: handleId,
    });
  };

  ws.onopen = async () => {
    const res = await send({ janus: "create" });
    sessionId = res.data.id;

    keepaliveInterval = setInterval(() => {
      ws.send(
        JSON.stringify({
          janus: "keepalive",
          session_id: sessionId,
          transaction: "keepalive",
        })
      );
    }, 30000);

    const attach = await send({
      janus: "attach",
      plugin: "janus.plugin.videoroom",
      session_id: sessionId,
    });
    publisherHandleId = attach.data.id;

    await send({
      janus: "message",
      session_id: sessionId,
      handle_id: publisherHandleId,
      body: {
        request: "join",
        room: roomId,
        ptype: "publisher",
        display: "monitor-client",
      },
    });

    const list = await send({
      janus: "message",
      session_id: sessionId,
      handle_id: publisherHandleId,
      body: { request: "listparticipants", room: roomId },
    });

    const participants = list.plugindata.data.participants || [];
    const matching = participants.filter((p) =>
      desiredDisplays.includes(p.display)
    );
    for (const pub of matching) {
      await subscribeToFeed(pub.id, pub.display);
    }
  };

  async function subscribeToFeed(feedId, display) {
    const res = await send({
      janus: "attach",
      plugin: "janus.plugin.videoroom",
      session_id: sessionId,
    });
    const subscriberHandle = res.data.id;
    feedHandleMap[feedId] = subscriberHandle;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcs[subscriberHandle] = pc;

    const card = document.createElement("div");
    card.className = "w-md border rounded-lg shadow-md overflow-hidden mb-4 bg-white";

    // Header com o display name
    const header = document.createElement("div");
    header.className = "bg-gray-800 text-white px-4 py-2 text-sm font-semibold";
    header.textContent = display || `User ${subscriberHandle}`;
    card.appendChild(header);
    card.id = `video-${subscriberHandle}`;

    // Video element
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.className = "bg-black";
    card.appendChild(video);

    videosDiv.appendChild(card);

    pc.ontrack = (e) => {
      if (e.track.kind === "video") {
        video.srcObject = e.streams[0];
      }
    };

    await send({
      janus: "message",
      body: {
        request: "join",
        ptype: "subscriber",
        room: roomId,
        feed: feedId,
      },
      session_id: sessionId,
      handle_id: subscriberHandle,
    });
  }
};
</script>

<template>
  <div class="p-6 space-y-6">
    <h2 class="text-2xl font-bold tracking-tight">
      Janus WebSocket Subscribers
    </h2>

    <form id="form" class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="room">Room</Label>
        <Input id="room" v-model="room" placeholder="Enter room ID" />
      </div>

      <div class="space-y-2">
        <Label for="displays">Displays</Label>
        <Input
          id="displays"
          v-model="displays"
          placeholder="JSON Array of IDs"
        />
      </div>

      <Button type="submit" class="w-full">Watch</Button>
    </form>

    <div id="videos" class="grid grid-cols-2 gap-4"></div>
  </div>
</template>
