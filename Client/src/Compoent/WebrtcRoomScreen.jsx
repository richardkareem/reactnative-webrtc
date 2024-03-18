import { View } from 'react-native'
import React from 'react'
import IconContainer from './IconContainer';
import Entypo from 'react-native-vector-icons/Entypo'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Feather from 'react-native-vector-icons/Feather'

const WebRtcRoomScreen = ({localStream, setlocalStream, localMicOn, localWebcamOn,  leave, remoteStream, toggleMic, toggleCamera, switchCamera, RTCView}) => {
    return (

        <View
            style={{
                flex: 1,
                backgroundColor: "#050A0E",
                paddingHorizontal: 12,
                paddingVertical: 12,
            }}
        >
            {localStream ? (
                <RTCView
                    objectFit={"cover"}
                    style={{ flex: 1, backgroundColor: "#050A0E" }}
                    streamURL={localStream.toURL()}
                />
            ) : null}
            {remoteStream ? (
                <RTCView
                    objectFit={"cover"}
                    style={{
                        flex: 1,
                        backgroundColor: "#050A0E",
                        marginTop: 8,
                    }}
                    streamURL={remoteStream.toURL()}
                />
            ) : null}
            <View
                style={{
                    marginVertical: 12,
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                }}
            >
                {/* end Call */}
                <IconContainer
                    backgroundColor={"red"}
                    onPress={() => {
                        leave();
                        setlocalStream(null);
                    }}
                    Icon={() => {
                        return <SimpleLineIcons name="call-end" size={26} fill="#FFF" />;
                    }}
                />
                <IconContainer
                    style={{
                        borderWidth: 1.5,
                        borderColor: "#2B3034",
                    }}
                    backgroundColor={!localMicOn ? "#fff" : "transparent"}
                    onPress={() => {
                        toggleMic();
                    }}
                    Icon={() => {
                        return localMicOn ? (
                            <Feather name="mic" size={24} fill="#FFF" />
                        ) : (
                            <Feather name="mic-off" size={24} fill="#1D2939" />
                        );
                    }}
                />
                <IconContainer
                    style={{
                        borderWidth: 1.5,
                        borderColor: "#2B3034",
                    }}
                    backgroundColor={!localWebcamOn ? "#fff" : "transparent"}
                    onPress={() => {
                        toggleCamera();
                    }}
                    Icon={() => {
                        return localWebcamOn ? (
                            <Feather name="video" size={24} fill="#FFF" />
                        ) : (
                            <Feather name="video-off" size={24} fill="#1D2939" />
                        );
                    }}
                />
                <IconContainer
                    style={{
                        borderWidth: 1.5,
                        borderColor: "#2B3034",
                    }}
                    backgroundColor={"transparent"}
                    onPress={() => {
                        switchCamera();
                    }}
                    Icon={() => {
                        return <Entypo size={24} fill="#FFF" />;
                    }}
                />
            </View>
        </View>

    )
}

export default WebRtcRoomScreen
