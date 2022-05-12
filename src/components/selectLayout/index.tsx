import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import Badge from '~/components/badge';
import { h2p } from '~/utils';
import theme from '~/styles/theme';
import { initialize } from '~/assets/icons';
import { BadgeType } from '~/types';

interface SelectLayoutProps {
  userBadge: BadgeType;
  setUserBadge: (badgeProp: BadgeType) => void;
  isInitial?: boolean;
}

const SelectLayout = ({ isInitial, userBadge, setUserBadge }: SelectLayoutProps) => {
  const resetIsClick = () => {
    setUserBadge({
      interest: userBadge.interest.map(v => ({ title: v.title, isClick: false })),
      household: userBadge.household.map(v => ({ title: v.title, isClick: false })),
      taste: userBadge.taste.map(v => ({ title: v.title, isClick: false })),
    });
  };

  useEffect(() => {
    setUserBadge({
      interest:
        [{ title: "빵식가", isClick: false }, { title: "애주가", isClick: false }, { title: "디저트러버", isClick: false },
        { title: "캠핑족", isClick: false }, { title: "속편한식사", isClick: false }, { title: "다이어터", isClick: false }, { title: "비건", isClick: false },
        { title: "간편식", isClick: false }, { title: "한끼식사", isClick: false }],
      household:
        [{ title: "자취생", isClick: false }, { title: "애기가족", isClick: false }, { title: "가족한끼", isClick: false }, { title: "신혼부부", isClick: false }],
      taste:
        [{ title: "맵찔이", isClick: false }, { title: "맵고수", isClick: false }, { title: "느끼만렙", isClick: false }]
    });
  }, []);

  return (
    <>
      <View style={{ flexDirection: 'row' }}><Text style={{ ...styles.menu, marginTop: 0 }}>관심사 </Text><Text style={{ color: theme.color.main }}>*</Text></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {React.Children.toArray(userBadge.interest.map((item, idx) => (
          <Badge type="picker" badge="interest" text={item.title} idx={idx} isClick={userBadge.interest[idx].isClick}
            userBadge={userBadge} setUserBadge={(interestProp) => setUserBadge({ ...userBadge, interest: interestProp })} />
        )))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', ...styles.menu }}><Text>가족구성 </Text><Text style={{ color: theme.color.main }}>*</Text>
        <Text style={{ marginLeft: 15, color: theme.color.grayscale.a09ca4, fontSize: 12 }}>1가지만 선택해주세요</Text></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {React.Children.toArray(userBadge.household.map((item, idx) => (
          <Badge type="picker" badge="household" text={item.title} idx={idx} isClick={userBadge.household[idx].isClick}
            userBadge={userBadge} setUserBadge={(householdProp) => setUserBadge({ ...userBadge, household: householdProp })} />
        )))}
      </View>
      <Text style={styles.menu}>입맛</Text>
      <View style={{ flexDirection: 'row', marginBottom: 'auto' }}>
        {React.Children.toArray(userBadge.taste.map((item, idx) => (
          <Badge type="picker" badge="taste" text={item.title} idx={idx} isClick={userBadge.taste[idx].isClick}
            userBadge={userBadge} setUserBadge={(tasteProp) => setUserBadge({ ...userBadge, taste: tasteProp })}
          />
        )))}
      </View>
      {isInitial &&
        <TouchableOpacity
          onPress={resetIsClick}
          style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: h2p(40) }}>
          <Image source={initialize} resizeMode="contain" style={{ height: 12, width: 12, marginRight: 5 }} />
          <Text style={{ color: theme.color.grayscale.a09ca4, fontWeight: 'bold', }}>초기화</Text>
        </TouchableOpacity>
      }
    </>
  );
};

export default SelectLayout;

const styles = StyleSheet.create({
  container: {

  },
  menu: {
    marginTop: h2p(40),
    marginBottom: h2p(5)
  }
});