import React, { useEffect } from 'react';
import { Alert, Animated, Linking, Platform } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import codePush from "react-native-code-push";

import GlobalNav from './src/navigators/globalNav';
import AlertPopup from '~/components/popup/alertPopup';
import { okPopupState, popupState, tokenState } from '~/recoil/atoms';
import OkPopup from '~/components/popup/okPopup';
import Loading from '~/components/loading';
import FadeInOut from '~/hooks/fadeInOut';

export const navigationRef = createNavigationContainerRef();
const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useRecoilState(popupState);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const { fadeAnim } = FadeInOut({ isPopupOpen, setIsPopupOpen });
  const [token, setToken] = useRecoilState(tokenState);

  useEffect(() => {
    const getToken = async () => {
      // TODO refresh api
      const storageToken = await AsyncStorage.getItem("token");
      if (storageToken) {
        setToken(storageToken);
        // todo api link
        // messaging().getToken().then(fcmToken => {
        // 	// console.log(fcmToken);
        // 	registerNotification(fcmToken, Platform.OS)
        // 		.then((v: any) => console.log(v))
        // 		.catch((e: any) => console.warn(e));
        // });
      }
      else {
        SplashScreen.hide();
      }
    };
    getToken();
  }, []);

  const linking = {
    // prefixes: ["kakao7637c35cfedcb6c01b1f17ce7cd42f05://"],
    prefixes: ["knewnnew://"],
    config: {
      screens: {
        TabNav: {
          initialRouteName: 'Feed',
          screens: {
            Feed: "Feed",
            Write: "Write",
            Search: "Search",
            Mypage: "Mypage"
          }
        },
        FeedDetail: "FeedDetail/:id",
        NotFound: "*"
      }
    },
    async getInitialURL() {
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();
      if (url != null) {
        return url;
      }
    },
  };

  // * FCM
  React.useEffect(() => {
    // * 코드푸시 업데이트 체크
    installUpdateIfAvailable();
    if (Platform.OS === "ios") {
      messaging().requestPermission();
      messaging()
        .getIsHeadless()
        .then(isHeadless => {
          console.log('isHeadless');
          // do sth with isHeadless
        });
    }
    // fetchConfig().catch(console.warn);
    messaging().getToken().then(fcmToken =>
      console.log('fcmToken')
    );
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // console.log(remoteMessage, 'remoteMessage');
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });
    return unsubscribe;
  }, []);

  // * CODE PUSH
  const checkForUpdate = async (): Promise<boolean> => {
    try {
      const remotePackage = await codePush.checkForUpdate();
      console.log("I received the remote package: ", remotePackage);
      if (remotePackage && !remotePackage?.failedInstall) {
        return true;
      }
    } catch (e) {
      console.log(e, 'e');
      // TODO - log error
    }
    return false;
  };

  const installUpdateIfAvailable = () => {
    const TimeoutMS = 10000;
    const checkAndUpdatePromise = new Promise(async (resolve: Function) => {
      const updateAvailable = await checkForUpdate();
      // console.log(updateAvailable, "updateAvailable");
      if (updateAvailable) {
        const syncStatus = (status: codePush.SyncStatus) => {
          console.log("SyncStatus = ", status);
          switch (status) {
            case codePush.SyncStatus.UP_TO_DATE:
            case codePush.SyncStatus.UPDATE_IGNORED:
              console.log("App is up to date...");
              resolve();
              break;
            case codePush.SyncStatus.UPDATE_INSTALLED:
              console.log("Update installed successfully!");
              // DO NOT RESOLVE AS THE APP WILL REBOOT ITSELF HERE
              break;
            case codePush.SyncStatus.UNKNOWN_ERROR:
              console.log("Update received an unknown error...");
              resolve();
              break;
            default:
              break;
          }
        };

        // Install the update
        codePush.sync(
          {
            installMode: codePush.InstallMode.IMMEDIATE,
            mandatoryInstallMode: codePush.InstallMode.IMMEDIATE
          },
          syncStatus
        );
      } else {
        resolve();
      }
      setTimeout(() => {
        resolve();
      }, TimeoutMS);
    });
    return Promise.race([checkAndUpdatePromise]);
  };

  // if (!__DEV__) { }

  return (
    <SafeAreaProvider>
      {/*@ts-ignore*/}
      <NavigationContainer linking={linking} ref={navigationRef} fallback={<Loading />}>
        <GlobalNav token={token} />
      </NavigationContainer>
      <OkPopup title={modalOpen.content}
        handleOkayButton={modalOpen.okButton}
        modalOpen={modalOpen.isOpen}
        setModalOpen={(isModalOpen: boolean) => setModalOpen({ ...modalOpen, isOpen: isModalOpen })} />
      {isPopupOpen.isOpen &&
        <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: fadeAnim ? fadeAnim : -1 }}>
          <AlertPopup text={isPopupOpen.content} popupStyle={isPopupOpen.popupStyle} />
        </Animated.View>}
    </SafeAreaProvider>
  );
};

let codePushOptions = {
  checkFrequency: codePush.CheckFrequency.MANUAL
};
const codePushApp = codePush(codePushOptions)(App);
export default codePushApp;