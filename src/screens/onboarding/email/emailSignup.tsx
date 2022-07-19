import { ActivityIndicator, Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, TextInput, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationStackProp } from 'react-navigation-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import theme from '~/styles/theme';
import { NavigationRoute } from 'react-navigation';
import { alertIcon, checkIcon, colorEyeIcon, eyeIcon } from '~/assets/icons';
import { hitslop } from '~/utils/constant';

interface EmailSignupProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    email: string
  }>
}

const EmailSignup = ({ navigation, route }: EmailSignupProps) => {
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [isSecure, setIsSecure] = useState({
    password: true,
    passwordConfirm: true
  });
  const [userInput, setUserInput] = useState({
    email: route.params?.email || "",
    password: "",
    passwordConfirm: "",
    nickname: ""
  });

  const handleNext = () => {
    navigation.navigate("TagSelect", userInput);
  };

  useEffect(() => {
    if (userInput.email &&
      userInput.password &&
      userInput.passwordConfirm &&
      userInput.nickname) {
      setDisable(false);
    }
    else {
      setDisable(true);
    }
  }, [userInput]);

  useEffect(() => {
    if (userInput.password && userInput.password === userInput.passwordConfirm) {
      setPasswordError("비밀번호가 일치합니다");
    }
    else {
      setPasswordError("");
    }
  }, [userInput.passwordConfirm]);

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
        <Text style={[FONT.Bold, { fontSize: 26, marginTop: h2p(30) }]}>이메일로 가입하기</Text>
        <TextInput
          placeholderTextColor={theme.color.grayscale.d3d0d5}
          value={userInput.email}
          onChangeText={(e) => setUserInput({ ...userInput, email: e })}
          autoCapitalize="none" style={styles.textInput} placeholder="이메일 주소를 입력하세요" keyboardType="email-address" />

        <View style={[styles.textInput, {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between", paddingVertical: 0,
        }]}>
          <TextInput
            style={{ paddingVertical: h2p(10), width: Dimensions.get("window").width - d2p(55) }}
            placeholderTextColor={theme.color.grayscale.d3d0d5}
            value={userInput.password}
            onChangeText={(e) => setUserInput({ ...userInput, password: e })}
            autoCapitalize="none"
            placeholder="비밀번호를 입력하세요" secureTextEntry={isSecure.password} />
          <Pressable hitSlop={hitslop} onPress={() => setIsSecure({ ...isSecure, password: !isSecure.password })}>
            <Image source={isSecure.password ? eyeIcon : colorEyeIcon} style={{ width: d2p(15), height: d2p(10) }} />
          </Pressable>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: h2p(10) }}>
          <Image source={alertIcon} style={{ width: d2p(10), height: d2p(10), marginRight: d2p(5) }} />
          <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
            비밀번호는 숫자+영문+특수문자 8자리 이상 설정해주세요</Text>
        </View>

        <View style={[styles.textInput, {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: h2p(20), paddingVertical: 0,
        }]}>
          <TextInput
            style={{ paddingVertical: h2p(10), width: Dimensions.get("window").width - d2p(55) }}
            placeholderTextColor={theme.color.grayscale.d3d0d5}
            value={userInput.passwordConfirm}
            onChangeText={(e) => setUserInput({ ...userInput, passwordConfirm: e })}
            autoCapitalize="none"
            placeholder="비밀번호를 한번 더 입력하세요" secureTextEntry={isSecure.passwordConfirm} />
          {/* onPress={() => setIsSecure({ ...isSecure, passwordConfirm: !isSecure.passwordConfirm })} */}
          <Pressable hitSlop={hitslop}>
            <Image source={isSecure.passwordConfirm ? eyeIcon : colorEyeIcon} style={{ width: d2p(15), height: d2p(10) }} />
          </Pressable>
          {
            passwordError ?
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                position: "absolute", top: h2p(35),
              }}>
                <Image source={checkIcon} style={{ width: d2p(10), height: d2p(8) }} />
                <Text style={[FONT.Bold, {
                  color: theme.color.main, marginTop: h2p(3),
                  fontSize: 12,
                  marginLeft: d2p(5)
                }]}>{passwordError}</Text>
              </View>
              :
              null
          }
        </View>
        <TextInput
          placeholderTextColor={theme.color.grayscale.d3d0d5}
          value={userInput.nickname}
          onChangeText={(e) => setUserInput({ ...userInput, nickname: e })}
          autoCapitalize="none" style={styles.textInput} placeholder="닉네임을 입력해주세요" />
        <TouchableOpacity
          disabled={disable}
          onPress={handleNext}
          style={{
            marginTop: "auto",
            width: Dimensions.get("window").width - d2p(40),
            paddingVertical: h2p(14),
            borderRadius: 5,
            backgroundColor: disable ? theme.color.grayscale.f7f7fc : theme.color.white,
            borderColor: disable ? theme.color.grayscale.eae7ec : theme.color.main,
            borderWidth: 1,
            justifyContent: "center",
            alignItems: "center"
          }}>
          {loading ? <ActivityIndicator color={"white"} /> :
            <Text style={[FONT.Bold,
            { color: disable ? theme.color.grayscale.d3d0d5 : theme.color.main }]}>다음으로</Text>}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </>
  );
};

export default EmailSignup;

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
    marginTop: h2p(30)
  }
});