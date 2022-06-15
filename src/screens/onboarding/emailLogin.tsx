import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p } from '~/utils';
import { NavigationStackProp } from 'react-navigation-stack';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { userLogin } from '~/api/user';
import { useSetRecoilState } from 'recoil';
import { popupState, tokenState } from '~/recoil/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface EmailLoginProps {
  navigation: NavigationStackProp;
}

const EmailLogin = ({ navigation }: EmailLoginProps) => {
  const setToken = useSetRecoilState(tokenState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInput, setUserInput] = useState({
    email: "",
    password: ""
  });

  const handleEmailLogin = async () => {
    if (!userInput.email || !userInput.password) {
      setError("내용을 입력해주세요.");
      return;
    }
    setLoading(true);
    const data = await userLogin({ token: "", providerType: "email", userInput });
    if (data.accessToken) {
      setToken(data.accessToken);
      AsyncStorage.setItem("token", data.accessToken);
      AsyncStorage.setItem("refreshToken", data.refreshToken);
      setError("");
      //@ts-ignore
      navigation.reset({ routes: [{ name: "TabNav" }] });
    }
    else {
      setError("유저 정보가 없습니다.");
    }
    setLoading(false);
  };

  return (
    <>
      <Header
        title={"이메일 로그인"}
        headerLeft={
          <LeftArrowIcon onBackClick={() => navigation.goBack()} />
        }
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps
        contentContainerStyle={{ justifyContent: "center", flex: 1 }}
        style={styles.container}>
        <TextInput
          value={userInput.email}
          onChangeText={(e) => setUserInput({ ...userInput, email: e })}
          autoCapitalize="none" style={styles.textInput} placeholder="이메일" keyboardType="email-address" />
        <TextInput
          value={userInput.password}
          onChangeText={(e) => setUserInput({ ...userInput, password: e })}
          autoCapitalize="none"
          style={styles.textInput} placeholder="비밀번호" secureTextEntry={true} />
        <Text style={[FONT.Regular, { color: theme.color.main }]}>{error}</Text>
        <TouchableOpacity
          onPress={handleEmailLogin}
          style={{
            width: d2p(100),
            height: d2p(40),
            borderRadius: 5, backgroundColor: theme.color.main,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            marginTop: h2p(50)
          }}>
          {loading ? <ActivityIndicator color={"black"} /> :
            <Text style={[FONT.Bold, { fontSize: 16, color: theme.color.white }]}>로그인</Text>}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </>
  );
};

export default EmailLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: d2p(20),
    marginBottom: h2p(50)
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.color.grayscale.a09ca4,
    paddingHorizontal: d2p(10),
    paddingVertical: h2p(15),
    borderRadius: 5,
    marginBottom: d2p(5),
    color: theme.color.black
  }
});