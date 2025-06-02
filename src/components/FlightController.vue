<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useComandStore } from '@/stores/comand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import JanusClient from '@/components/JanusClient.vue'

const comandStore = useComandStore();
const numeroMetros = ref(0);
const yaw = ref(0);
const isCardinal = ref(true);
const selectedMode = ref("");

const handleClick = (direction) =>{
    //console.log("direction: " + direction);
    //console.log("metros para andar: " + numeroMetros.value);
    if(isCardinal.value){
      comandStore.sendMoveLocalCardinalMessage(direction,numeroMetros.value)
    }else{
      comandStore.sendMoveLocalMessage(direction,numeroMetros.value)
    }
}

const handleAction = (action) =>{
    if(action == 'Takeoff'){
        comandStore.sendTakeoffMessage()
    }else if (action == 'Land'){
        comandStore.sendLandMessage()
    }
    
}

const changeMode = () =>{
  if(selectedMode.value != ""){
    comandStore.sendChangeModeMessage(selectedMode.value);
  }
  
}

const changeDirectionType = () =>{
  isCardinal.value = !isCardinal.value
}


const preArmSystem = () =>{
  comandStore.sendPreArmCheckDroneMessage();
}
const armSystem = () =>{
  comandStore.sendArmDroneMessage();
}

const sendYaw = () =>{
  comandStore.sendYawMessage(yaw.value);
}



//fazer a função para controlar manualmente e variaveis necessarias


const directions = ref([0,0,0,0]); //frente,tras,direita,esquerda,cima,baixo
//const elapsedTime = ref(0); // Elapsed time in milliseconds
const isRunning = ref(false);
let intervalId = null;

// mandar direções
const manualControl = () => {

  if(comandStore.manualControlDirectionsSent[0] != directions.value[0] ||
      comandStore.manualControlDirectionsSent[1] != directions.value[1] ||
      comandStore.manualControlDirectionsSent[2] != directions.value[2] ||
      comandStore.manualControlDirectionsSent[3] != directions.value[3]){

        comandStore.sendManualControlMessage(directions.value);
        }
  
};

// Stop the stopwatch
const stop = () => {
  isRunning.value = false;
  clearInterval(intervalId);
};

//funções para manual control


function keyDownDirection(event) {
  if (event.key === 'w' || event.key === 'W') {
      directions.value[0] = 1;
  }

  if (event.key === 's' || event.key === 'S') {
      directions.value[0] = -1;
  }

  if (event.key === 'd' || event.key === 'd') {
      directions.value[1] = 1;
  }

  if (event.key === 'a' || event.key === 'A') {
      directions.value[1] = -1;
  }

  if (event.key === 'e' || event.key === 'E') {
      directions.value[2] = 1;
  }

  if (event.key === 'q' || event.key === 'Q') {
    directions.value[2] = -1;
  }

  if (event.key === 'l' || event.key === 'L') {
      directions.value[3] = 1;
  }

  if (event.key === 'k' || event.key === 'K') {
    directions.value[3] = -1;
  }

  if(!isRunning.value){
    isRunning.value = true;
    intervalId = setInterval(manualControl, 500);
  }
  
}

function keyUpDirection(event) {

  
  if ((event.key === 'w' || event.key === 'W') && directions.value[0] === 1) {
      directions.value[0] = 0;
  }

  if ((event.key === 's' || event.key === 's') && directions.value[0] === -1) {
    directions.value[0] = 0;
  }

  if ((event.key === 'd' || event.key === 'D') && directions.value[1] === 1) {
    directions.value[1] = 0;
  }

  if ((event.key === 'a' || event.key === 'A') && directions.value[1] === -1) {
    directions.value[1] = 0;
  }

  if ((event.key === 'e' || event.key === 'E') && directions.value[2] === 1) {
    directions.value[2] = 0;
  }

  if ((event.key === 'q' || event.key === 'Q') && directions.value[2] === -1) {
    directions.value[2] = 0;
  }

  if ((event.key === 'l' || event.key === 'L') && directions.value[3] === 1) {
    directions.value[3] = 0;
  }

  if ((event.key === 'k' || event.key === 'K') && directions.value[3] === -1) {
    directions.value[3] = 0;
  }

}


