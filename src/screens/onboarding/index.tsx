import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { d2p, h2p } from '~/utils';
import {
  kakaoImg,
  googleImg,
  naverImg,
  appleImg
} from "~/assets/images/snsImg/index";

import Config from "react-native-config";
import { NavigationType } from '~/types';
import { login } from '@react-native-seoul/kakao-login';
import { NaverLogin } from '@react-native-seoul/naver-login';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { userLogin } from '~/api/user';
import { tokenState } from '~/recoil/atoms';
import { useSetRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONT } from '~/styles/fonts';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import theme from '~/styles/theme';
import { emailicon } from '~/assets/icons';
import useNotification from '~/hooks/useNotification';
import { mainLogo } from '~/assets/logo';

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
  const [apiBlock, setApiBlock] = useState(false);
  const usePermission = useNotification();

  const goToBadgeSelect = (userData: {
    email: string,
    nickname: string,
    profileImage: string,
    providerKey: number,
    providerType: "kakao" | "naver" | "google" | "apple"
  }) => {
    navigation.navigate("WriteProfile", userData);
  };

  // * 버튼 연속클릭 방지
  const handleApiBlock = () => {
    if (apiBlock) {
      setTimeout(() => {
        setApiBlock(false);
      }, 2000);
      return;
    }
    else {
      setApiBlock(true);
    }
  };

  const handleKakaoLogin = async () => {
    handleApiBlock();
    //@ts-ignore
    const { accessToken } = await login();
    const data = await userLogin({ token: accessToken, providerType: "kakao" });
    setApiBlock(false);
    if (data.accessToken) {
      // * 이미 가입된 유저
      setToken(data.accessToken);
      AsyncStorage.setItem("token", data.accessToken);
      AsyncStorage.setItem("refreshToken", data.refreshToken);
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
      usePermission.notificationPermission({ token: data.accessToken });
    }
    else {
      // * 새 유저
      goToBadgeSelect(data);
    }
  };

  const handleNaverLogin = async () => {
    handleApiBlock();
    return new Promise((resolve, reject) => {
      NaverLogin.login(Platform.OS === "ios" ? iosKeys : aosKeys, async (err, token) => {
        if (token) {
          const { accessToken } = token;
          const data = await userLogin({ token: accessToken, providerType: "naver" });
          if (data.accessToken) {
            // * 이미 가입된 유저
            setToken(data.accessToken);
            AsyncStorage.setItem("token", data.accessToken);
            AsyncStorage.setItem("refreshToken", data.refreshToken);
            //@ts-ignore
            navigation.reset({ routes: [{ name: "TabNav" }] });
            usePermission.notificationPermission({ token: data.accessToken });
          }
          else {
            goToBadgeSelect(data);
          }
        }
        if (err) {
          reject(err);
          return;
        }
        setApiBlock(false);
        resolve(token);
      });
    });
  };

  const handleGoogleLogin = async () => {
    handleApiBlock();
    GoogleSignin.configure({
      iosClientId: "19978958503-8i0hoibbfta64msltteflpdseev3ruv9.apps.googleusercontent.com",
      webClientId: "19978958503-8i0hoibbfta64msltteflpdseev3ruv9.apps.googleusercontent.com",
    });

    await GoogleSignin.signIn();
    const { accessToken } = await GoogleSignin.getTokens();
    setApiBlock(false);
    if (accessToken) {
      const data = await userLogin({ token: accessToken, providerType: "google" });
      if (data.accessToken) {
        // * 이미 가입된 유저
        setToken(data.accessToken);
        AsyncStorage.setItem("token", data.accessToken);
        AsyncStorage.setItem("refreshToken", data.refreshToken);
        //@ts-ignore
        navigation.reset({ routes: [{ name: "TabNav" }] });
        usePermission.notificationPermission({ token: data.accessToken });
      }
      else {
        goToBadgeSelect(data);
      }
    }
  };

  const handleAppleLogin = async () => {
    handleApiBlock();
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
    if (credentialState === appleAuth.State.AUTHORIZED) {
      const token = appleAuthRequestResponse.authorizationCode;
      if (token) {
        const data = await userLogin({ token, providerType: "apple" });
        if (data.accessToken) {
          // * 이미 가입된 유저
          setToken(data.accessToken);
          AsyncStorage.setItem("token", data.accessToken);
          AsyncStorage.setItem("refreshToken", data.refreshToken);
          //@ts-ignore
          navigation.reset({ routes: [{ name: "TabNav" }] });
          usePermission.notificationPermission({ token: data.accessToken });
        }
        else {
          goToBadgeSelect(data);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: "auto" }}>
        <Text style={[{ fontSize: 28, textAlign: "center" }, FONT.Bold]}>
          맛있는게 궁금할땐, 뉴뉴!</Text>
        <Text style={[FONT.Regular, {
          marginTop: h2p(10),
          textAlign: "center"
        }]}>온라인 식품 탐색을 위한 푸드 커뮤니티</Text>
        <Image source={mainLogo} resizeMode="contain" style={styles.logo} />
      </View>
      <View style={{ marginBottom: h2p(150) }}>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={[FONT.Regular, { fontSize: 16 }]}>매일 매일 맛있는 발견이 있는 </Text>
          <Text style={[FONT.Bold, { fontSize: 16 }]}>뉴뉴를 시작하세요!</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: d2p(30), alignSelf: "center" }}>
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
        <TouchableOpacity
          onPress={() => navigation.navigate("emailLogin")}
          style={{
            marginTop: h2p(20),
            borderRadius: 5,
            paddingVertical: h2p(14),
            width: Dimensions.get("window").width - d2p(40),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.color.grayscale.f7f7fc
          }}>
          <Text style={[FONT.Regular, {
            textAlign: "center"
          }]}>이메일로 시작하기</Text>
        </TouchableOpacity>
      </View>
      <View style={{
        width: Dimensions.get("window").width - d2p(40),
        position: "absolute",
        bottom: isIphoneX() ? getBottomSpace() + h2p(20) : h2p(40),
      }}>
        <Text style={[FONT.Regular, { color: theme.color.grayscale.C_78737D, textAlign: "center", lineHeight: 20 }]}>
          회원가입 시 뉴뉴 서비스 필수 동의 항목인</Text>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity onPress={() => navigation.navigate("privacy")}>
            <Text style={[FONT.Bold, {
              color: theme.color.grayscale.C_443e49,
              textDecorationLine: "underline"
            }]}>개인정보처리방침</Text>
          </TouchableOpacity>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.C_78737D }]}>과 </Text>
          <TouchableOpacity onPress={() => navigation.navigate("term")}>
            <Text style={[FONT.Bold, {
              color: theme.color.grayscale.C_443e49,
              textDecorationLine: "underline"
            }]}>서비스 이용약관</Text>
          </TouchableOpacity>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.C_78737D }]}>
            에</Text>
        </View>
        <Text style={[FONT.Regular, { color: theme.color.grayscale.C_78737D, textAlign: "center", lineHeight: 20 }]}>
          동의한 것으로 간주합니다.</Text>
      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isIphoneX() ? h2p(120) + getStatusBarHeight() : h2p(120),
    alignItems: "center"
  },
  logo: {
    width: d2p(160),
    height: d2p(100),
    marginTop: h2p(40),
    alignSelf: "center"
  },
  onboardingImg: {
    width: d2p(302),
    height: h2p(287),
    marginTop: d2p(35),
    marginLeft: d2p(58),
  },
  snsImg: {
    width: d2p(60),
    height: d2p(60),
    marginHorizontal: d2p(7.5)
  }
});

export default Onboarding;