import notifee, { AndroidImportance } from '@notifee/react-native';


export const notifeListener =  async() =>{
    try {
        const channelId = await notifee.createChannel( {
            id: 'screen_capture',
            name: 'Screen Capture',
            lights: false,
            vibration: false,
            importance: AndroidImportance.DEFAULT
        } );
    
        await notifee.displayNotification( {
            title: 'Screen Capture',
            body: 'This notification will be here until you stop capturing.',
            android: {
                channelId,
                asForegroundService: true
            }
        } );

        console.log("masuk notife func");
    } catch( err ) {
        // Handle Error
        console.log(err);
    }

}
