import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { d2p, h2p } from '~/utils';
import {
  kakaoImg,
  googleImg,
  naverImg,
  appleImg
} from "~/assets/images/snsImg/index";
import mainLogo from '~/assets/logo';

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
import { FONT } from '~/styles/fonts';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import theme from '~/styles/theme';
import { versioningAOS, versioningIOS } from '~/utils/constant';
import { emailicon } from '~/assets/icons';

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
    if (apiBlock) {
      return;
    }
    setApiBlock(true);
    const { accessToken } = await login();
    const data = await userLogin({ token: accessToken, providerType: "kakao" });
    if (data.accessToken) {
      // * 이미 가입된 유저
      setToken(data.accessToken);
      AsyncStorage.setItem("token", data.accessToken);
      AsyncStorage.setItem("refreshToken", data.refreshToken);
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
    }
    else {
      // * 새 유저
      goToBadgeSelect(data);
    }
  };

  const handleNaverLogin = async () => {
    if (apiBlock) {
      return;
    }
    setApiBlock(true);
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
          }
          else {
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
    if (apiBlock) {
      return;
    }
    setApiBlock(true);
    GoogleSignin.configure({
      // webClientId: "381936778966-ed1p2hj7111sk00dtbvi3ma5lkk1g4kt.apps.googleusercontent.com"
      webClientId: "19978958503-rta621e9q96sp6qqgdk13cuijt3nc4ju.apps.googleusercontent.com",
    });

    await GoogleSignin.signIn();
    const { accessToken } = await GoogleSignin.getTokens();
    if (accessToken) {
      const data = await userLogin({ token: accessToken, providerType: "google" });
      if (data.accessToken) {
        // * 이미 가입된 유저
        setToken(data.accessToken);
        AsyncStorage.setItem("token", data.accessToken);
        AsyncStorage.setItem("refreshToken", data.refreshToken);
        //@ts-ignore
        navigation.reset({ routes: [{ name: "TabNav" }] });
      }
      else {
        goToBadgeSelect(data);
      }
    }
  };

  const handleAppleLogin = async () => {
    if (apiBlock) {
      return;
    }
    setApiBlock(true);
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
        }
        else {
          goToBadgeSelect(data);
        }
      }
    }
  };

  useEffect(() => {
    if (apiBlock) {
      setTimeout(() => {
        setApiBlock(false);
      }, 2000);
    }
  }, [apiBlock]);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: "auto" }}>
        <Text style={[{ fontSize: 20, textAlign: "center" }, FONT.SemiBold]}>
          제대로 된 맛있는 발견</Text>
        <Image source={mainLogo} style={styles.logo} />
      </View>
      <View style={{ marginBottom: h2p(145) }}>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>매일매일 </Text>
          <Text style={[FONT.Bold, { color: theme.color.grayscale.C_443e49 }]}>
            새로운 발견
          </Text>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>
            이 있는
          </Text>
        </View>
        <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49, textAlign: "center" }]}>
          뉴뉴를 시작하세요</Text>
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
          onPress={() => navigation.navigate("emailCheck")}
          style={{
            marginTop: h2p(23),
            borderRadius: 5,
            borderWidth: 1, borderColor: theme.color.grayscale.d3d0d5,
            paddingVertical: h2p(14),
            width: Dimensions.get("window").width - d2p(40),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
          }}>
          <Image source={emailicon} style={{ marginRight: d2p(10), width: d2p(13), height: d2p(10) }} />
          <Text style={[FONT.Bold, {
            textAlign: "center",
            color: theme.color.grayscale.a09ca4
          }]}>이메일로 시작하기</Text>
        </TouchableOpacity>
      </View>
      <View style={{
        width: Dimensions.get("window").width - d2p(40),
        position: "absolute",
        bottom: isIphoneX() ? getBottomSpace() + h2p(20) : h2p(40)
      }}>
        <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4 }]}>
          회원가입 시 뉴뉴 서비스 필수 동의 항목</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => navigation.navigate("privacy")}>
            <Text style={[FONT.Bold, {
              color: theme.color.grayscale.C_443e49,
              textDecorationLine: "underline"
            }]}>개인정보처리방침</Text>
          </TouchableOpacity>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4 }]}>과 </Text>
          <TouchableOpacity onPress={() => navigation.navigate("term")}>
            <Text style={[FONT.Bold, {
              color: theme.color.grayscale.C_443e49,
              textDecorationLine: "underline"
            }]}>서비스 이용약관</Text>
          </TouchableOpacity>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, textAlign: "center" }]}>
            에 동의하게 됩니다.</Text>
        </View>
        <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, marginTop: h2p(5) }]}>
          {(Platform.OS === "ios" ? `v.${versioningIOS}` : `v.${versioningAOS}`)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: getStatusBarHeight() + h2p(140),
    alignItems: "center"
  },
  logo: {
    width: d2p(215),
    height: d2p(35),
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