import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import UserTagLayout from '~/components/layout/UserTagLayout';
import useNotification from '~/hooks/useNotification';
import Loading from '~/components/loading';

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<UserInfoType>;
}

const TagSelect = ({ route, navigation }: BadgeSelectProps) => {
  const [userInfo, setUserInfo] = useState<UserInfoType>();
  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [buttonEnabled, setButtonEnabled] = useState(false);
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
    // * 유효성 체크
    if (userBadge.foodStyle.every(v => !v.isClick)) {
      setIspopupOpen({ isOpen: true, content: "step1을 선택해주세요" });
      return;
    }
    if (userBadge.household.every(v => !v.isClick)) {
      setIspopupOpen({ isOpen: true, content: "step2을 선택해주세요" });
      return;
    }
    if (userBadge.occupation.every(v => !v.isClick) && userBadge.occupation.every(v => !v.content)) {
      setIspopupOpen({ isOpen: true, content: "step3을 선택해주세요" });
      return;
    }
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

    // todo 유효성 체크, 회원가입, 토큰 설정 

  };

  useEffect(() => {
    setUserInfo(route.params);
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
      ref={scrollRef}
      style={styles.container}
      // contentContainerStyle={{ flex: 1 }}
      showsVerticalScrollIndicator={false} >
      {/* <View style={{ backgroundColor: "rgba(0,0,0,0.5)" }} /> */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: h2p(30) }}>
        <Text style={[FONT.SemiBold, { fontSize: 26, color: theme.color.main }]}>
          {userInfo?.nickname}</Text>
        <Text style={[FONT.SemiBold, { fontSize: 26 }]}>님</Text>
        <Text style={[FONT.SemiBold, { fontSize: 26 }]}> 반가워요!</Text>
      </View>
      <UserTagLayout
        scrollRef={scrollRef}
        viewStyle={{ marginBottom: h2p(40) }}
        userBadge={userBadge} setUserBadge={(badge: BadgeType) => setUserBadge(badge)} />
      <BasicButton
        disabled={!buttonEnabled}
        onPress={handleNext} text="다음으로" bgColor={buttonEnabled ? theme.color.white : theme.color.grayscale.f7f7fc}
        textColor={buttonEnabled ? theme.color.main : theme.color.grayscale.d3d0d5}
        borderColor={buttonEnabled ? theme.color.main : theme.color.grayscale.e9e7ec}
        viewStyle={{ marginBottom: h2p(40) }} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: d2p(20)
  },
  title: {
    color: theme.color.black,
    fontSize: 26,
    includeFontPadding: false,
  }
});

export default TagSelect;