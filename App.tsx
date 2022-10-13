import React, { useEffect, useState } from 'react';
import { Animated, AppState, Linking, Platform } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRecoilState, useSetRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import codePush from "react-native-code-push";
import analytics from '@react-native-firebase/analytics';
import dynamicLinks, { FirebaseDynamicLinksTypes } from '@react-native-firebase/dynamic-links';

import GlobalNav from './src/navigators/globalNav';
import AlertPopup from '~/components/popup/AlertPopup';
import { bottomDotSheetState, isNotiReadState, latestVerionsState, notificationPopup, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import OkPopup from '~/components/popup/OkPopup';
import Loading from '~/components/loading';
import FadeInOut from '~/hooks/useFadeInOut';

import * as Sentry from "@sentry/react-native";
//@ts-ignore
import VersionCheck from 'react-native-version-check';
import NotificationPopup from '~/components/popup/NotificationPopup';
import Config from 'react-native-config';
import { versioningAOS, versioningIOS } from '~/utils/constant';
import ShouldUpdatePopup from '~/components/popup/ShouldUpdatePopup';
import BottomDotSheet from '~/components/popup/BottomDotSheet';


export const navigationRef = createNavigationContainerRef();

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useRecoilState(popupState);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const [notiOpen, setNotiOpen] = useRecoilState(notificationPopup);
  const { fadeAnim } = FadeInOut({ isPopupOpen: isPopupOpen.isOpen, setIsPopupOpen: (isOpen: boolean) => setIsPopupOpen({ ...isPopupOpen, isOpen }) });
  const [token, setToken] = useRecoilState(tokenState);
  const [isVisible, setIsVisible] = useState(false);
  const setIsNotiReadState = useSetRecoilState(isNotiReadState);
  const [isBottomDotSheet, setIsBottomDotSheet] = useRecoilState(bottomDotSheetState);
  const setLatestVerions = useSetRecoilState(latestVerionsState);
  const [versionCheckModal, setVersionCheckModal] = useState(false);

  const routeNameRef = React.useRef(null);


  // * 최신버전 체크
  const versionCheck = () => {
    if (Platform.OS === "ios") {
      VersionCheck.getLatestVersion({
        provider: "appStore"
      }).then((latest: string) => {
        // * 특정 버전에서 강제 업데이트
        // if (!__DEV__ && versioningIOS !== latest) {
        //   // * 강제 업데이트 팝업
        //   setVersionCheckModal(true);
        // }
        // else {
        //   setVersionCheckModal(false);
        // }

        setLatestVerions(latest);
      });
    }

    if (Platform.OS === "android") {
      VersionCheck.getLatestVersion({
        provider: "playStore"
      }).then((latest: string) => {
        // * 특정 버전에서 강제 업데이트
        // if (!__DEV__ && versioningAOS !== latest) {
        //   // * 강제 업데이트 팝업
        //   setVersionCheckModal(true);
        // }
        // else {
        //   setVersionCheckModal(false);
        // }

        setLatestVerions(latest);
      });
    }
  };

  const getToken = async () => {
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
    versionCheck();
    getToken();
    // * 코드푸시 업데이트 체크
    if (!__DEV__) {
      installUpdateIfAvailable();
    }
    SplashScreen.hide();
  }, []);

  // * 포어그라운드에서 딥링크 들어올때
  const handleDynamicLink = async (link: FirebaseDynamicLinksTypes.DynamicLink) => {
    const storageToken = await AsyncStorage.getItem("token");
    if (!storageToken) {
      // * 토큰 없을때 네비게이트 차단
      return;
    }
    // Handle dynamic link inside your own application
    if (link?.url.includes("id")) {
      //@ts-ignore
      navigationRef.navigate("FeedDetail", { id: link.url.split("id=")[1] });
    }
    else if (link?.url.includes("event")) {
      //@ts-ignore
      navigationRef.navigate("EventPage");
    }
  };

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    // When the component is unmounted, remove the listener
    return () => unsubscribe();
  }, []);

  // * 백그라운드에서 딥링크 들어올때
  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then(async (link) => {
        const storageToken = await AsyncStorage.getItem("token");
        if (!storageToken) {
          // * 토큰 없을때 네비게이트 차단
          return;
        }
        if (link?.url.includes("id")) {
          setTimeout(() => {
            //@ts-ignore
            navigationRef.navigate("FeedDetail", { id: link.url.split("id=")[1] });
          }, 1000);
        }
        else if (link?.url.includes("event")) {
          //@ts-ignore
          navigationRef.navigate("EventPage");
        }
      });
  }, []);

  const linking = {
    prefixes: ["knewnnew://"],
    config: {
      screens: {
        TabNav: {
          initialRouteName: 'HomeStackNav',
          screens: {
            HomeStackNav: {
              path: "Feed",
              screens: {
                Feed: "/:foodLog"
              }
            },
            BeforeWrite: "BeforeWrite",
            Notification: "Notification",
            Mypage: "Mypage"
          }
        },
        FeedDetail: "FeedDetail/:id",
        NotFound: "*"
      }
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      if (url != null) {
        return url;
      }
    }
  };

  const handleAlarm = (remoteMessage: any) => {
    if (Platform.OS === "ios") {
      if (remoteMessage.data?.custom_data.link) {
        if (remoteMessage.data?.custom_data.link.includes("review")) {
          // * 푸시알람
          //@ts-ignore
          navigationRef.navigate("FeedDetail", { id: remoteMessage.data.custom_data.link.split("/")[1] });
        }
        else {
          // * 링크 없는 공지알람
          //@ts-ignore
          navigationRef.navigate("TabNav");
        }
      }
      else {
        // * 링크 없는 공지알람
        //@ts-ignore
        navigationRef.navigate("TabNav");
      }
    }
    else {
      if (remoteMessage.data?.link) {
        if (remoteMessage.data?.link.includes("review")) {
          // * 푸시알람
          //@ts-ignore
          navigationRef.navigate("FeedDetail", { id: remoteMessage.data.link.split("/")[1] });
        }
        else {
          // * 링크 없는 공지알람
          //@ts-ignore
          navigationRef.navigate("TabNav");
        }
      }
      else {
        // * 링크 없는 공지알람
        //@ts-ignore
        navigationRef.navigate("TabNav");
      }
    }
  };

  useEffect(() => {
    const state = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === "active") {
        // * 백그라운드 알람 클릭시
        messaging().getInitialNotification().then(remoteMessage => {
          if (remoteMessage) {
            handleAlarm(remoteMessage);
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
              handleAlarm(remoteMessage);
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
      <NavigationContainer linking={linking} ref={navigationRef} fallback={<Loading />}
        onReady={() => {
          //@ts-ignore 
          routeNameRef.current = navigationRef.current.getCurrentRoute().name;
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          //@ts-ignore 
          const currentRouteName = navigationRef.current.getCurrentRoute().name;

          if (previousRouteName !== currentRouteName) {
            // * 구글 애널리틱스 추적
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName
            });
          }
          //@ts-ignore 
          routeNameRef.current = currentRouteName;
        }}
      >
        {versionCheckModal ? null :
          <GlobalNav token={token} />
        }
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
        <OkPopup
          isCancleButton={modalOpen.isCancleButton}
          isBackdrop={modalOpen.isBackdrop}
          title={modalOpen.content}
          handleOkayButton={modalOpen.okButton}
          modalOpen={modalOpen.isOpen}
          setModalOpen={(isModalOpen: boolean) => setModalOpen({ ...modalOpen, isOpen: isModalOpen })} />
      }
      {/* 자동으로 사라지는 경고 팝업 */}
      {isPopupOpen.isOpen &&
        <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: fadeAnim ? fadeAnim : -1 }}>
          <AlertPopup text={isPopupOpen.content} popupStyle={isPopupOpen.popupStyle} />
        </Animated.View>}

      {isBottomDotSheet?.isOpen &&
        <BottomDotSheet
          topTitle={isBottomDotSheet.topTitle}
          topPress={isBottomDotSheet.topPress}
          topTextStyle={isBottomDotSheet.topTextStyle}
          middleTitle={isBottomDotSheet.middleTitle}
          middlePress={isBottomDotSheet.middlePress}
          bottomTitle={isBottomDotSheet.bottomTitle}
          modalOpen={isBottomDotSheet.isOpen}
          middleTextStyle={isBottomDotSheet.middleTextStyle}
          setModalOpen={(isModalOpen: boolean) => setIsBottomDotSheet({ ...isBottomDotSheet, isOpen: isModalOpen })}
        />
      }
      {/* 강제 업데이트 팝업 */}
      {versionCheckModal &&
        <ShouldUpdatePopup modalOpen={versionCheckModal} />
      }
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