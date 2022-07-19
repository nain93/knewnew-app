/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { navigationRef } from "./App";
import AppHoc from './appHoc';
import messaging from '@react-native-firebase/messaging';

//* 알람 Background, Quit 상태일 경우
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  navigationRef.navigate("FeedDetail", { id: remoteMessage.data.link.split("/")[1] });
});

AppRegistry.registerComponent(appName, () => AppHoc);
