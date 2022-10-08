import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";
import { BadgeType } from '~/types';
import { popupState, tokenState } from '~/recoil/atoms';
import { useSetRecoilState } from 'recoil';
import { UserInfoType } from '~/types/user';
import { FONT } from '~/styles/fonts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useMutation } from 'react-query';
import { userSignup } from '~/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useNotification from '~/hooks/useNotification';
import Loading from '~/components/loading';
import { noProfile } from '~/assets/images';
import FastImage from 'react-native-fast-image';
import { plusIcon } from '~/assets/icons';
import ImageCropPicker from 'react-native-image-crop-picker';
import SelectMarketButton from '~/components/badge';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { preSiginedImages, uploadImage } from '~/api';
import MarketLayout from '~/components/layout/MarketLayout';

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<UserInfoType>;
}

const WriteProfile = ({ route, navigation }: BadgeSelectProps) => {
  const [userInfo, setUserInfo] = useState<UserInfoType>({
    providerType: "kakao",
    providerKey: 0,
    email: "",
    nickname: "",
    birth: "",
    gender: "",
    profileImage: "",
    occupation: "",
    markets: [],
    isAgreePolicy: false
  });
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const [etcMarketClick, setEtcMarketClick] = useState(false);
  const [uploadBody, setUploadBody] = useState<{
    uri: string,
    name: string | undefined,
    type: string
  }>();

  const usePermission = useNotification();

  const setToken = useSetRecoilState(tokenState);
  const setIspopupOpen = useSetRecoilState(popupState);

  const signUpMutation = useMutation("signUp", (signupData: UserInfoType) => userSignup(signupData), {
    onSuccess: async (data) => {
      if (data) {
        navigation.navigate("Welcome", { userInfo });
        setToken(data.accessToken);
        await AsyncStorage.setItem("token", data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
        usePermission.notificationPermission({ token: data.accessToken });
      }
    }
  });

  // const presignMutation = useMutation("presignImages",
  // async (fileName: Array<string>) => preSiginedImages({ token, fileName, route: "user" }),
  // {
  //   onSuccess: async (data) => {
  //     if (uploadBody) {
  //       await uploadImage(uploadBody, data[0]);
  //     }
  //     setProfileInfo({ ...profileInfo, profileImage: data[0] });
  //     // todo signUp 
  //   }
  // });



  // const handleNext = () => {
  //   //@ts-ignore
  //   navigation.reset({ index: 0, routes: [{ name: "Welcome", params: { nickname: userInfo.nickname } }] });
  // };

  const handleNext = () => {
    console.log(userInfo, 'userInfo');
    if (userInfo.profileImage) {
      // todo 사진있을경우 프리사인
    }
    else {
      // signUpMutation.mutate(userInfo);
    }
  };

  const pickImage = () => {
    ImageCropPicker.openPicker({
      mediaType: "photo",
      crop: "true",
      includeBase64: true,
      compressImageMaxWidth: 720,
      compressImageMaxHeight: 720
    }).then(v => {
      setUploadBody(
        {
          uri: v.path,
          type: v.mime,
          name: Platform.OS === 'ios' ? v.filename : `${Date.now()}.${v.mime === 'image/jpeg' ? 'jpg' : 'png'}`,
        }
      );
      setUserInfo({ ...userInfo, profileImage: `data:${v.mime};base64,${v.data}` });
    });
  };

  useEffect(() => {
    if (route.params) {
      console.log(route.params, 'route.params');
      setUserInfo({ ...userInfo, ...route.params });
    }
  }, [route.params]);

  if (signUpMutation.isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <KeyboardAwareScrollView
      bounces={false}
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false} >
      <Text style={[FONT.Bold, {
        fontSize: 26, marginTop: isIphoneX() ? getStatusBarHeight() + h2p(40) : h2p(40),
        textAlign: "center"
      }]}>🙌 환영해요!
      </Text>
      <Text style={[FONT.Regular, {
        textAlign: "center", marginTop: h2p(10),
        color: theme.color.grayscale.C_78737D
      }]}>
        맛있는 발견을 시작하기 전, 몇가지만 확인해주세요.
      </Text>
      <TouchableOpacity onPress={pickImage} style={{
        marginTop: h2p(35),
        width: d2p(60), height: d2p(60), alignSelf: "center",
        borderRadius: 60
      }}>
        <FastImage source={userInfo?.profileImage ? { uri: userInfo?.profileImage } : noProfile} style={{
          width: d2p(60), height: d2p(60),
          borderRadius: 60,
          borderWidth: 1,
          borderColor: theme.color.grayscale.eae7ec
        }} />
        <Image source={plusIcon} style={{
          backgroundColor: theme.color.black,
          position: "absolute", right: 0, bottom: 0,
          borderRadius: 18,
          width: d2p(18), height: d2p(18)
        }} />
      </TouchableOpacity>
      <Pressable onPress={() => {
        if (userInfo) {
          setUserInfo({ ...userInfo, profileImage: "" });
        }
      }}>
        <Text style={[FONT.Regular, {
          textAlign: "center", marginTop: h2p(10),
          fontSize: 12,
          color: theme.color.grayscale.d2d0d5
        }]}>삭제</Text>
      </Pressable>

      <View style={{
        flexDirection: "row", alignItems: "center",
        marginTop: h2p(20),
        paddingHorizontal: d2p(20), marginBottom: d2p(10)
      }}>
        <Text style={[styles.inputTitle, FONT.Bold]}>닉네임</Text>
        <Text style={[styles.inputText, FONT.Regular, {
          color: userInfo.nickname.length >= 40 ? theme.color.main : theme.color.grayscale.d2d0d5
        }]}>{`(${userInfo.nickname.length}/40자)`}</Text>
      </View>
      <Pressable onPress={() => nameInputRef.current?.focus()} style={styles.textInput}>
        <TextInput
          multiline
          value={userInfo.nickname}
          maxLength={41}
          onChangeText={(e) => {
            if (e.length > 40) {
              setUserInfo({ ...userInfo, nickname: e.slice(0, e.length - 1) });
            }
            else {
              setUserInfo({ ...userInfo, nickname: e });
            }
          }}
          ref={nameInputRef}
          autoCapitalize="none"
          style={[FONT.Regular, {
            color: theme.color.black,
            minWidth: d2p(135),
            fontSize: 16, padding: 0, includeFontPadding: false, paddingTop: 0
          }]}
          placeholder="닉네임을 입력해주세요." placeholderTextColor={theme.color.grayscale.d2d0d5} />
        {!userInfo.nickname &&
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.ff5d5d }]}> (필수)</Text>
        }
      </Pressable>

      <Text style={[styles.inputTitle, {
        marginBottom: h2p(10),
        marginTop: h2p(40), marginLeft: d2p(20)
      }, FONT.Bold]}>
        기본 정보
      </Text>
      <View style={styles.textInput}>
        <TextInput
          onChangeText={(e) => setUserInfo({ ...userInfo, birth: e })}
          keyboardType="number-pad"
          maxLength={4}
          autoCapitalize="none"
          style={[FONT.Regular, {
            color: theme.color.black,
            minWidth: d2p(90),
            fontSize: 16, padding: 0, includeFontPadding: false, paddingTop: 0,
            textAlign: "center"
          }]}
          placeholder="YYYY" placeholderTextColor={theme.color.grayscale.d2d0d5} />
        <Text style={[FONT.Medium, { fontSize: 16 }]}>년생</Text>
        <Pressable
          onPress={() => setUserInfo({ ...userInfo, gender: "female" })}
          style={[styles.genderSelectWrap, { marginLeft: "auto" }]}>
          <View
            style={styles.genderSelect}>
            {userInfo.gender === "female" &&
              <View style={{
                width: d2p(10), height: d2p(10),
                borderRadius: 10,
                backgroundColor: theme.color.main
              }} />
            }
          </View>
          <Text style={[FONT.Regular, {
            fontSize: 16,
            width: d2p(45), marginRight: d2p(10)
          }]}>여성</Text>
        </Pressable>
        <Pressable
          onPress={() => setUserInfo({ ...userInfo, gender: "male" })}
          style={styles.genderSelectWrap}>
          <View
            style={styles.genderSelect}>
            {userInfo.gender === "male" &&
              <View style={{
                width: d2p(10), height: d2p(10),
                borderRadius: 10,
                backgroundColor: theme.color.main
              }} />
            }
          </View>
          <Text style={[FONT.Regular, {
            fontSize: 16, width: d2p(45)
          }]}>남성</Text>
        </Pressable>
      </View>

      <Text style={[FONT.Bold, { fontSize: 16, marginTop: h2p(40), marginHorizontal: d2p(20) }]}>
        자주 이용하는 마켓
        <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.d2d0d5 }]}> (선택)</Text>
      </Text>
      <View style={{
        flexDirection: "row", marginTop: h2p(20), marginBottom: h2p(48),
        flexWrap: "wrap"
      }}>
        <MarketLayout
          viewStyle={{ paddingHorizontal: d2p(20) }}
          markets={userInfo.markets}
          setMarkets={(markets: string[]) => setUserInfo({ ...userInfo, markets })} />
        <SelectMarketButton
          onPress={() => setEtcMarketClick(!etcMarketClick)}
          market="기타" isClick={etcMarketClick} viewStyle={{ marginTop: h2p(10), marginLeft: d2p(20) }} />
        {etcMarketClick &&
          <TextInput
            onChangeText={(e) => setUserInfo({ ...userInfo, markets: userInfo.markets.concat(e) })}
            style={[FONT.Regular, {
              width: Dimensions.get("window").width - d2p(100),
              borderBottomColor: theme.color.grayscale.f7f7fc,
              borderBottomWidth: 1,
              marginLeft: "auto",
              color: theme.color.black,
              fontSize: 16,
              paddingRight: d2p(20)
            }]}
            placeholder="뉴뉴가 모르는 마켓이 있다면, 알려주세요!"
            placeholderTextColor={theme.color.grayscale.d2d0d5}
            autoCapitalize="none"
          />
        }
      </View>
      <View style={{ marginBottom: h2p(40) }}>
        <BasicButton
          loading={signUpMutation.isLoading}
          // disabled={!userInfo.nickname || !userInfo.birth || !userInfo.gender}
          onPress={handleNext} text="다음으로" bgColor={theme.color.white}
          textColor={theme.color.main}
          viewStyle={{ marginHorizontal: d2p(20) }} />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: theme.color.black,
    fontSize: 26,
    includeFontPadding: false,
  },
  inputTitle: {
    fontSize: 16,
    marginRight: d2p(10)
  },
  inputText: {
    fontSize: 12,
  },
  textInput: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(15),
    flexDirection: "row", alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.color.grayscale.f7f7fc
  },
  genderSelectWrap: {
    flexDirection: "row", alignItems: "center",
  },
  genderSelect: {
    borderWidth: 1,
    borderColor: theme.color.grayscale.e9e7ec,
    width: d2p(20),
    height: d2p(20),
    borderRadius: 20,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default WriteProfile;