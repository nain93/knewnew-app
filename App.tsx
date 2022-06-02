import React, { useEffect, useRef } from 'react';
import GlobalNav from './src/navigators/globalNav';
import AlertPopup from '~/components/popup/alertPopup';
import { myIdState, okPopupState, popupState, tokenState } from '~/recoil/atoms';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from 'react-native-splash-screen';
import { Animated, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';
import { getMyProfile } from '~/api/user';
import { MyPrfoileType } from '~/types/user';
import OkPopup from '~/components/popup/okPopup';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useRecoilState(popupState);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [token, setToken] = useRecoilState(tokenState);
  const setMyId = useSetRecoilState(myIdState);
  const getMyProfileQuery = useQuery<MyPrfoileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token
  });

  useEffect(() => {
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

  const linking = {
    prefixes: ["knewnnew://", "https://knewnnew.com"],
    config: {
      screens: {
        TabNav: {
          initialRouteName: '피드',
          screens: {
            피드: "피드",
            작성: "작성"
          }
        },
        Welcome: "welcome",
        NotFound: "*"
      }
    },
  };

  return (
    <SafeAreaProvider>
      {/*@ts-ignore*/}
      <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
        <GlobalNav />
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