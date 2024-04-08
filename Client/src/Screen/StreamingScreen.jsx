/* eslint-disable no-unused-vars */
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SocketIOClient from 'socket.io-client'; // import socket io

import {
    mediaDevices,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
    MediaStreamTrack,
} from 'react-native-webrtc';

import { LogBox } from 'react-native';
import IP from '../utils/ip';
import DetailStreamingComponent from '../Compoent/DetailStreamingComponent';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const StreamingScreen = ({ navigation }) => {
    const [callerId] = useState(Math.floor(100000 + Math.random() * 900000).toString())
    const [isOnStreaming, setIsOnStreaming] = useState(false);
    const socket = SocketIOClient(`http://${IP.kantor}:8000`, {
        transports: ['websocket'],
        query: {
            callerId,
            /* We have generated this `callerId` in `JoinScreen` implementation */
        },
    });

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [status, setStatus] = useState('')
    /** 
     * @PEERCONNECTION 
     * **/

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
            iceCandidatePoolSize: 10,
        }),
    );

    let remoteRTCMessage = useRef(null);
    /***
     * @OFFER
     * ## DISINI OFFER DIIKIRIM MENGGUNAKAN SIGNAL KE DEVICE TUJUAN
     */
    const handleNav = async () => {
        // create offer
        const sessionDescription = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(sessionDescription);
        socket.emit('livestream', {
            callerId: callerId,
            rtcMessage: sessionDescription
        })
    }
    /***----------------------------------------------------------------- ****/

    /**
     * @ANSWER
     */
    const processAnswer = async () => {
        // set the desc
        if (remoteRTCMessage.current) {
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(remoteRTCMessage.current)
            )
    
            const sessionDescription = await peerConnection.current.createAnswer(); //SDP ANSWERS YANG DIKIRIM 
            
            await peerConnection.current.setLocalDescription(sessionDescription);
            socket.emit('joinlive', { calleId: callerId, rtcMessage: sessionDescription })
            setStatus('DETAIL_STREAMING_SCREEN')
        }

    }
    const otherUserId = useRef(null);

    useEffect(() => {

        socket.on('newlivestream', (data) => {
            let value = data.rtcMessage;
            const viewer = data.callerId;

            otherUserId.current = viewer;
            remoteRTCMessage.current = value;
            setIsOnStreaming(true)
        })

        socket.on('joinlive', data =>{
            let viewer = data.viewer;
            let rtcMessage = data.rtcMessage;
            remoteRTCMessage.current = rtcMessage;
            
            
            otherUserId.current = viewer;
            peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(rtcMessage)
            )
           
            setStatus('DETAIL_STREAMING_SCREEN')
        })

        socket.on('ICEcandidatels', data => { 
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

        /**
         * @MEDIADEVICE
         */
        mediaDevices.enumerateDevices().then(sourceInfos => {
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (
                    sourceInfo.kind == 'videoinput' &&
                    sourceInfo.facing == ('user')
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
                        facingMode: 'user',
                        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
                    },
                })
                .then(stream => {
                    // Got stream!

                    setLocalStream(stream);
                   //INI YANG TERBARU
                    const track = stream.getTracks();
                    track.forEach(track =>{
                        peerConnection.current.addTrack(track, stream)
                    })
                    // peerConnection.current.addStream(stream);
                })
                .catch(error => {
                    // Log error
                });
        })

       

        peerConnection.current.ontrack = event => {
            setRemoteStream(curr => event.streams[0])
          };


        // Setup ice handling
        peerConnection.current.onicecandidate = event => { // kemarin ga aman skrng udah aman
            // console.log('MASUK IN ICE CANDIDATE');
            if (event.candidate) {
                // console.log('event candidate: ', event);
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
            socket.off('newlivestream')
            socket.off('message')
        }


    }, [])

    const sendICEcandidate = (data)=>{
        socket.emit('ICEcandidatels', data)
    }
    switch (status) {
        case "DETAIL_STREAMING_SCREEN":
            return <DetailStreamingComponent localStream={localStream} remoteStream={remoteStream}  />
        default:
            return (
                <SafeAreaView style={styles.screen}>
                <View style={styles.wp}>
                    <Text style={[styles.text, { textAlign: "center" }]}>StreamingScreen ID: {callerId}</Text>
                    {!isOnStreaming ? <View style={styles.wpCircle}>
                        <TouchableOpacity onPress={handleNav} style={styles.circle} />
                        <Text style={styles.text}>Start Stream</Text>
                    </View> :
                        <View style={styles.wpCircle}>
                            <TouchableOpacity onPress={()=>{
                               processAnswer().then(()=>{})
                            }} style={styles.square} />
    
                        </View>
                    }
                </View>
            </SafeAreaView>
            )

    }

   
}

export default StreamingScreen

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#313131",
    },
    text: {
        color: "#f4f4f4",
        fontFamily: "Poppins",
        fontWeight: "600",
        fontSize: 12
    },
    circle: {
        borderRadius: 32,
        width: 32,
        height: 32,
        backgroundColor: "#888888",
    },
    wp: {
        paddingHorizontal: 8
    },
    wpCircle: {
        flexDirection: "row", gap: 8, alignSelf: "center", marginTop: 64, alignItems: "center"
    },
    square: {
        backgroundColor: '#8888',
        width: 64,
        height: 64,

    }
})