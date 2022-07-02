import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";
import { BadgeType } from '~/types';
import SelectLayout from '~/components/selectLayout';
import { popupState } from '~/recoil/atoms';
import { useSetRecoilState } from 'recoil';
import { UserInfoType } from '~/types/user';
import { FONT } from '~/styles/fonts';
import { initialBadgeData } from '~/utils/data';

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<UserInfoType>;
}

const TagSelect = ({ route, navigation }: BadgeSelectProps) => {

  const [userInfo, setUserInfo] = useState<UserInfoType>();

  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);

  const setIspopupOpen = useSetRecoilState(popupState);

  const handleNext = async () => {
    if (userBadge.household.every(v => !v.isClick) ||
      userBadge.interest.every(v => !v.isClick)) {
      setIspopupOpen({ isOpen: true, content: "관심사(or가족구성)을 선택해주세요" });
      return;
    }
    const copy: { [index: string]: Array<{ isClick: boolean, title: string }> } = { ...userBadge };
    const badge = Object.keys(userBadge).reduce<Array<{ isClick: boolean, title: string }>>((acc, cur) => {
      acc = acc.concat(copy[cur].filter(v => v.isClick));
      return acc;
    }, []);
    if (badge.length > 10) {
      setIspopupOpen({ isOpen: true, content: "태그는 10개까지만 선택할 수 있어요" });
      return;
    }
    navigation.navigate("BadgeSelect", { userBadge, userInfo });
  };

  useEffect(() => {
    setUserInfo(route.params);
  }, [route.params]);

  return (
    <View style={styles.container}>
      <SelectLayout
        headerComponent={
          <View style={{ marginBottom: h2p(40), marginTop: h2p(42.5), }}>
            <Text style={[styles.title, FONT.SemiBold]}>나를 소개하는 태그를</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.title, { color: theme.color.main }, FONT.SemiBold]}>2가지 이상 </Text>
              <Text style={[styles.title, FONT.SemiBold]}>선택해주세요.</Text></View>
            <View style={{ flexDirection: 'row', marginTop: d2p(20) }}>
              <Text style={FONT.Bold}>나를 소개하는 태그</Text>
              <Text style={FONT.Regular}>를 골라주세요.</Text>
            </View>
            <Text style={FONT.Regular}>최소 2개 최대 10개까지 고를 수 있어요.</Text>
          </View>
        }
        userBadge={userBadge} setUserBadge={(badgeProp: BadgeType) => setUserBadge(badgeProp)}
        isInitial={true} />
      <BasicButton onPress={handleNext} text="다음으로" bgColor={theme.color.white}
        textColor={theme.color.main}
        viewStyle={{
          marginTop: h2p(19),
          marginBottom: h2p(40)
        }} />
    </View>
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
  },
  select: {
    borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 16,
    marginTop: d2p(8), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
});

export default TagSelect;