import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";
import { BadgeType, UserInfoType } from '~/types';
import SelectLayout from '~/components/selectLayout';
import { popupState } from '~/recoil/atoms';
import { useSetRecoilState } from 'recoil';

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<UserInfoType>;
}

const TagSelect = ({ route, navigation }: BadgeSelectProps) => {

  const [userInfo, setUserInfo] = useState<UserInfoType>();

  const [userBadge, setUserBadge] = useState<BadgeType>({
    interest: [],
    household: [],
    taste: []
  });

  const setIspopupOpen = useSetRecoilState(popupState);

  const handleNext = async () => {
    if (userBadge.household.every(v => !v.isClick) ||
      userBadge.interest.every(v => !v.isClick)) {
      setIspopupOpen({ isOpen: true, content: "관심사(or가족구성)을 선택해주세요" });
      return;
    }
    navigation.navigate("BadgeSelect", { userBadge, userInfo });
  };

  useEffect(() => {
    setUserInfo(route.params);
  }, [route.params]);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: h2p(40) }}>
        <Text style={styles.title}>나를 소개하는 태그를</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.title, { color: theme.color.main }]}>2가지 이상 </Text>
          <Text style={styles.title}>선택해주세요.</Text></View>
        <View style={{ flexDirection: 'row', marginTop: d2p(20) }}>
          <Text style={{ fontWeight: 'bold' }}>나를 소개하는 태그</Text>
          <Text>를 골라주세요.</Text>
        </View>
        <Text>최소 2개 최대 10개까지 고를 수 있어요.</Text>
      </View>
      <View style={{ flex: 1 }}>
        <SelectLayout userBadge={userBadge} setUserBadge={(badgeProp: BadgeType) => setUserBadge(badgeProp)} isInitial={true} />
        <BasicButton onPress={handleNext} text="다음으로" bgColor={theme.color.white}
          textColor={theme.color.main}
          viewStyle={{
            marginTop: h2p(19),
            marginBottom: h2p(40)
          }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: h2p(42.5),
    paddingHorizontal: d2p(20)
  },
  title: {
    color: theme.color.black,
    fontSize: 26,
    fontWeight: '600',

  },
  select: {
    borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 16,
    marginTop: d2p(8), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
});

export default TagSelect;