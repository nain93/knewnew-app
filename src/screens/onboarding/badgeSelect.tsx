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

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<{
    userInfo: UserInfoType
    userBadge: BadgeType
  }>;
}

const BadgeSelect = ({ route, navigation }: BadgeSelectProps) => {
  const [signupData, setSignupData] = useState<UserInfoType>();
  const [userBadge, setUserBadge] = useState<BadgeType>({
    interest: [],
    household: [],
    taste: []
  });
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
      // todo 토큰 리코일, asynstoarge에 저장
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
      <View style={{ marginBottom: h2p(40) }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.title, FONT.SemiBold, { lineHeight: 30 }]}>나를 </Text>
          <Text style={[styles.title, { color: theme.color.main, lineHeight: 30 }, FONT.SemiBold]}>대표하는 뱃지</Text>
          <Text style={[styles.title, { lineHeight: 31 }, FONT.SemiBold]}>를</Text>
        </View>
        <Text style={[styles.title, FONT.SemiBold]}>골라주세요.</Text>
        <Text style={[styles.subTitle, FONT.Regular]}>선택하신 관심사 중에서</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[{ fontWeight: 'bold' }, FONT.Bold]}>나를 대표하는 뱃지 1개</Text>
          <Text style={FONT.Regular}>를 선택해주세요.</Text>
        </View>
        <Text style={[styles.badgeGuide, FONT.Regular]}>대표 뱃지는 저장 후 7일동안 다시 변경할 수 없습니다.</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}><Text style={[{ ...styles.menu, marginTop: 0 }, FONT.Regular]}>관심사 </Text>
          <Text style={[{ color: theme.color.main }, FONT.Regular]}>*</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {React.Children.toArray(userBadge.interest.map((item, idx) => {
            if (item.masterBadge) {
              return (
                <View
                  style={[styles.tag, { borderColor: theme.color.main }]}>
                  <Image source={colorCheck} resizeMode="contain" style={{ width: 10, height: 8, marginRight: 5 }} />
                  <Text style={{ color: theme.color.main, fontWeight: "500" }}>{item.title}</Text>
                </View>
              );
            }
            if (item.isClick) {
              return (
                <TouchableOpacity
                  style={styles.tag}
                  onPress={() => {
                    setUserBadge({
                      ...userBadge, interest: userBadge.interest.map((v, i) => {
                        if (i === idx) {
                          return { ...v, masterBadge: true };
                        }
                        else {
                          return { ...v, masterBadge: false };
                        }
                      })
                    });
                  }}>
                  <Text style={{ color: theme.color.black, fontWeight: "500" }}>{item.title}</Text>
                </TouchableOpacity>
              );
            }
            else {
              return (
                <Badge type="unabled" badge="interest" text={item.title} idx={idx} isClick={userBadge.interest[idx].isClick}
                  userBadge={userBadge} setUserBadge={(interestProp) => setUserBadge({ ...userBadge, interest: interestProp })} />
              );
            }
          }
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...styles.menu }}><Text style={FONT.Regular}>가족구성 </Text>
          <Text style={[{ color: theme.color.main }, FONT.Regular]}>*</Text>
          <Text style={[styles.guide, FONT.Regular]}>1가지만 선택해주세요</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {React.Children.toArray(userBadge.household.map((item, idx) => (
            <Badge type="unabled" badge="household" text={item.title} idx={idx} isClick={userBadge.household[idx].isClick}
              userBadge={userBadge} setUserBadge={(householdProp) => setUserBadge({ ...userBadge, household: householdProp })} />
          )))}
        </View>
        <Text style={[styles.menu, FONT.Regular]}>입맛</Text>
        <View style={{ flexDirection: 'row', marginBottom: 'auto' }}>
          {React.Children.toArray(userBadge.taste.map((item, idx) => (
            <Badge type="unabled" badge="taste" text={item.title} idx={idx} isClick={userBadge.taste[idx].isClick}
              userBadge={userBadge} setUserBadge={(tasteProp) => setUserBadge({ ...userBadge, taste: tasteProp })}
            />
          )))}
        </View>
        <BasicButton onPress={handleSignUp} text="선택완료" bgColor={theme.color.main} textColor={theme.color.white}
          viewStyle={{ marginTop: h2p(41), marginBottom: h2p(40) }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: d2p(42.5),
    paddingHorizontal: d2p(20)
  },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    borderColor: theme.color.grayscale.eae7ec,
    marginTop: d2p(10), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
  badgeGuide: {
    color: theme.color.main,
    marginTop: h2p(20),
    fontSize: 12
  },
  menu: {
    marginTop: h2p(40),
    marginBottom: h2p(5)
  },
  guide: {
    marginLeft: 15,
    color: theme.color.grayscale.a09ca4,
    fontSize: 12
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 14,
    color: theme.color.black,
    marginTop: d2p(20),
  },
  select: {
    borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 16,
    marginTop: d2p(8), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
});

export default BadgeSelect;