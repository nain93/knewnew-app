/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import AppHoc from './appHoc';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from './App';

//* 알람 Background, Quit 상태일 경우
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  AsyncStorage.setItem("isNotiReadState", JSON.stringify(false));
  navigationRef.navigate("TabNav");
});

AppRegistry.registerComponent(appName, () => AppHoc);
