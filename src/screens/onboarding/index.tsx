import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import {
  kakaoImg,
  googleImg,
  naverImg,
  appleImg
} from "~/assets/images/snsImg/index";
import mainLogo from '~/assets/logo';
import { onboardingImg } from '~/assets/images';

import Config from "react-native-config";
import { NavigationType } from '~/types';
import { login } from '@react-native-seoul/kakao-login';
import { userLogin } from '~/api/user';
import { NaverLogin } from '@react-native-seoul/naver-login';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { tokenState } from '~/recoil/atoms';
import { useSetRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';

const iosKeys = {
  kConsumerKey: Config.NAVER_KEY,
  kConsumerSecret: Config.NAVER_SECRET,
  kServiceAppName: "knewnnew",
  kServiceAppUrlScheme: "naverlogin" // only for iOS
};

const aosKeys = {
  kConsumerKey: Config.NAVER_KEY,
  kConsumerSecret: Config.NAVER_SECRET,
  kServiceAppName: "knewnnew"
};

const Onboarding = ({ navigation }: NavigationType) => {
  const setToken = useSetRecoilState(tokenState);

  const goToBadgeSelect = (userData: {
    email: string,
    nickname: string,
    profileImage: string,
    providerKey: number,
    providerType: "kakao" | "naver" | "google" | "apple"
  }) => {
    navigation.navigate("TagSelect", userData);
  };

  const handleKakaoLogin = async () => {
    const { accessToken } = await login();
    const data = await userLogin({ token: accessToken, providerType: "kakao" });
    if (data.accessToken) {
      // * 이미 가입된 유저
      setToken(accessToken);
      AsyncStorage.setItem("token", accessToken);
      //@ts-ignore
      navigation.reset({ routes: [{ name: "TabNav" }] });
    }
    else {
      // * 새 유저
      goToBadgeSelect(data);
    }
  };

  const handleNaverLogin = async () => {
    return new Promise((resolve, reject) => {
      NaverLogin.login(Platform.OS === "ios" ? iosKeys : aosKeys, async (err, token) => {
        if (token) {
          const { accessToken } = token;
          const data = await userLogin({ token: accessToken, providerType: "naver" });
          if (data) {
            goToBadgeSelect(data);
          }
        }
        if (err) {
          reject(err);
          return;
        }
        resolve(token);
      });
    });
  };

  const handleGoogleLogin = async () => {
    // * 추후 개발
    navigation.navigate("TagSelect");
    // GoogleSignin.configure({
    //   webClientId: "1025814485939-95vtu3p4iqb7qp23henp85c1nd2d2i3c.apps.googleusercontent.com",
    //   iosClientId: "1025814485939-hebcl4c1tmq4bqt9q0ifng6mq7amltnf.apps.googleusercontent.com"
    // });
    // const userInfo = await GoogleSignin.signIn();
    // const { idToken } = userInfo;
    // if (idToken) {
    //   const data = await userLogin({ token: idToken, providerType: "google" });
    //   console.log(data, 'data');
    //   if (data) {
    //     goToBadgeSelect();
    //   }
    // }
  };

  const handleAppleLogin = async () => {
    // * 추후 개발
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    console.log(appleAuthRequestResponse, 'appleAuthRequestResponse');
    const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
    if (credentialState === appleAuth.State.AUTHORIZED) {
      const token = appleAuthRequestResponse.identityToken;
      console.log(token, 'token');
      // if (token) {
      //   const data = await userLogin({ token, providerType: "apple" });
      //   if (data) {
      //     goToBadgeSelect(data);
      //   }
      // }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ marginLeft: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>실패없는 장보기</Text>
        <View style={styles.logo}>
          <Image source={mainLogo} style={{ width: d2p(215), height: d2p(35) }} />
        </View>
        <Image
          source={onboardingImg}
          resizeMode="contain"
          style={styles.onboardingImg}
        />
      </View>
      <View style={{ marginTop: d2p(60) }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold" }}>SNS로 시작하기</Text>
        <View style={{ flexDirection: "row", marginTop: d2p(20), alignSelf: "center" }}>
          <TouchableOpacity onPress={handleKakaoLogin}>
            <Image source={kakaoImg} style={styles.snsImg} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNaverLogin}>
            <Image source={naverImg} style={styles.snsImg} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoogleLogin}>
            <Image source={googleImg} style={styles.snsImg} />
          </TouchableOpacity>
          {Platform.OS === "ios" &&
            <TouchableOpacity onPress={handleAppleLogin}>
              <Image source={appleImg} style={styles.snsImg} />
            </TouchableOpacity>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: h2p(102)
  },
  logo: {
    width: d2p(260),
    height: d2p(80),
    marginTop: d2p(10)
  },
  onboardingImg: {
    width: d2p(302),
    height: h2p(287),
    marginTop: d2p(35),
    marginLeft: d2p(58),
  },
  snsImg: {
    width: d2p(50),
    height: d2p(50),
    marginHorizontal: d2p(10)
  }
});

export default Onboarding;