import React, { useEffect } from 'react';
import { Alert, Animated, Linking, Platform } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

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
    messaging().requestPermission();
    if (Platform.OS === "ios") {
      messaging()
        .getIsHeadless()
        .then(isHeadless => {
          console.log(isHeadless, 'isHeadless');
          // do sth with isHeadless
        });
    }
    // fetchConfig().catch(console.warn);
    messaging().getToken().then(fcmToken =>
      console.log(fcmToken, 'fcmToken')
    );
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // console.log(remoteMessage, 'remoteMessage');
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });
    return unsubscribe;
  }, []);

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

export default App;