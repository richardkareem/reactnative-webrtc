import { Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'

const IncomingCallScreen = ({ otherUserId, setType, processAccept }) => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'space-around',
                backgroundColor: '#050A0E',
            }}>
            <View
                style={{
                    padding: 35,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 14,
                }}>
                <Text
                    style={{
                        fontSize: 36,
                        marginTop: 12,
                        color: '#ffff',
                    }}>
                    {otherUserId.current} is calling..
                </Text>
            </View>
            <View
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <TouchableOpacity
                    onPress={() => {
                        processAccept();
                        setType('WEBRTC_ROOM');
                    }}
                    style={{
                        backgroundColor: 'green',
                        borderRadius: 30,
                        height: 60,
                        aspectRatio: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Ionicons name="call" size={24} fill="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default IncomingCallScreen