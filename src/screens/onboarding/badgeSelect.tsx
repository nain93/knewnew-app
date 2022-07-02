import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import Badge from '~/components/badge';
import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";
import { BadgeType } from '~/types';
import { userSignup } from '~/api/user';
import { colorCheck } from '~/assets/icons';
import { useSetRecoilState } from 'recoil';
import { popupState, tokenState } from '~/recoil/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfoType } from '~/types/user';
import { FONT } from '~/styles/fonts';
import { initialBadgeData } from '~/utils/data';
import OnepickLayout from '~/components/layout/OnepickLayout';

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<{
    userInfo: UserInfoType
    userBadge: BadgeType
  }>;
}

const BadgeSelect = ({ route, navigation }: BadgeSelectProps) => {
  const [signupData, setSignupData] = useState<UserInfoType>();
  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const setIspopupOpen = useSetRecoilState(popupState);
  const setToken = useSetRecoilState(tokenState);

  const handleSignUp = async () => {
    if (userBadge.interest.every(v => !v.masterBadge)) {
      setIspopupOpen({ isOpen: true, content: "대표 뱃지를 선택해주세요" });
      return;
    }

    if (signupData) {
      const copy: { [index: string]: Array<{ isClick: boolean, title: string }> } = { ...userBadge };
      const tags = Object.keys(copy).reduce<Array<string>>((acc, cur) => {
        acc = acc.concat(copy[cur].filter(v => v.isClick).map(v => v.title));
        return acc;
      }, []);
      const { accessToken, refreshToken } = await userSignup({
        ...signupData,
        representBadge: userBadge.interest.filter(v => v.masterBadge)[0].title,
        tags
      });
      if (accessToken) {
        setToken(accessToken);
        AsyncStorage.setItem("token", accessToken);
        AsyncStorage.setItem("refreshToken", refreshToken);
        navigation.navigate("Welcome", userBadge.interest.filter(v => v.isClick));
      }
    }
  };

  useEffect(() => {
    if (route.params) {
      setSignupData(route.params.userInfo);
      setUserBadge(route.params.userBadge);
    }
  }, [route.params]);


  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={[styles.title, FONT.SemiBold, { lineHeight: 30 }]}>나를 </Text>
        <Text style={[styles.title, { color: theme.color.main, lineHeight: 30 }, FONT.SemiBold]}>대표하는 뱃지</Text>
        <Text style={[styles.title, { lineHeight: 31 }, FONT.SemiBold]}>를</Text>
      </View>
      <OnepickLayout userBadge={userBadge} setUserBadge={(badge: BadgeType) => setUserBadge(badge)} />
      <BasicButton onPress={handleSignUp} text="선택완료" bgColor={theme.color.main} textColor={theme.color.white}
        viewStyle={{ marginTop: h2p(41), marginBottom: h2p(40) }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: d2p(42.5),
    paddingHorizontal: d2p(20)
  },
  title: {
    fontSize: 26
  },
  select: {
    borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 16,
    marginTop: d2p(8), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
});

export default BadgeSelect;