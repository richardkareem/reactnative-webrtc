import React, { useState } from 'react';
import {
    Button,
    SafeAreaView,
    StyleSheet,
    View,
    Dimensions,
} from 'react-native';
import {
    RTCView,
} from 'react-native-webrtc';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const { height, width } = Dimensions.get('window')
const HEIGHT_VIDEO = height / 2 - 32;
const DetailStreamingComponent = ({ localStream, remoteStream }) => {
    const [stream, setStream] = useState(false)
    const start = async () => {
        if (!stream) {
            setStream(true)
        }
    };
    const stop = () => {
        if (stream) {
            setStream(false);
        }
    };
    console.log({ remoteStream: remoteStream.toURL() });
    console.log({ localStream: localStream.toURL() });
    return (

        <SafeAreaView style={styles.body}>
            {
                stream && localStream ?
                    <RTCView
                        streamURL={localStream.toURL()}
                        style={[styles.stream, {borderWidth:5, borderColor:'red', backgroundColor:"white"}]} /> : null
            }

            {remoteStream ?
                <RTCView
                    streamURL={remoteStream.toURL()}
                    style={[styles.stream, { backgroundColor:'yellow' }]}
                /> : null
            }

            {localStream ? <View
                style={styles.footer}>
                <Button
                    title="Start"
                    onPress={start} />
                <Button
                    title="Stop"
                    onPress={stop} />
            </View> : null}

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    body: {
        backgroundColor: 'green',
        flex: 1,
    },
    stream: {
        height: HEIGHT_VIDEO,
        width: width
    },
    footer: {
        backgroundColor: Colors.lighter,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    },
});
export default DetailStreamingComponent