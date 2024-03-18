/* eslint-disable no-unused-vars */
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
    const [offering, setOffering] = useState(null)
    const [localMediaStream, setLocalMediaStream] = useState(null);
    const remoteStreams = useRef(new MediaStream());
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
        setOffering(sessionDescription)
        // console.log({ sessionDescription });
        socket.emit('livestream', {
            callerId: callerId,
            rtcMessage: sessionDescription
        })

        if (localStream) {
            socket.emit('message', {
                calleId: callerId,
                value: localStream
            })
        }

        setStatus('DETAIL_STREAMING_SCREEN')

        // navigation.navigate("DetailStreamingScreen", {
        //     localStream: localStream,
        //     setLocalStream: setLocalStream,
        //     setIsOnStreaming: setIsOnStreaming,
        // })
    }
    /***----------------------------------------------------------------- ****/

    /**
     * @ANSWER
     */

    const remoteRTC = useRef(null);

    const processAnswer = async () => {
        // set the desc
   
        if (remoteRTCMessage.current) {
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(remoteRTCMessage.current)
            )
            console.log('accept the answers');
            const sessionDescription = await peerConnection.current.createAnswer(); //SDP ANSWERS YANG DIKIRIM 
            await peerConnection.current.setLocalDescription(sessionDescription);
            socket.emit('joinlive', { calleId: callerId, rtcMessage: sessionDescription })
        }

        setStatus('DETAIL_STREAMING_SCREEN')

        // navigation.navigate('DetailStreamingScreen', {
        //     remoteStream,
        //     setRemoteStream: setRemoteStream,
        // })

    }



    const otherUserId = useRef(null);
    const mediaStream = useRef(
        new MediaStream()
    );


    useEffect(() => {

        socket.on('newlivestream', (data) => {
            otherUserId.current = data.callerId
            remoteRTCMessage.current = data.value;
            setIsOnStreaming(true)
        })

        socket.on('message', data => {
            const value = data.value
            console.log('masuk listener message: ', {remoteStream: data?.value});
            remoteRTC.current = value
        })

        socket.on('joinlive', data =>{
            console.log('JOIN LIVE');
            let viewer = data.viewer;
            remoteRTCMessage.current = data.rtcMessage
            console.log({VIEWER: viewer});
            otherUserId.current = data.viewer
            peerConnection.current.setRemoteDescription(
                new RTCSessionDescription( remoteRTC.current )
            )
        })

        socket.on('ICEcandidatels', data => {
            console.log({ dataICECandidate: data });
            let message = data.rtcMessage;
            console.log("MASUK ICE CANDIDATELS: ", data);
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
                   
                    const track = stream.getTracks();
                    track.forEach(track =>{
                        peerConnection.current.addTrack(track, stream)
                    })
                    // peerConnection.current.addStream(stream);
                })
                .catch(error => {
                    // Log error
                    console.log('error media Devices: ',error);
                });
        })

        peerConnection.current.onaddstream = event => {
            console.log('MASUK ONADDSTREAM METHOD: ',event.stream);
            setRemoteStream(event.stream);
          };

        // peerConnection.current.ontrack = event => {
        //     console.log('Track added:', event.track);
           
        //   };

        // peerConnection.current.ontrack = e =>{
        //     console.log('event ontrack berjjalan');
        //     setRemoteStream(e.streams[0])
        // }



        // Setup ice handling
        peerConnection.current.onicecandidate = event => {
            console.log('ONICECANDIDATE: ', event);
            if (event.candidate) {
                console.log('event candidate: ', event);
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



        // return () => {
        //     socket.off('newlivestream')
        //     socket.off('message')
        // }


    }, [])

    const sendICEcandidate = (data)=>{
        socket.emit('ICEcandidatels', data)
    }

    


    useEffect(()=>{
        peerConnection.current.ontrack = e =>{
            console.log('ONTRACK EVENT DIPANGGIL: ', e);
            
            // console.log();
        }
    },[peerConnection.current])


    



    // useEffect(()=>{
    // //   mediaStream.current.getTracks().forEach(track =>{
    
    // //   })
    // // //   console.log(mediaStream.current);
    // //   console.log({localStream: localStream._tracks});
    // },[localStream])

    const onTracks = () =>{
        console.log(remoteRTC.current);
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
                            <TouchableOpacity onPress={processAnswer} style={styles.square} />
    
                        </View>
                    }
    
                    <Button
                     style={{bottom: 0, postion:"absolute"}}
                     title='console'
                     onPress={onTracks} 
                    />
    
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