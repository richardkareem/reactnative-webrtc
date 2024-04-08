import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
// import HomeScreen from '../Screen/HomeScreen';
// import StreamingScreen from "../Screen/StreamingScreen";
// import OCRScreen from "../Screen/OCRScreen";
// import DetailStreamingScreen from "../Screen/DetailStreamingScreen";
import HealthScreen from "../Screen/HealthScreen";
// import HealthScreenGoogleFit from "../Screen/HealthScreenGoogleFit";
// import SocketScreen from "../Screen/SocketScreen";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainApp = () =>{
    return(
        <Tab.Navigator>
           {/* <Tab.Screen name="SocketScreen" component={SocketScreen} /> */}
            {/* <Tab.Screen name='HomeScreen' component={HomeScreen} options={{headerShown:false}} /> */}
            {/* <Tab.Screen name='StreamingScreen' component={StreamingScreen} options={{headerShown:false}} /> */}
            {/* <Tab.Screen name='OCRScreen' component={OCRScreen} options={{headerShown:false}} /> */}
            <Tab.Screen name='HealthScreen' component={HealthScreen} options={{headerShown:false}} />
            {/* <Tab.Screen name='HealthScreenGoogleFit' component={HealthScreenGoogleFit} options={{headerShown:false}} /> */}
            
        </Tab.Navigator>
    )
}

const Route = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen name='MainApp' component={MainApp} options={{headerShown:false}} />
        {/* <Stack.Screen name='DetailStreamingScreen' component={DetailStreamingScreen} options={{headerShown:false}} /> */}
    </Stack.Navigator>
  )
}

export default Route