import { Dimensions, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { d2p, h2p } from '~/utils';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import BasicButton from '~/components/button/basicButton';
import { useMutation } from 'react-query';
import { emailVerify, getEmailCode } from '~/api/auth';

interface EmailSignupType {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    email: string
  }>
}

// * 숫자+영문+특수문자 포함 8자리 이상
let passwordCheck = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;

const EmailSignup = ({ navigation, route }: EmailSignupType) => {
  const [codeMode, setCodeMode] = useState(false);
  const [code, setCode] = useState("");
  const [verify, setVerify] = useState("");
  const [error, setError] = useState("");
  const [userInput, setUserInput] = useState({
    email: route.params?.email || "",
    password: "",
    confirmPassword: ""
  });

  const getEmailCodeMutation = useMutation("getEmailCode", (email: string) => getEmailCode(email), {
    onSuccess: (data) => {
      setCode(data);
      setCodeMode(true);
      console.log(data, 'data');
    }
  });

  const emailVerifyMutation = useMutation("emailVerify", ({ email, code }: { email: string, code: string }) =>
    emailVerify({ email, code }), {
    onSuccess: (data) => {
      // todo 인증됐는지 안됐는지 핸들링
      console.log(data, 'data');
    }
  });

  const getCode = () => {
    getEmailCodeMutation.mutate(userInput.email);
  };

  return (
    <>
      <View
        style={{ height: isIphoneX() ? getStatusBarHeight() : 0 }}
      />
      <KeyboardAwareScrollView
        bounces={false}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: getBottomSpace() + h2p(48) }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false} >
        <Text style={[FONT.Bold, {
          fontSize: 26, marginTop: h2p(40),
          textAlign: "center"
        }]}>🙌 환영해요!
        </Text>
        <Text style={[FONT.Regular, {
          textAlign: "center", marginTop: h2p(10),
          color: theme.color.grayscale.C_78737D
        }]}>
          맛있는 발견을 시작하기 전, 몇가지만 확인해주세요.
        </Text>
        <Text style={[FONT.Bold, { fontSize: 16, marginTop: h2p(80), marginLeft: d2p(20) }]}>
          이메일 주소
        </Text>
        <View style={styles.emailContainer}>
          <Text style={[FONT.Regular, { fontSize: 16 }]}>
            {userInput.email}
          </Text>
          <TouchableOpacity
            onPress={getCode}
            style={{
              borderWidth: 1,
              paddingHorizontal: d2p(7),
              paddingVertical: h2p(7),
              borderRadius: 5,
              borderColor: theme.color.main,
              backgroundColor: codeMode ? theme.color.main : theme.color.white
            }}>
            <Text style={[FONT.Medium, {
              color: codeMode ? theme.color.white : theme.color.main,
              fontSize: 12
            }]}>
              {codeMode ? "코드 재발급" : "인증코드 발급"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[FONT.SemiBold, styles.infoMsg]}>
          가입할 수 있는 이메일입니다. 회원가입을 시작할게요!
        </Text>

        <Text style={[FONT.Bold, { fontSize: 16, marginTop: h2p(40), marginLeft: d2p(20) }]}>
          인증코드
        </Text>
        <View style={[styles.textInput, {
          paddingVertical: 0,
          alignItems: "center",
          flexDirection: "row", justifyContent: "space-between"
        }]}>
          <TextInput
            // keyboardType="number-pad"
            autoCapitalize="none"
            placeholder="인증코드를 입력해주세요"
            placeholderTextColor={theme.color.grayscale.d2d0d5}
            style={[FONT.Regular, {
              width: Dimensions.get("window").width - d2p(95),
              paddingVertical: h2p(15),
              fontSize: 16, color: theme.color.black
            }]}
          />
          <TouchableOpacity
            onPress={() => emailVerifyMutation.mutate({ email: userInput.email, code })}
            style={{
              borderWidth: 1, borderColor: theme.color.main,
              borderRadius: 5,
              paddingHorizontal: d2p(7),
              paddingVertical: h2p(7),
            }}>
            <Text style={[FONT.Medium, { fontSize: 12, color: theme.color.main }]}>
              인증하기
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[FONT.Bold, { fontSize: 16, marginTop: h2p(40), marginLeft: d2p(20) }]}>
          비밀번호 입력
        </Text>
        <TextInput
          value={userInput.password}
          onChangeText={(e) => {
            if (userInput.confirmPassword && userInput.confirmPassword !== e) {
              setError("확인 비밀번호가 다릅니다");
            }
            else {
              setError("");
            }

            if (!passwordCheck.test(e)) {
              setVerify("숫자+영문+특수문자 포함 8자리 이상이어야 합니다");
            }
            else {
              setVerify("");
            }
            setUserInput({ ...userInput, password: e });
          }}
          textContentType="oneTimeCode"
          secureTextEntry={true}
          autoCapitalize="none"
          style={styles.textInput}
          placeholder="로그인에 사용할 비밀번호를 입력해주세요"
          placeholderTextColor={theme.color.grayscale.d2d0d5}
        />

        {(verify && userInput.password) ?
          <Text style={[FONT.Regular, {
            marginLeft: d2p(20),
            marginTop: h2p(10),
            fontSize: 12,
            color: theme.color.main
          }]}>{verify}</Text>
          :
          null
        }
        {!userInput.password ?
          <Text style={[FONT.SemiBold, styles.infoMsg]}>
            비밀번호는 숫자+영문+특수문자 포함 8자리 이상으로 설정해주세요.
          </Text>
          :
          null
        }

        <Text style={[FONT.Bold, { fontSize: 16, marginTop: h2p(40), marginLeft: d2p(20) }]}>
          비밀번호 확인
        </Text>
        <TextInput
          value={userInput.confirmPassword}
          onChangeText={(e) => {
            if (userInput.password !== e) {
              setError("확인 비밀번호가 다릅니다");
            }
            else {
              setError("");
            }
            setUserInput({ ...userInput, confirmPassword: e });
          }}
          textContentType="oneTimeCode"
          secureTextEntry={true}
          autoCapitalize="none"
          style={styles.textInput}
          placeholder="비밀번호를 한번 더 입력해주세요"
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

        <BasicButton
          disabled={Boolean(error) || Boolean(verify) || !userInput.password || !userInput.confirmPassword}
          onPress={() => navigation.navigate("TagSelect")}
          text="다음으로"
          bgColor={theme.color.white}
          textColor={theme.color.main}
          viewStyle={{ marginHorizontal: d2p(20), marginTop: h2p(60) }}
        />
        <Pressable
          onPress={() => navigation.goBack()}>
          <Text style={[FONT.SemiBold, {
            fontSize: 12, color: theme.color.grayscale.d2d0d5, textAlign: "center",
            marginTop: h2p(20)
          }]}>
            다른 이메일로 시도할래요
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </>
  );
};

export default EmailSignup;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emailContainer: {
    borderColor: theme.color.grayscale.f7f7fc,
    paddingVertical: h2p(15),
    paddingHorizontal: d2p(20),
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginTop: h2p(10),
    fontSize: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
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
  },
  infoMsg: {
    fontSize: 12,
    color: theme.color.grayscale.C_78737D,
    marginLeft: d2p(20),
    marginTop: h2p(10)
  }
});