onMounted(() => {
  window.addEventListener('keydown', keyDownDirection);
  window.addEventListener('keyup', keyUpDirection);
});

/*watch(comandStore.statusEKF, (statusEKF) => {
  console.log(`Status EKF is ${statusEKF}`)
})

watch(comandStore.statusGPS, (statusGPS) => {
  console.log(`Status GPS is ${statusGPS}`)
})*/
</script>

<template>
  <div class="p-6 space-y-6">
    <JanusClient />
  </div>
  <div class="max-w-xl mx-auto p-6 space-y-6">
    <!-- Top Controls with Select -->
    <div class="flex justify-between gap-4 items-center">
      <div class="flex gap-2 items-center">
        <Button @click="changeMode">Change Mode</Button>
        <select v-model="selectedMode" class="border rounded px-2 py-1">
          <option value="GUIDED">Guided</option>
          <option value="STABILIZE">Stabilize</option>
          <option value="ALT_HOLD">Altitude Hold</option>
        </select>
      </div>

      <Button @click="changeDirectionType">Change type of direction</Button>
      <Button variant="destructive" @click="preArmSystem">PreArm Check</Button>
      <Button v-if="comandStore.isReadyToFly" variant="destructive" @click="armSystem">Arm</Button>
      <Button v-else variant="destructive" @click="armSystem">Can't Arm</Button>
    </div>

    <!-- Cardinal Controls with Diagonals -->
    <div class="grid grid-cols-5 gap-8 items-center justify-items-center">
      <!-- Top row: NW, North, NE -->
      <Button @click="handleClick([1,-1,0,0])">
        {{ isCardinal ? 'Northwest' : 'Forward Left' }}
      </Button>
      <div></div>
      <Button @click="handleClick([1,0,0,0])">
        {{ isCardinal ? 'North' : 'Forward' }}
      </Button>
      <div></div>
      <Button @click="handleClick([1,1,0,0])">
        {{ isCardinal ? 'Northeast' : 'Forward Right' }}
      </Button>

      <!-- Middle row: West, Input, East -->
      <div></div>
      <Button @click="handleClick([0,-1,0,0])">
        {{ isCardinal ? 'West' : 'Left' }}
      </Button>
      <Input
        v-model="numeroMetros"
        type="number"
        placeholder="Enter Value"
        min="0"
        max="100"
        class="text-center"
      />
      <Button @click="handleClick([0,1,0,0])">
        {{ isCardinal ? 'East' : 'Right' }}
      </Button>
      <div></div>

      <!-- Bottom row: SW, South, SE -->
      <Button @click="handleClick([-1,-1,0,0])">
        {{ isCardinal ? 'Southwest' : 'Back Left' }}
      </Button>
      <div></div>
      <Button @click="handleClick([-1,0,0,0])">
        {{ isCardinal ? 'South' : 'Back' }}
      </Button>
      <div></div>
      <Button @click="handleClick([-1,1,0,0])">
        {{ isCardinal ? 'Southeast' : 'Back Right' }}
      </Button>
    </div>

    <div v-if="!isCardinal" class="flex justify-center items-center gap-4 mt-4">
      <Input
        v-model="yaw"
        type="number"
        :min="-360"
        :max="360"
        placeholder="0 - 360"
        class="w-32 text-center"
      />
      <Button @click="sendYaw">Yaw</Button>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between gap-4">
      <Button variant="outline" @click="handleAction('Takeoff')">Takeoff</Button>
      <Button variant="outline" @click="handleAction('Land')">Land</Button>
    </div>

    <!-- Status -->
    <div class="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
      <div>
        <p><strong>Lat:</strong> {{ comandStore.metrics["lat"] ?? 'N/A'  }}</p>
        <p><strong>Lng:</strong> {{ comandStore.metrics["lng"] ?? 'N/A'}}</p>
        <p><strong>Alt:</strong> {{ comandStore.metrics["alt"] ?? 'N/A'}}</p>
        <p><strong>Vel X:</strong> {{ comandStore.metrics["velX"] ?? 'N/A'}}</p>
        <p><strong>Vel Y:</strong> {{ comandStore.metrics["velY"] ?? 'N/A'}}</p>
      </div>
      <div>
        <p><strong>Vel Z:</strong> {{ comandStore.metrics["velZ"] ?? 'N/A'}}</p>
        <p><strong>Battery:</strong> {{ comandStore.metrics["batLvL"] ?? 'N/A'}}%</p>
        <p><strong>Heading:</strong> {{ comandStore.metrics["hdg"] ?? 'N/A'}}</p>
        <p><strong>Satellites:</strong> {{ comandStore.metrics["satCount"] ?? 'N/A'}}</p>
        <p><strong>Traveling:</strong> {{ comandStore.metrics["isTraveling"] ? 'Yes' : 'No' }}</p>
      </div>
      <div>
        <p><strong>Flying:</strong> {{ comandStore.metrics["isFlyng"] ? 'Yes' : 'No' }}</p>
        <p><strong>X:</strong> {{ comandStore.metrics["X"] ?? 'N/A'}} M</p>
        <p><strong>Y:</strong> {{ comandStore.metrics["Y"] ?? 'N/A'}} M</p>
        <p><strong>Z:</strong> {{ comandStore.metrics["Z"] ?? 'N/A'}} M</p>
      </div>
    </div>

    <div class="mt-8 border-t pt-6">
      <h2 class="text-xl font-semibold mb-4">
        {{ comandStore.isReadyToFly ? '✅ Ready to Fly' : '❌ Not Ready' }}
      </h2>
      <!--<div class="grid grid-cols-2 gap-4 text-sm">
        <div><strong>Velocity_horiz:</strong> {{ (( comandStore.statusEKF & (1 << 1)) !== 0) ? 'OK' : 'Error' }}</div>
        <div><strong>velocity_vert:</strong> {{ (( comandStore.statusEKF & (1 << 2)) !== 0) ? 'OK' : 'Error' }}</div>
        <div><strong>pos_horiz_abs or pos_horiz_rel :</strong> {{ (( comandStore.statusEKF & (1 << 3)) !== 0) ? 'OK' : 'Error' }}</div>
        <div><strong>pos_vert_abs or pos_vert_agl:</strong> {{ (( comandStore.statusEKF & (1 << 5)) !== 0) ? 'OK' : 'Error' }}</div>
        <div><strong>GPS Status:</strong> {{ (( comandStore.statusEKF & (1 << 10)) !== 0) ? 'Error' : 'OK' }}</div>
        <div><strong>Accel_error:</strong> {{ (( comandStore.statusEKF & (1 << 11)) !== 0) ? 'Error' : 'OK' }}</div>
      </div>-->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Flight mode: </strong> {{ comandStore.modeDrone }}
        </div>
        <div v-for="(label) in comandStore.sensorsUsed" :key="label">
          <strong>{{ label }}:</strong> {{ comandStore.sensorsHealth[label] ? 'OK' : 'Error' }}
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100vh;
}

.cardinal-buttons {
display: flex;
justify-content: center;
align-items: center;
}

.direction-btn {
margin: 10px;
padding: 15px;
font-size: 18px;
cursor: pointer;
border: 2px solid #000;
background-color: #f0f0f0;
}

.input-box {
width: 80px;
padding: 10px;
margin: 0 20px;
text-align: center;
font-size: 18px;
border: 2px solid #000;
}

.horizontal-buttons {
display: flex;
justify-content: center;
align-items: center;
margin-top: 20px;
}

.action-btn {
margin: 10px;
padding: 15px;
font-size: 18px;
cursor: pointer;
border: 2px solid #000;
background-color: #c0c0c0;
}

.north {
background-color: lightblue;
}

.south {
background-color: lightcoral;
}

.west {
background-color: lightgreen;
}

.east {
background-color: lightyellow;
}

.takeoff {
background-color: lightgreen;
}

.land {
background-color: lightcoral;
}

.top-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.control-btn {
  margin: 0 10px;
  padding: 12px 20px;
  font-size: 16px;
  background-color: #d3d3d3;
  border: 2px solid #000;
  cursor: pointer;
}
</style>