import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'


export const useComandStore = defineStore('comand', () => {
    
    const socket = inject('socket')

    const messages = ref("")

    const statusGPS = ref(null);
    const statusEKF = ref(null);
    const isReadyToFly = ref(false);
    const x = ref(0);
    const y = ref(0);
    const z = ref(0);

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

    const sendMoveLocalCardinalMessage = ( direction, metros) =>{
        /*socket.emit('moveLocal', {
            type: "moveLocal",
            direction: direction,
            metros: metros
        });*/
        socket.emit('message', {
            type: "moveLocalCardinal",
            data: {
                direction: direction,
                metros: metros
            }
            
        });
    }
    const sendMoveLocalMessage = ( direction, metros) =>{
        
        socket.emit('message', {
            type: "moveLocal",
            data: {
                direction: direction,
                metros: metros
            }
            
        });
    }
    const sendYawMessage = (yaw) =>{
        
        socket.emit('message', {
            type: "yaw",
            data: {
                yaw: yaw,
            }
            
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
    
    const sendPreArmCheckDroneMessage = ( ) =>{
    
        socket.emit('message', {
            type: "preArmCheck",
        });
    }
    const sendArmDroneMessage = ( ) =>{
        /*socket.emit('armDrone', {
            type: "armDrone",
        });*/
        socket.emit('message', {
            type: "armDrone",
        });
        /*socket.emit('message', {
            type: "preArmCheck",
        });*/
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

    socket.on('PreArmCheck', (message) => {
        console.log("mandei nova mensagem de prearm")
        messages.value = "";
        messages.value = message;
        statusEKF.value = message['EKF'];
        statusGPS.value = message['GPS'];
        console.log("ekf:", statusEKF.value);
        console.log("GPS:", statusGPS.value);
        isReadyToFly.value = checkIfIsReadyToFly(statusEKF.value, statusGPS.value)

        
    })

    socket.on('infoCoordenadas', (message) => {
        
        x.value = ""
        x.value = message['x'];
        y.value = ""
        y.value = message['y'];
        z.value = ""
        z.value = message['z'];
        

        
    })
    

    function checkIfIsReadyToFly(statusEKF, statusGPS){

        for (let i = 0; i < 12; i++) {
            if ((statusEKF & (1 << i)) !== 0) {
              //console.log(`Bit at position ${i} is 1`);
              //console.log(i)
              //console.log(enumEKF(i))
            }
        }
            if ((statusEKF & (1 << 0)) &&  // attitude
            (statusEKF & (1 << 1)) &&  // velocity_horiz
            (statusEKF & (1 << 2)) &&  // velocity_vert
            //(statusEKF & ((1 << 3) | (1 << 4))) &&  // pos_horiz_abs OR pos_horiz_rel
            //(statusEKF & ((1 << 5) | (1 << 6))) &&  // pos_vert_abs OR pos_vert_agl
            !(statusEKF & (1 << 10)) &&  // gps_glitch
            !(statusEKF & (1 << 11)))    // accel_error
        {
            if(statusGPS >= 3){
                return true;
            }
        }

        return false;
    }

    function enumEKF(flag){
        switch(flag){
            case 0:
                return "ESTIMATOR_ATTITUDE";
            case 1:
                return "ESTIMATOR_VELOCITY_HORIZ";
            case 2:
                return "ESTIMATOR_VELOCITY_VERT";
            case 3:
                return "ESTIMATOR_POS_HORIZ_REL";
            case 4:
                return "ESTIMATOR_POS_HORIZ_ABS";
            case 5:
                return "ESTIMATOR_POS_VERT_ABS";
            case 6:
                return "ESTIMATOR_POS_VERT_AGL";
            case 7:
                return "ESTIMATOR_CONST_POS_MODE";
            case 8:
                return "ESTIMATOR_PRED_POS_HORIZ_REL";
            case 9:
                return "ESTIMATOR_PRED_POS_HORIZ_ABS";
            case 10:
                return "ESTIMATOR_GPS_GLITCH";
            case 11:
                return "ESTIMATOR_ACCEL_ERROR";
        }
    }


    return {
        messages, sendTakeoffMessage, sendLandMessage, sendMoveLocalCardinalMessage,sendManualControlMessage,
        manualControlDirectionsSent, sendChangeModeMessage, sendArmDroneMessage,sendMoveLocalMessage, sendYawMessage,
        statusEKF, statusGPS, isReadyToFly, enumEKF, sendPreArmCheckDroneMessage,x,y,z
    }
})