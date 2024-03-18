/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native"
import Route from './src/Route';
import { notifeListener } from './src/utils/notifee';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
function App() {
  useEffect(() => {
    (async () => await notifeListener())
  
  }, [])
  return (
    <NavigationContainer>
      <Route />
    </NavigationContainer>
  )
}


export default App;
