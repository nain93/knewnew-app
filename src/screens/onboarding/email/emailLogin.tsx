import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, } from 'react-native';
import React, { useCallback, useState } from 'react';
import { NavigationStackProp } from 'react-navigation-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { d2p, h2p } from '~/utils';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { userLogin } from '~/api/user';
import { useSetRecoilState } from 'recoil';
import { popupState, tokenState } from '~/recoil/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BasicButton from '~/components/button/basicButton';
import { hitslop } from '~/utils/constant';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { emailCheck } from '~/api/auth';
import axios from 'axios';

interface EmailLoginProps {
  navigation: NavigationStackProp;
}

const EmailLogin = ({ navigation }: EmailLoginProps) => {
  const setToken = useSetRecoilState(tokenState);
  const setIspopupOpen = useSetRecoilState(popupState);
  const [isEmail, setIsEmail] = useState(false);
  const [error, setError] = useState("");
  const [userInput, setUserInput] = useState({
    email: "",
    password: ""
  });

  const emailCheckMutation = useMutation("emailCheck", (email: string) => emailCheck(email), {
    onSuccess: (data) => {
      if (data === "Email available for signup") {
        // * 이메일 없는 경우
        navigation.navigate("emailSignup", {
          email: userInput.email
        });
      }
    },
    onError: (emailError) => {
      if (axios.isAxiosError(emailError) && emailError.response) {
        // * 이메일 존재하는 경우
        if ((emailError.response.data === "Email already exists. Not available for signup")) {
          setIsEmail(true);
        }
      }
    }
  });

  const emailLogin = useMutation("emailLogin", () => userLogin({ token: "", providerType: "email", userInput }), {
    onSuccess: (data) => {
      if (data.accessToken) {
        setToken(data.accessToken);
        AsyncStorage.setItem("token", data.accessToken);
        AsyncStorage.setItem("refreshToken", data.refreshToken);
        setError("");
        //@ts-ignore
        navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
      }
      else {
        if (data === "Wrong password") {
          setError("비밀번호가 틀렸습니다");
        }
        else {
          setIspopupOpen({ isOpen: true, content: "로그인 중 오류가 발생했습니다 다시 시도해 주세요" });
        }
      }
    }
  });

  useFocusEffect(useCallback(() => {
    setIsEmail(false);
  }, []));

  return (
    <>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ flex: 1 }}
        style={styles.container}>
        <Text style={[FONT.Bold, {
          fontSize: 26, marginTop: isIphoneX() ? getStatusBarHeight() + h2p(40) : h2p(40),
          textAlign: "center"
        }]}>👋 반가워요!
        </Text>
        <Text style={[FONT.Regular, {
          textAlign: "center", marginTop: h2p(10),
          color: theme.color.grayscale.C_78737D
        }]}>
          뉴뉴에 입장하려면 로그인이 필요해요.
        </Text>
        <Text style={[FONT.Bold, { fontSize: 16, marginTop: h2p(80), marginLeft: d2p(20) }]}>
          이메일 주소
        </Text>
        <TextInput
          value={userInput.email}
          onChangeText={(e) => setUserInput({ ...userInput, email: e })}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.textInput}
          placeholder="이메일 주소를 입력해주세요"
          placeholderTextColor={theme.color.grayscale.d2d0d5}
        />
        {isEmail ?
          <>
            <Text style={[FONT.SemiBold, {
              fontSize: 12, color: theme.color.grayscale.C_78737D,
              marginLeft: d2p(20), marginTop: h2p(10)
            }]}>
              뉴뉴에 가입된 이메일입니다. 비밀번호를 입력해주세요!
            </Text>
            <Text style={[FONT.Bold, { fontSize: 16, marginTop: h2p(40), marginLeft: d2p(20) }]}>
              비밀번호 입력
            </Text>
            <TextInput
              onChangeText={(e) => {
                setError("");
                setUserInput({ ...userInput, password: e });
              }}
              secureTextEntry={true}
              autoCapitalize="none"
              style={styles.textInput}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor={theme.color.grayscale.d2d0d5}
            />
            {error ?
              <Text style={[FONT.Regular, {
                marginLeft: d2p(20),
                marginTop: h2p(10),
                fontSize: 12,
                color: theme.color.main
              }]}>{error}</Text>
              :
              null
            }
            <View style={{ marginTop: h2p(60) }}>
              <BasicButton
                loading={emailLogin.isLoading}
                disabled={Boolean(!userInput.password)}
                onPress={emailLogin.mutate}
                text="후다닥 입장하기"
                bgColor={theme.color.main}
                textColor={theme.color.white}
                viewStyle={{ marginHorizontal: d2p(20) }}
              />
            </View>
            <Pressable
              onPress={() => {
                setUserInput({ email: "", password: "" });
                setError("");
                setIsEmail(false);
              }}
            >
              <Text style={[FONT.SemiBold, {
                fontSize: 12, color: theme.color.grayscale.d2d0d5, textAlign: "center",
                marginTop: h2p(20)
              }]}>
                다른 이메일로 시도할래요
              </Text>
            </Pressable>
          </>
          :
          <View style={{ marginTop: h2p(60) }}>
            <BasicButton
              loading={emailCheckMutation.isLoading}
              disabled={Boolean(!userInput.email)}
              onPress={() => emailCheckMutation.mutate(userInput.email)}
              text="다음으로"
              bgColor={theme.color.white}
              textColor={theme.color.main}
              viewStyle={{ marginHorizontal: d2p(20) }}
            />
          </View>
        }
      </KeyboardAwareScrollView>
    </>
  );
};

export default EmailLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textInput: {
    borderColor: theme.color.grayscale.f7f7fc,
    paddingVertical: h2p(15),
    paddingHorizontal: d2p(20),
    borderBottomWidth: 1,
    borderTopWidth: 1,
    color: theme.color.black,
    marginTop: h2p(10),
    fontSize: 16,
  }
});