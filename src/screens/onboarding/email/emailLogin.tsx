import { ActivityIndicator, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationStackProp } from 'react-navigation-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { d2p, h2p } from '~/utils';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { userLogin } from '~/api/user';
import { useSetRecoilState } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationRoute } from 'react-navigation';

interface EmailLoginProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    email: string
  }>
}

const EmailLogin = ({ navigation, route }: EmailLoginProps) => {
  const [loading, setLoading] = useState(false);
  const setToken = useSetRecoilState(tokenState);
  const [error, setError] = useState("");
  const [userInput, setUserInput] = useState({
    email: route.params?.email || "",
    password: ""
  });

  const handleNext = async () => {
    // todo 
    setLoading(true);
    const data = await userLogin({ token: "", providerType: "email", userInput });
    if (data.accessToken) {
      setToken(data.accessToken);
      AsyncStorage.setItem("token", data.accessToken);
      AsyncStorage.setItem("refreshToken", data.refreshToken);
      setError("");
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
    }
    else {
      setError("유저 정보가 없습니다.");
    }
    setLoading(false);
  };

  return (
    <>
      <Header
        isBorder={false}
        headerLeft={
          <LeftArrowIcon onBackClick={() => navigation.goBack()} />
        }
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ flex: 1 }}
        style={styles.container}>
        <Text style={[FONT.Bold, { fontSize: 26, marginTop: h2p(30) }]}>이메일로 로그인</Text>
        <TextInput
          placeholderTextColor={theme.color.grayscale.d3d0d5}
          value={userInput.email}
          onChangeText={(e) => setUserInput({ ...userInput, email: e })}
          autoCapitalize="none" style={[FONT.Regular, styles.textInput]} placeholder="이메일 주소를 입력하세요" keyboardType="email-address" />
        <TextInput
          placeholderTextColor={theme.color.grayscale.d3d0d5}
          value={userInput.password}
          onChangeText={(e) => setUserInput({ ...userInput, password: e })}
          autoCapitalize="none"
          style={[FONT.Regular, styles.textInput]} placeholder="비밀번호를 입력하세요" secureTextEntry={true} />
        <Text style={[FONT.Bold, { color: theme.color.main }]}>{error}</Text>
        <Text style={{
          marginTop: "auto",
          fontWeight: "bold",
          marginBottom: h2p(10), color: theme.color.grayscale.C_443e49,
          textAlign: "center"
        }}>
          맛있는 정보가 지금도 계속 올라오고 있어요!
        </Text>
        <TouchableOpacity
          onPress={handleNext}
          style={{
            width: Dimensions.get("window").width - d2p(40),
            paddingVertical: h2p(14),
            borderRadius: 5, backgroundColor: theme.color.main,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center"
          }}>
          {loading ? <ActivityIndicator color={"white"} /> :
            <Text style={[FONT.Bold, { color: theme.color.white }]}>후다닥 입장하기</Text>}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </>
  );
};

export default EmailLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: d2p(20),
    paddingTop: h2p(20),
    marginBottom: h2p(40) + getBottomSpace()
  },
  textInput: {
    borderColor: theme.color.grayscale.e9e7ec,
    paddingVertical: h2p(10),
    borderRadius: 5,
    borderBottomWidth: 1,
    color: theme.color.black,
    fontSize: 16,
    marginTop: h2p(40)
  }
});