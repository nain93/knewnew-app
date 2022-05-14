import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef } from 'react';
import { NavigationType } from '~/types';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import Header from '~/components/header';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { plusIcon } from '~/assets/icons';
import { TextInput } from 'react-native-gesture-handler';
import BasicButton from '~/components/button/basicButton';

const EditProfile = ({ navigation }: NavigationType) => {
  const nameInputRef = useRef<TextInput>(null);
  const selfInputRef = useRef<TextInput>(null);

  return (
    <>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} imageStyle={{ width: d2p(11), height: h2p(25) }} />}
        title="프로필 수정"
        headerRightPress={() => console.log("complete")}
        headerRight={<Text style={{ color: theme.color.main }}>완료</Text>} />
      <View style={styles.container}>
        <TouchableOpacity style={styles.profileImage}>
          <Image source={plusIcon}
            style={{ width: d2p(18), height: h2p(18), position: "absolute", bottom: 0, right: 0 }} />
        </TouchableOpacity>

        <View style={styles.inputForm}>
          <View style={{ flexDirection: "row", paddingHorizontal: d2p(20), marginBottom: d2p(10) }}>
            <Text style={styles.inputTitle}>닉네임</Text>
            <Text style={styles.inputText}>(0/40자)</Text>
          </View>
          <Pressable onPress={() => nameInputRef.current?.focus()} style={styles.textInput}>
            <TextInput
              ref={nameInputRef}
              autoCapitalize="none"
              style={{ fontSize: 16, padding: 0, includeFontPadding: false }}
              placeholder="닉네임을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
            <Text style={{ fontSize: 12, color: theme.color.grayscale.ff5d5d }}> (필수)</Text>
          </Pressable>
        </View>

        <View style={[styles.inputForm, { marginTop: h2p(40) }]}>
          <View style={{ flexDirection: "row", paddingHorizontal: d2p(20), marginBottom: d2p(10) }}>
            <Text style={styles.inputTitle}>자기소개</Text>
            <Text style={styles.inputText}>(0/140자)</Text>
          </View>
          <Pressable onPress={() => selfInputRef.current?.focus()} style={styles.textInput}>
            <TextInput
              ref={selfInputRef}
              autoCapitalize="none"
              style={{ fontSize: 16, padding: 0, includeFontPadding: false }}
              placeholder="자기소개를 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
            <Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4 }}> (선택)</Text>
          </Pressable>
        </View>

        <BasicButton viewStyle={{ alignSelf: "center", marginTop: h2p(40) }} onPress={() => console.log("select")}
          text="소개 태그 선택" textColor={theme.color.main} bgColor={theme.color.white} />
      </View>
    </>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: h2p(30)
  },
  profileImage: {
    width: d2p(60),
    height: d2p(60),
    borderRadius: 60,
    marginBottom: h2p(40),
    borderWidth: 1,
    alignSelf: "center",
    borderColor: theme.color.grayscale.eae7ec
  },
  inputForm: {

  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: d2p(10)
  },
  inputText: {
    fontSize: 12,
    color: theme.color.grayscale.d3d0d5
  },
  textInput: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(15),
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec
  }
});