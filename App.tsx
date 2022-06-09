import React, { useEffect, useRef } from 'react';
import GlobalNav from './src/navigators/globalNav';
import AlertPopup from '~/components/popup/alertPopup';
import { myIdState, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from 'react-native-splash-screen';
import { Animated, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';
import { getMyProfile } from '~/api/user';
import { MyPrfoileType } from '~/types/user';
import OkPopup from '~/components/popup/okPopup';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import Loading from '~/components/loading';
import FadeInOut from '~/hooks/fadeInOut';

export const navigationRef = createNavigationContainerRef();
const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useRecoilState(popupState);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const { fadeAnim } = FadeInOut({ isPopupOpen, setIsPopupOpen });
  const [token, setToken] = useRecoilState(tokenState);
  const setMyId = useSetRecoilState(myIdState);
  const getMyProfileQuery = useQuery<MyPrfoileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token,
    onSuccess: (data) => {
      setMyId(data.id);
    }
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
    if (!getMyProfileQuery.isLoading) {
      SplashScreen.hide();
    }
  }, [getMyProfileQuery.isLoading]);

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

  return (
    <SafeAreaProvider>
      {/*@ts-ignore*/}
      <NavigationContainer linking={linking} ref={navigationRef} fallback={<Loading />}
      >
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