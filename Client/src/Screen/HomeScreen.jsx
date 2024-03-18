/* eslint-disable no-unused-vars */
import { Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import TextInputContainer from '../Compoent/TextInputContainer';
import { Ionicons } from 'react-native-vector-icons/Ionicons'

import SocketIOClient from 'socket.io-client'; // import socket io
// import WebRTC 
import {
    mediaDevices,
    RTCPeerConnection,
    RTCView,
    RTCIceCandidate,
    RTCSessionDescription,
} from 'react-native-webrtc';
import JoinScreen from '../Compoent/JoinScreen';
import OutgoingCallScreen from '../Compoent/OutgoingCallScreen';
import IncomingCallScreen from '../Compoent/IncomingCallScreen';
import WebRtcRoomScreen from '../Compoent/WebrtcRoomScreen';


const HomeScreen = () => {

    const [type, setType] = useState('JOIN');

    const [callerId] = useState(
        Math.floor(100000 + Math.random() * 900000).toString(),
    );

    const otherUserId = useRef(null);

    /**  
     * @Step8
    ***/
    // Handling Mic status
    const [localMicOn, setlocalMicOn] = useState(true);

    // Handling Camera status
    const [localWebcamOn, setlocalWebcamOn] = useState(true);

    // Switch Camera
    function switchCamera() {
        localStream.getVideoTracks().forEach((track) => {
            track._switchCamera();
        });
    }

    // Enable/Disable Camera
    function toggleCamera() {
        localWebcamOn ? setlocalWebcamOn(false) : setlocalWebcamOn(true);
        localStream.getVideoTracks().forEach((track) => {
            localWebcamOn ? (track.enabled = false) : (track.enabled = true);
        });
    }

    // Enable/Disable Mic
    function toggleMic() {
        localMicOn ? setlocalMicOn(false) : setlocalMicOn(true);
        localStream.getAudioTracks().forEach((track) => {
            localMicOn ? (track.enabled = false) : (track.enabled = true);
        });
    }




    // -* ---------------------------------------------------------------------- *-
    // Stream of local user
    const [localStream, setlocalStream] = useState(null);

    /* When a call is connected, the video stream from the receiver is appended to this state in the stream*/
    const [remoteStream, setRemoteStream] = useState(null);

    // This establishes your WebSocket connection
    // 10.1.3.221 ipv4
    const socket = SocketIOClient('http://10.1.3.221:8000', {
        transports: ['websocket'],
        query: {
            callerId,
            /* We have generated this `callerId` in `JoinScreen` implementation */
        },
    });

    /* This creates an WebRTC Peer Connection, which will be used to set local/remote descriptions and offers. */
    const peerConnection = useRef(
        new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302',
                },
                {
                    urls: 'stun:stun1.l.google.com:19302',
                },
                {
                    urls: 'stun:stun2.l.google.com:19302',
                },
            ],
        }),
    );

    let remoteRTCMessage = useRef(null);
        console.log({otherUserId: otherUserId.current});
    useEffect(() => {
        socket.on('newCall', data => {
            remoteRTCMessage.current = data.rtcMessage;
            otherUserId.current = data.callerId;
            setType('INCOMING_CALL');
            console.log();
          
        });

        socket.on('callAnswered', data => {
            remoteRTCMessage.current = data.rtcMessage;
            peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(remoteRTCMessage.current),
            );
            setType('WEBRTC_ROOM');
        });

        socket.on('ICEcandidate', data => {
            let message = data.rtcMessage;

            if (peerConnection.current) {
                peerConnection?.current
                    .addIceCandidate(
                        new RTCIceCandidate({
                            candidate: message.candidate,
                            sdpMid: message.id,
                            sdpMLineIndex: message.label,
                        }),
                    )
                    .then(data => {
                        console.log('SUCCESS');
                    })
                    .catch(err => {
                        console.log('Error', err);
                    });
            }
        });

        let isFront = false;

        mediaDevices.enumerateDevices().then(sourceInfos => {
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (
                    sourceInfo.kind == 'videoinput' &&
                    sourceInfo.facing == (isFront ? 'user' : 'environment')
                ) {
                    videoSourceId = sourceInfo.deviceId;
                }
            }

            mediaDevices
                .getUserMedia({
                    audio: true,
                    video: {
                        mandatory: {
                            minWidth: 500, // Provide your own width, height and frame rate here
                            minHeight: 300,
                            minFrameRate: 30,
                        },
                        facingMode: isFront ? 'user' : 'environment',
                        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
                    },
                })
                .then(stream => {
                    // Got stream!

                    setlocalStream(stream);

                    // setup stream listening
                    peerConnection.current.addStream(stream);
                })
                .catch(error => {
                    // Log error
                });
        });

      

        // Setup ice handling
        peerConnection.current.onicecandidate = event => {
            if (event.candidate) {
                sendICEcandidate({
                    calleeId: otherUserId.current,
                    rtcMessage: {
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate,
                    },
                });
            } else {
                console.log('End of candidates.');
            }
        };

        return () => {
            socket.off('newCall');
            socket.off('callAnswered');
            socket.off('ICEcandidate');
        };
    }, []);

    const consolePeer = ()=>{
        console.log("uhuy");
          peerConnection.current.onaddstream = event => {
            console.log('on add stream: ', event);
            setRemoteStream(event.stream);
        };
    }

    // Destroy WebRTC Connection
    function leave() {

        closeCall();


        socket.on('closeCall',  data =>{
            if(data.sender == callerId){
                console.log("masuk End Call");
                peerConnection.current.close();
                setType('JOIN')
                setlocalStream(null);
            }
        } )
        setType('JOIN')
        setlocalStream(null);
        peerConnection.current.close();
    }


    function closeCall (){
        socket.emit('closeCall', {
            callerId : callerId,

        })
    }


    async function processCall() {
        // 1. Alice runs the `createOffer` method for getting SDP.
        const sessionDescription = await peerConnection.current.createOffer();

        // 2. Alice sets the local description using `setLocalDescription`.
        await peerConnection.current.setLocalDescription(sessionDescription);

        // 3. Send this session description to Bob uisng socket

        // console.log('session', sessionDescription);
        sendCall({
            calleeId: otherUserId.current,
            rtcMessage: sessionDescription,
        });


    }
    async function processAccept() {
        // 4. Bob sets the description, Alice sent him as the remote description using `setRemoteDescription()`
        peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(remoteRTCMessage.current)
        );

        // 5. Bob runs the `createAnswer` method
        const sessionDescription = await peerConnection.current.createAnswer();

        // 6. Bob sets that as the local description and sends it to Alice
        await peerConnection.current.setLocalDescription(sessionDescription);
        answerCall({
            callerId: otherUserId.current,
            rtcMessage: sessionDescription,
        });
    }

    function answerCall(data) {
        socket.emit("answerCall", data);
    }

    function sendCall(data) {
        socket.emit("call", data);
        // socket.emit()
    }


  

    switch (type) {
        case 'JOIN':
            return <JoinScreen callerId={callerId} otherUserId={otherUserId} setType={setType} processCall={processCall} consolePeer={consolePeer} />
        case 'INCOMING_CALL':
            return <IncomingCallScreen otherUserId={otherUserId} setType={setType} processAccept={processAccept} />
        case 'OUTGOING_CALL':
            return <OutgoingCallScreen otherUserId={otherUserId} setType={setType} />
        case 'WEBRTC_ROOM':
            return <WebRtcRoomScreen RTCView={RTCView} leave={leave} localMicOn={localMicOn} localStream={localStream} localWebcamOn={localWebcamOn} remoteStream={remoteStream} setlocalStream={setlocalStream} switchCamera={switchCamera} toggleCamera={toggleCamera} toggleMic={toggleMic} />
        default:
            return null;
    }



}





export default HomeScreen

