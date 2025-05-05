<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useComandStore } from '@/stores/comand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import JanusClient from '@/components/JanusClient.vue'

const comandStore = useComandStore();
const numeroMetros = ref(0);

const handleClick = (direction) =>{
    //console.log("direction: " + direction);
    //console.log("metros para andar: " + numeroMetros.value);
    comandStore.sendMoveLocalMessage(direction,numeroMetros.value)
}

const handleAction = (action) =>{
    if(action == 'Takeoff'){
        comandStore.sendTakeoffMessage()
    }else if (action == 'Land'){
        comandStore.sendLandMessage()
    }
    
}

const changeMode = () =>{
  comandStore.sendChangeModeMessage("ALT_HOLD");
}

const armSystem = () =>{
  comandStore.sendArmDroneMessage();
}



//fazer a função para controlar manualmente e variaveis necessarias


const directions = ref([0,0,0,0]); //frente,tras,direita,esquerda,cima,baixo
const yaw = ref(0);
//const elapsedTime = ref(0); // Elapsed time in milliseconds
const isRunning = ref(false);
let intervalId = null;

// Start the stopwatch
/*const startStopwatch = () => {
  if (!isRunning.value) {
    isRunning.value = true;
    startTime.value = Date.now() - elapsedTime.value; // Account for paused time
    intervalId = setInterval(updateElapsedTime, 10);
  }
};*/

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



/*function keyDownDirection(event) {
  if (event.key === 'w' || event.key === 'W') {
      directions.value[0] = true;
      directions.value[1] = false;
  }

  if (event.key === 's' || event.key === 'S') {
      directions.value[1] = true;
      directions.value[0] = false;
  }

  if (event.key === 'd' || event.key === 'd') {
      directions.value[2] = true;
      directions.value[3] = false;
  }

  if (event.key === 'a' || event.key === 'A') {
      directions.value[3] = true;
      directions.value[2] = false;
  }

  if (event.key === 'e' || event.key === 'E') {
      directions.value[4] = true;
      directions.value[5] = false;
  }

  if (event.key === 'q' || event.key === 'Q') {
      directions.value[5] = true;
      directions.value[4] = false;
  }

  intervalId = setInterval(manualControl, 500);
}*/

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

/*function keyUpDirection(event) {

  let isRunning = null;
  if (event.key === 'w' || event.key === 'W') {
      directions.value[0] = false;
  }

  if (event.key === 's' || event.key === 's') {
      directions.value[1] = false;
  }

  if (event.key === 'd' || event.key === 'D') {
      directions.value[2] = false;
  }

  if (event.key === 'a' || event.key === 'A') {
      directions.value[3] = false;
  }

  if (event.key === 'e' || event.key === 'E') {
      directions.value[4] = false;
  }

  if (event.key === 'q' || event.key === 'Q') {
      directions.value[5] = false;
  }

  directions.value.forEach(element => {
    if(element = true){
      isRunning = true;
    }
  });

  if (!isRunning){
    clearInterval(intervalId);
  }
}*/

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

  /*let keyPressed = false;

  directions.value.forEach(element => {
    if(element == 1 || element == -1){
      keyPressed = true;
    }
  });

  
  if (!keyPressed){
    stop();
    //clearInterval(intervalId);
  }*/
}


onMounted(() => {
  window.addEventListener('keydown', keyDownDirection);
  window.addEventListener('keyup', keyUpDirection);
});

</script>

<template>
  <div class="p-6 space-y-6">
    <JanusClient />
  </div>
  <div class="max-w-xl mx-auto p-6 space-y-6">
    <!-- Top Controls -->
    <div class="flex justify-between gap-4">
      <Button @click="changeMode">Change Mode</Button>
      <Button variant="destructive" @click="armSystem">Arm</Button>
    </div>

    <!-- Cardinal Controls -->
    <div class="grid grid-cols-3 gap-4 items-center justify-items-center">
      <div></div>
      <Button @click="handleClick('North')">North</Button>
      <div></div>

      <Button @click="handleClick('West')">West</Button>

      <Input
        v-model="numeroMetros"
        type="number"
        placeholder="Enter Value"
        min="0"
        max="100"
        class="text-center"
      />

      <Button @click="handleClick('East')">East</Button>

      <div></div>
      <Button @click="handleClick('South')">South</Button>
      <div></div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between gap-4">
      <Button variant="outline" @click="handleAction('Takeoff')">Takeoff</Button>
      <Button variant="outline" @click="handleAction('Land')">Land</Button>
    </div>

    <!-- Status -->
    <div class="text-sm text-muted-foreground">
      <p><strong>Message Ack:</strong> {{ comandStore.messages }}</p>
      <p><strong>Teste Ack:</strong> {{ directions }}</p>
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