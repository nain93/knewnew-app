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
import { initialBadgeData } from '~/utils/data';
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

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<UserInfoType>;
}

const TagSelect = ({ route, navigation }: BadgeSelectProps) => {
  const [profile, setProfile] = useState(route.params?.profileImage || "");
  const [userInfo, setUserInfo] = useState<UserInfoType>({
    providerType: "kakao",
    providerKey: 0,
    email: "",
    nickname: "",
    age: 0,
    headline: "",
    profileImage: null,
    occupation: "",
    representBadge: "",
    tags: {
      foodStyle: [],
      household: [],
      occupation: [],
      taste: []
    }
  });
  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const nameInputRef = useRef<TextInput>(null);
  const [uploadBody, setUploadBody] = useState<{
    uri: string,
    name: string | undefined,
    type: string
  }>();

  const usePermission = useNotification();

  const setToken = useSetRecoilState(tokenState);
  const setIspopupOpen = useSetRecoilState(popupState);

  const signupMutation = useMutation("signup", (signupData: UserInfoType) => userSignup(signupData), {
    onSuccess: async (data) => {
      if (data) {
        navigation.navigate("Welcome", {
          userBadge: {
            foodLife: userBadge.foodStyle.filter(v => v.isClick)[0].title,
            lifeStyle: userBadge.occupation.filter(v => v.isClick)[0].title,
            household: userBadge.household.filter(v => v.isClick)[0].title
          }, userInfo
        });
        setToken(data.accessToken);
        await AsyncStorage.setItem("token", data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
        usePermission.notificationPermission({ token: data.accessToken });
      }
    }
  });

  const handleNext = async () => {
    // todo 유효성 체크
    if (route.params) {
      signupMutation.mutate({
        ...route.params,
        tags:
        {
          foodStyle: [userBadge.foodStyle.filter(v => v.isClick)[0].title],
          household: [userBadge.household.filter(v => v.isClick)[0].title],
          occupation: [userBadge.occupation.filter(v => v.isClick)[0].title]
        }
      });
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
      setProfile(`data:${v.mime};base64,${v.data}`);
    });
  };

  useEffect(() => {
    if (route.params) {
      setUserInfo(route.params);
    }
  }, [route.params]);

  useEffect(() => {
    if (userBadge.foodStyle.every(v => !v.isClick) ||
      userBadge.occupation.every(v => !v.isClick) ||
      (userBadge.household.every(v => !v.isClick) && userBadge.occupation.every(v => !v.content))
    ) {
      setButtonEnabled(false);
    }
    else {
      setButtonEnabled(true);
    }
  }, [userBadge]);

  if (signupMutation.isLoading) {
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
          setUserInfo({ ...userInfo, profileImage: null });
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
        <View style={[styles.genderSelectWrap, { marginLeft: "auto" }]}>
          <Pressable
            onPress={() => console.log("gender")}
            style={styles.genderSelect}>
            <View style={{
              width: d2p(10), height: d2p(10),
              borderRadius: 10,
              backgroundColor: theme.color.main
            }} />
          </Pressable>
          <Text style={[FONT.Regular, {
            fontSize: 16,
            width: d2p(45), marginRight: d2p(10)
          }]}>여성</Text>
        </View>
        <View style={styles.genderSelectWrap}>
          <Pressable
            onPress={() => console.log("gender")}
            style={styles.genderSelect} />
          <Text style={[FONT.Regular, {
            fontSize: 16, width: d2p(45)
          }]}>남성</Text>
        </View>
      </View>

      <Text style={[FONT.Bold, { fontSize: 16, marginTop: h2p(40), marginHorizontal: d2p(20) }]}>
        자주 이용하는 마켓
        <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.d2d0d5 }]}> (선택)</Text>
      </Text>
      <View style={{
        flexDirection: "row", marginTop: h2p(20), marginBottom: h2p(48),
        flexWrap: "wrap"
      }}>
        <SelectMarketButton market="마켓컬리" isClick={true} viewStyle={{ marginRight: d2p(5), marginLeft: d2p(20) }} />
        <SelectMarketButton market="쿠팡" isClick={true} viewStyle={{ marginRight: d2p(5) }} />
        <SelectMarketButton market="B마트" isClick={true} viewStyle={{ marginRight: d2p(5) }} />
        <SelectMarketButton market="SSG" isClick={true} viewStyle={{ marginRight: d2p(5) }} />
        <SelectMarketButton market="네이버쇼핑" isClick={true} />
        <SelectMarketButton market="기타" isClick={true} viewStyle={{ marginTop: h2p(10), marginLeft: d2p(20) }} />
        <TextInput style={[FONT.Regular, {
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
      </View>
      <BasicButton
        // disabled={!buttonEnabled}
        onPress={() => {
          navigation.navigate("Welcome");
          // navigation.navigate("Welcome", {
          //   userBadge: {
          //     foodLife: userBadge.foodStyle.filter(v => v.isClick)[0].title,
          //     lifeStyle: userBadge.occupation.filter(v => v.isClick)[0].title,
          //     household: userBadge.household.filter(v => v.isClick)[0].title
          //   }, userInfo
          // });
        }} text="다음으로" bgColor={buttonEnabled ? theme.color.white : theme.color.grayscale.f7f7fc}
        textColor={buttonEnabled ? theme.color.main : theme.color.grayscale.d3d0d5}
        borderColor={buttonEnabled ? theme.color.main : theme.color.grayscale.e9e7ec}
        viewStyle={{ marginBottom: h2p(40), marginHorizontal: d2p(20) }} />
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

export default TagSelect;