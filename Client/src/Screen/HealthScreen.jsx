import { Button, Text, View, PermissionsAndroid} from 'react-native'
import React, { useEffect,  } from 'react'
import {
  initialize,
  getSdkStatus,
  SdkAvailabilityStatus,
  requestPermission,
  getGrantedPermissions,
  insertRecords,
  readRecords,
  readRecord,
  openHealthConnectDataManagement,
  openHealthConnectSettings,
  deleteRecordsByTimeRange,

} from 'react-native-health-connect'
const HealthScreen = () => {

  const handlePermission = async() =>{
    try{
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.PHYSICAL_ACTIVITY,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    }catch (error) {
    console.log('error cying, ',{error}); 
    }
  }
  const handlePermissionActivity = async() =>{
    try{
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'ACTIVITY_RECOGNITION',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the ACTIVITY_RECOGNITION');
      } else {
        console.log('ACTIVITY_RECOGNITION permission denied');
      }
    }catch (error) {
    console.log('error cying, ',{error}); 
    }
  }

  const initializeHealthConnect = async () => {
    const isInitialized = await initialize();
    console.log({ isInitialized });
  };
  const checkAvailability = async () => {
    const status = await getSdkStatus();
    if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
      console.log('SDK is available');
    }

    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
      console.log('SDK is not available');
    }

    if (
      status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
    ) {
      console.log('SDK is not available, provider update required');
    }
  };
  const requestPermissions = () => {
    requestPermission([
      {
        accessType: 'read',
        recordType: 'Steps',
      },
      {
        accessType: 'write',
        recordType: 'Steps',
      },
      {
        accessType:"write",
        recordType:'Weight',
      },
      {
        accessType:"read",
        recordType:'Weight',
      },
      {
        accessType:'read',
        recordType:'HeartRate'
      },
      {
        accessType:'read',
        recordType:'TotalCaloriesBurned'
      },
      {
        accessType:'read',
        recordType:'Distance'
      },
      
    ]).then((permissions) => {

      console.log('Granted permissions ', { permissions });
    }).catch(err => {
      console.log('error granted permissions', err);
    })
  };

  const readGrantedPermissions = () => {
    getGrantedPermissions().then((permissions) => {
      console.log('Granted permissions ', { permissions });
    }).catch(err => {
      console.log('read granted permission error', err);
    })
  };

// const today = new Date();
// today.setDate(today.getDate()-1);
// console.log({today});
  const insertSampleData = () => {
    insertRecords([
      {
        recordType: 'Steps',
        count: 3000,
        startTime: "2024-04-01T16:48:58.269Z",
        endTime: '2024-04-02T16:49:23.817Z',
      },
      // {
      //   recordType: 'Steps',
      //   count: 5000,
      //   startTime: '2024-04-01T08:56:36.493Z',
      //   endTime: '2024-04-02T08:56:53.502Z',
      // },
    ]).then((ids) => {
      console.log('Records inserted ', { ids }); // Records inserted  {"ids": ["06bef46e-9383-4cc1-94b6-07a5045b764a", "a7bdea65-86ce-4eb2-a9ef-a87e6a7d9df2"]}
    }).catch(err => {
      console.log("ada error sample data", err);
    })
  };
  // const today = new Date();
  // day.setDate(day.getDate() - 10);
  // console.log({day});
  const readSampleData = () => {
    readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: "2024-04-02T12:00:00.000Z",
        endTime: "2024-04-03T12:00:00.000Z",
      },
    }).then((result) => {
      console.log('Retrieved records: ', JSON.stringify({ result }, null, 2)); // Retrieved records:  {"result":[{"startTime":"2023-01-09T12:00:00.405Z","endTime":"2023-01-09T23:53:15.405Z","energy":{"inCalories":15000000,"inJoules":62760000.00989097,"inKilojoules":62760.00000989097,"inKilocalories":15000},"metadata":{"id":"239a8cfd-990d-42fc-bffc-c494b829e8e1","lastModifiedTime":"2023-01-17T21:06:23.335Z","clientRecordId":null,"dataOrigin":"com.healthconnectexample","clientRecordVersion":0,"device":0}}]}
    }).catch(err => {
      console.log('read sample data error', err);
    })
  };

  const readSampleDataSingle = () => {
    readRecord(
      'Steps',
      '282e4a10-cfd7-411c-87e0-3a46ecce4579'
    ).then((result) => {
      console.log('Retrieved record: ', JSON.stringify({ result }, null, 2));
    }).catch(err =>
      console.log('error read sample data single ', err))
  };

  const deleteRecords = () => {
    deleteRecordsByTimeRange('Steps', {
      operator: 'between',
      startTime: '2024-03-23T08:56:00.250Z',
      endTime: '2024-04-02T08:56:53.502Z',
    }).then(res => {
      console.log('berhasil', res);
    })

  }

  useEffect(() => {
    initializeHealthConnect();
    checkAvailability();
  }, [])

  const handleOpenHealthConnectionSetting =()=>{
    openHealthConnectSettings();
  }
  return (
    <View>
      <Text>HealthScreen</Text>
      <Button title='Check Permission' onPress={readGrantedPermissions} />
      <Button title='request Permission' onPress={requestPermissions} />
      <Button title='Insert Sample Data' onPress={() => insertSampleData()} />
      <Button title='Read Sample Data' onPress={() => readSampleData()} />
      <Button title='Read spesifik data' onPress={readSampleDataSingle} />
      <Button title='Open Healt Data Management' onPress={() => { openHealthConnectDataManagement() }} />
      <Button title='Hapus Data' onPress={deleteRecords} />
      <Button title='check hari ini' onPress={() => { openHealthConnectDataManagement() }} />
      <Button  title='Opem Health Connect Setting' onPress={handleOpenHealthConnectionSetting} />
      <Button title='Permission Camera Test' onPress={handlePermission} />
      <Button title='Permission Activity Test' onPress={handlePermissionActivity} />
    </View>
  )
}

export default HealthScreen

