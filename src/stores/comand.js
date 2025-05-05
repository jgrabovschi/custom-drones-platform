import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'


export const useComandStore = defineStore('comand', () => {
    
    const socket = inject('socket')

    const messages = ref("")

    const manualControlDirectionsSent = ref([0,0,0,0])
    
    /*const sendMessageToChat = (message) => {
        storeError.resetMessages()
        socket.emit('chatMessage', message)
    }*/

    const sendTakeoffMessage = () =>{
        /*socket.emit('takeoff',{
            type: "takeoff"
        });*/
        socket.emit('message',{
            type: "takeoff"
        });
    }

    const sendLandMessage = () =>{
        /*socket.emit('land',{
            type: "land"
        });*/
        socket.emit('message',{
            type: "land"
        });
    }

    const sendMoveLocalMessage = ( direction, metros) =>{
        /*socket.emit('moveLocal', {
            type: "moveLocal",
            direction: direction,
            metros: metros
        });*/
        socket.emit('message', {
            type: "moveLocal",
            direction: direction,
            metros: metros
        });
    }

    const sendChangeModeMessage = ( mode) =>{
        /*socket.emit('changeMode', {
            type: "changeMode",
            mode: mode,
        });*/
        socket.emit('message', {
            type: "changeMode",
            data: {
                mode: mode,
            }
        });
    }

    const sendArmDroneMessage = ( ) =>{
        /*socket.emit('armDrone', {
            type: "armDrone",
        });*/
        socket.emit('message', {
            type: "armDrone",
        });
    }

    const sendManualControlMessage = (directions) =>{
        console.log("mandar mensagem")
        /*if(manualControlDirectionsSent.value[0] != directions[0] ||
            manualControlDirectionsSent.value[1] != directions[1] ||
            manualControlDirectionsSent.value[2] != directions[2] ||
            manualControlDirectionsSent.value[3] != directions[3]){

                manualControlDirectionsSent.value[0] = directions[0];
                manualControlDirectionsSent.value[1] = directions[1];
                manualControlDirectionsSent.value[2] = directions[2];
                manualControlDirectionsSent.value[3] = directions[3];

                socket.emit('manualControl', {
                    directions: directions
                });
        }*/

        manualControlDirectionsSent.value[0] = directions[0];
        manualControlDirectionsSent.value[1] = directions[1];
        manualControlDirectionsSent.value[2] = directions[2];
        manualControlDirectionsSent.value[3] = directions[3];
        console.log("mandei nova mensagem")
        /*socket.emit('manualControl', {
            type: "manualControl",
            directions: directions
        });*/
        socket.emit('message', {
            type: "manualControl",
            data: {
                directions: directions
            }

        });
        
        
    }

    socket.on('ackMessage', (message) => {
        messages.value = "";
        messages.value = message;
    })

    return {
        messages, sendTakeoffMessage, sendLandMessage, sendMoveLocalMessage,sendManualControlMessage,
        manualControlDirectionsSent, sendChangeModeMessage, sendArmDroneMessage
    }
})