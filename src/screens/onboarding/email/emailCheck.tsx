import { ActivityIndicator, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p } from '~/utils';
import { NavigationStackProp } from 'react-navigation-stack';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getBottomSpace } from 'react-native-iphone-x-helper';

interface EmailCheckProps {
  navigation: NavigationStackProp;
}

const EmailCheck = ({ navigation }: EmailCheckProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleEmailCheck = async () => {
    if (!email) {
      setError("내용을 입력해주세요.");
      return;
    }
    setLoading(true);
    // todo email 존재여부 체크
    // 존재하면
    // navigation.navigate("emailLogin", { email });
    // 없으면
    navigation.navigate("emailSignup", { email });
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
        <Text style={[FONT.Bold, { fontSize: 26, marginTop: h2p(30) }]}>이메일로 뉴뉴 시작하기</Text>
        <TextInput
          placeholderTextColor={theme.color.grayscale.d3d0d5}
          value={email}
          onChangeText={(e) => setEmail(e)}
          autoCapitalize="none" style={[FONT.Regular, styles.textInput]} placeholder="이메일 주소를 입력하세요" keyboardType="email-address" />
        <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.main, marginTop: h2p(5) }]}>{error}</Text>
        <TouchableOpacity
          onPress={handleEmailCheck}
          style={{
            width: Dimensions.get("window").width - d2p(40),
            paddingVertical: h2p(14),
            borderRadius: 5, backgroundColor: theme.color.white,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "auto",
            borderColor: theme.color.main,
            borderWidth: 1
          }}>
          {loading ? <ActivityIndicator color={"black"} /> :
            <Text style={[FONT.Bold, { color: theme.color.main }]}>다음으로</Text>}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </>
  );
};

export default EmailCheck;

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
    marginTop: h2p(50)
  }
});