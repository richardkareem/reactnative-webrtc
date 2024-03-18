import { View, Text, TextInput, Button } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import SocketIOClient from 'socket.io-client'; // import socket io

const SocketScreen = () => {
    const [callerId] = useState(Math.floor(10 + Math.random() * 900000).toString())
    const [value, setValue] = useState('');

    const socket = SocketIOClient('http://10.1.3.221:8000', {
        transports: ['websocket'],
        query: {
            callerId,
            /* We have generated this `callerId` in `JoinScreen` implementation */
        },
    });


    const sendMessage = ()=>{
        socket.emit('message', {callerId: callerId, value:value})
    }

    useEffect(()=>{
        socket.on('message', data =>{
            console.log("message from another user: "+ callerId+ " ", data);
        })

    },[])

    return (
        <View>
            <TextInput onChangeText={(e)=> setValue(e)} value={value} placeholder='Input Message' style={{ borderColor: "#000", borderWidth: 1 }} />
            <Button onPress={sendMessage} title='Send' />
        </View>
    )
}

export default SocketScreen