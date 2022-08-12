import React, { useEffect, useState } from 'react';
import { Animated, AppState, Linking, Platform, Text, View } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import codePush from "react-native-code-push";
import { FileLogger } from "react-native-file-logger";

import GlobalNav from './src/navigators/globalNav';
import AlertPopup from '~/components/popup/alertPopup';
import { isNotiReadState, latestVerionsState, notificationPopup, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import OkPopup from '~/components/popup/okPopup';
import Loading from '~/components/loading';
import FadeInOut from '~/hooks/useFadeInOut';

import * as Sentry from "@sentry/react-native";
//@ts-ignore
import VersionCheck from 'react-native-version-check';
import Config from 'react-native-config';
import NotificationPopup from '~/components/popup/notificationPopup';


export const navigationRef = createNavigationContainerRef();

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useRecoilState(popupState);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const [notiOpen, setNotiOpen] = useRecoilState(notificationPopup);
  const { fadeAnim } = FadeInOut({ isPopupOpen: isPopupOpen.isOpen, setIsPopupOpen: (isOpen: boolean) => setIsPopupOpen({ ...isPopupOpen, isOpen }) });
  const [token, setToken] = useRecoilState(tokenState);
  const [isVisible, setIsVisible] = useState(false);
  const setIsNotiReadState = useSetRecoilState(isNotiReadState);
  const setLatestVerions = useSetRecoilState(latestVerionsState);

  // const sendLoggedFiles = useCallback(() => {
  //   FileLogger.sendLogFilesByEmail({
  //     to: 'rnrb555@gmail.com',
  //     subject: 'App logs',
  //     body: 'Attached logs',
  //   })
  //     .then(() => {
  //       setTimeout(() => {
  //         FileLogger.deleteLogFiles();
  //       }, 5000);
  //     })
  //     .catch((err) => {
  //       if ('message' in err) {
  //         FileLogger.error(err.message);
  //       } else {
  //         FileLogger.error(JSON.stringify(err));
  //       }
  //     });
  // }, []);

  // * 최신버전 체크
  const versionCheck = () => {
    if (Platform.OS === "ios") {
      VersionCheck.getLatestVersion({
        provider: "appStore"
      }).then((latestVersion: string) => {
        setLatestVerions(latestVersion);
      });
    }

    if (Platform.OS === "android") {
      VersionCheck.getLatestVersion({
        provider: "playStore"
      }).then((latestVersion: string) => {
        setLatestVerions(latestVersion);
      });
    }
  };

  const getToken = async () => {
    // TODO refresh api
    // * 토큰 저장
    const storageToken = await AsyncStorage.getItem("token");
    if (storageToken) {
      setToken(storageToken);
    }
    else {
      SplashScreen.hide();
    }
  };

  useEffect(() => {
    // *스플래시 로딩중
    getToken();
    versionCheck();
    // * 코드푸시 업데이트 체크
    installUpdateIfAvailable();
  }, []);

  const linking = {
    // prefixes: ["https://"],
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

  useEffect(() => {
    const state = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === "active") {
        // * 백그라운드 알람 클릭시
        messaging().getInitialNotification().then(remoteMessage => {
          if (remoteMessage) {
            if (Platform.OS === "ios") {
              //@ts-ignore
              navigationRef.navigate("FeedDetail", { id: remoteMessage.data.custom_data.link.split("/")[1] });
            }
            else {
              //@ts-ignore
              navigationRef.navigate("FeedDetail", { id: remoteMessage.data.link.split("/")[1] });
            }
          }
        });
        // * 알림 읽은정보 저장
        AsyncStorage.getItem("isNotiReadState").then(isReadNoti => {
          if (isReadNoti) {
            setIsNotiReadState(JSON.parse(isReadNoti));
          }
        });
      }
    });
    return () => state.remove();
  }, []);

  // * FCM
  useEffect(() => {
    // * 포어그라운드 알람 클릭시
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.notification?.body) {
        setNotiOpen({
          id: Number(remoteMessage.data?.id),
          isOpen: true, content: remoteMessage.notification.body,
          onPress: () => {
            if (navigationRef.isReady()) {
              // * 알람팝업 클릭시 화면 navigate
              if (Platform.OS === "ios") {
                //@ts-ignore
                navigationRef.navigate("FeedDetail", { id: remoteMessage.data.custom_data.link.split("/")[1] });
              }
              else {
                //@ts-ignore
                navigationRef.navigate("FeedDetail", { id: remoteMessage.data.link.split("/")[1] });
              }
            }
          }
        });
      }
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

  useEffect(() => {
    // * 알람오면 알람팝업 띄우고 안 읽음처리
    if (notiOpen.isOpen) {
      setIsVisible(true);
      setIsNotiReadState(false);
      AsyncStorage.setItem("isNotiReadState", JSON.stringify(false));
    }
  }, [notiOpen.isOpen]);

  return (
    <SafeAreaProvider>
      {/*@ts-ignore*/}
      <NavigationContainer linking={linking} ref={navigationRef} fallback={<Loading />}>
        <GlobalNav token={token} />
      </NavigationContainer>
      {/* 위에서 내려오는 알림 팝업 */}
      {isVisible &&
        <NotificationPopup
          id={notiOpen.id}
          onPress={notiOpen.onPress}
          setIsVisible={(view: boolean) => setIsVisible(view)}
          content={notiOpen.content}
          modalOpen={notiOpen.isOpen}
          setModalOpen={(isOpen: boolean) => setNotiOpen({ ...notiOpen, isOpen })}
        />
      }
      {/* 확인, 취소 버튼 팝업 */}
      {modalOpen.isOpen &&
        <OkPopup title={modalOpen.content}
          handleOkayButton={modalOpen.okButton}
          modalOpen={modalOpen.isOpen}
          setModalOpen={(isModalOpen: boolean) => setModalOpen({ ...modalOpen, isOpen: isModalOpen })} />
      }
      {/* 자동으로 사라지는 경고 팝업 */}
      {isPopupOpen.isOpen &&
        <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: fadeAnim ? fadeAnim : -1 }}>
          <AlertPopup text={isPopupOpen.content} popupStyle={isPopupOpen.popupStyle} />
        </Animated.View>}
    </SafeAreaProvider>
  );
};
// * 코드푸시떄 테스트
// codePush.getUpdateMetadata().then(update => {
//   console.log(update, 'update');
//   if (update) {
//     Sentry.init({
//       // TODO Need to separate in dotenv
//       dsn: "https://16e08b19073a4ce28fbf16241c48aed4@o1302410.ingest.sentry.io/6539779",
//       // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
//       // We recommend adjusting this value in production.
//       tracesSampleRate: 1.0,
//     });
//   }
// });

if (!__DEV__) {
  Sentry.init({
    environment: "production",
    dsn: Config.CENTRY_DSN,
    tracesSampleRate: 1.0,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  });
}

let codePushOptions = {
  checkFrequency: codePush.CheckFrequency.MANUAL
};
const codePushApp = codePush(codePushOptions)(App);
export default codePushApp;