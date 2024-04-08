import { Button, Image, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import {launchImageLibrary} from 'react-native-image-picker';
const OCRScreen = () => {
    const [image, setImage] = useState(null);
  const [convertedText, setConvertedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = () => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        console.log(response.assets);
        const source = response.assets[0].uri;
        setImage(source);
      }
    });
  };
  console.log(image);
  const recognizedText = async () => {
    // setLoading(true)
    // try {

    //   console.log({result});
    //   setConvertedText(result.data.text);
    //   setLoading(false)
    // } catch (error) {
    //   console.log(error);
    //   setLoading(false)
    // }

  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>OCR Text Converter</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {image ? (
            <Image source={{ uri: image }} style={{ width: 150, height: 150, marginBottom: 10 }} />
          ) : (
            <View style={{ width: 150, height: 150, backgroundColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#6b7280' }}>Upload Photo</Text>
            </View>
          )}
          <Button title="Choose Photo" onPress={handleImageUpload} />
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TextInput
            style={{ width: 200, height: 150, borderColor: '#ccc', borderWidth: 1, padding: 10, marginBottom: 10 }}
            multiline
            value={convertedText}
            editable={false}
          />
          <Button title="Convert" onPress={()=> recognizedText().then({})} />
        </View>
      </View>
    </View>
  )
}

export default OCRScreen