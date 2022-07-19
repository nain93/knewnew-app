import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Linking, Platform, PlatformOSType } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import codePush from "react-native-code-push";
import { FileLogger } from "react-native-file-logger";

import GlobalNav from './src/navigators/globalNav';
import AlertPopup from '~/components/popup/alertPopup';
import { notificationPopup, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import OkPopup from '~/components/popup/okPopup';
import Loading from '~/components/loading';
import FadeInOut from '~/hooks/fadeInOut';

import * as Sentry from "@sentry/react-native";
import Config from 'react-native-config';
import NotificationPopup from '~/components/popup/notificationPopup';
import { registerNotification } from '~/api/setting';
import { useMutation } from 'react-query';

export const navigationRef = createNavigationContainerRef();

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useRecoilState(popupState);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const [notiOpen, setNotiOpen] = useRecoilState(notificationPopup);
  const { fadeAnim } = FadeInOut({ isPopupOpen, setIsPopupOpen });
  const [token, setToken] = useRecoilState(tokenState);
  const [isVisible, setIsVisible] = useState(false);

  const notificationMutation = useMutation("registerNotification", ({ FCMToken, type }: { FCMToken: string, type: PlatformOSType }) =>
    registerNotification({ token, FCMToken, type }));

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

  // * 스플래시 로딩중 토큰 저장
  useEffect(() => {
    const getToken = async () => {
      // TODO refresh api
      const storageToken = await AsyncStorage.getItem("token");
      if (storageToken) {
        setToken(storageToken);
        // * 알람 기기등록 
        messaging().getToken().then(FCMToken => {
          notificationMutation.mutate({ FCMToken, type: Platform.OS });
        });
      }
      else {
        SplashScreen.hide();
      }
    };
    getToken();
    return messaging().onTokenRefresh(FCMToken => {
      notificationMutation.mutate({ FCMToken, type: Platform.OS });
    });
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
  useEffect(() => {
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
    // * 알람 수신후 핸들링
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.notification?.body) {
        setNotiOpen({
          isOpen: true, content: remoteMessage.notification.body,
          onPress: () => {
            if (navigationRef.isReady()) {
              // todo 알람팝업 클릭시 화면 navigate
              //@ts-ignore
              navigationRef.navigate("FeedDetail", { id: remoteMessage.data.link.split("/")[1] });
            }
          }
        });
      }
      if (navigationRef.isReady()) {
        // todo 알람팝업 클릭시 화면 navigate
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
    if (notiOpen.isOpen) {
      setIsVisible(true);
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
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1.0,
  });
}

let codePushOptions = {
  checkFrequency: codePush.CheckFrequency.MANUAL
};
const codePushApp = codePush(codePushOptions)(App);
export default codePushApp;