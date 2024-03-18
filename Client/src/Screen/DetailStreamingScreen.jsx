import React, { useRef, useState } from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import {
  RTCView,
} from 'react-native-webrtc';
const DetailStreamingScreen = ({ route }) => {
  const routes = route.params;
  const localStream = routes?.localStream;
  const remoteStream = route?.remoteStream;
  const [stream, setStream] = useState(false);
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
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.body}>
        {
          stream && localStream ?
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.stream} /> : null
        }

        {remoteStream ?
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.stream}
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
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
    ...StyleSheet.absoluteFill
  },
  stream: {
    flex: 1
  },
  footer: {
    backgroundColor: Colors.lighter,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
});

export default DetailStreamingScreen;
