import React, { useEffect, useRef } from 'react';
import GlobalNav from './src/navigators/globalNav';
import AlertPopup from '~/components/popup/alertPopup';
import { myIdState, popupState, tokenState } from '~/recoil/atoms';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from 'react-native-splash-screen';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';
import { getMyProfile } from '~/api/user';
import { MyPrfoileType } from '~/types';

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useRecoilState(popupState);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [token, setToken] = useRecoilState(tokenState);
  const setMyId = useSetRecoilState(myIdState);
  const getMyProfileQuery = useQuery<MyPrfoileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token
  });

  useEffect(() => {
    // AsyncStorage.removeItem("token");
    const getToken = async () => {
      // TODO refresh api
      const storageToken = await AsyncStorage.getItem("token");
      if (storageToken) {
        setToken(storageToken);
      }
    };
    getToken();
    SplashScreen.hide();
  }, []);

  useEffect(() => {
    if (getMyProfileQuery.data) {
      setMyId(getMyProfileQuery.data.id);
    }
  }, [getMyProfileQuery.data]);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // * 알림 팝업창 띄웠다 꺼지는 로직
  useEffect(() => {
    if (isPopupOpen.isOpen) {
      fadeIn();
      setTimeout(() => {
        fadeOut();
        setTimeout(() => {
          setIsPopupOpen({ ...isPopupOpen, isOpen: false });
        }, 100);
      }, 1500);
    }
  }, [isPopupOpen, fadeAnim]);

  return (
    <SafeAreaProvider>
      <GlobalNav />
      {isPopupOpen.isOpen &&
        <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: fadeAnim ? fadeAnim : -1 }}>
          <AlertPopup text={isPopupOpen.content} popupStyle={isPopupOpen.popupStyle} />
        </Animated.View>}
    </SafeAreaProvider>
  );
};

export default App;