import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import Badge from '~/components/badge';
import { h2p } from '~/utils';
import theme from '~/styles/theme';
import { initialize } from '~/assets/icons';
import { BadgeType } from '~/types';
import { FONT } from '~/styles/fonts';

interface SelectLayoutProps {
  userBadge: BadgeType;
  setUserBadge: (badgeProp: BadgeType) => void;
  isInitial?: boolean;
  type?: "filter" | "write" | "normal"
}

const SelectLayout = ({ isInitial, userBadge, setUserBadge, type = "normal" }: SelectLayoutProps) => {
  const resetIsClick = () => {
    setUserBadge({
      interest: userBadge.interest.map(v => ({ title: v.title, isClick: false })),
      household: userBadge.household.map(v => ({ title: v.title, isClick: false })),
      taste: userBadge.taste.map(v => ({ title: v.title, isClick: false })),
    });
  };

  useEffect(() => {
    if (userBadge.household.length === 0
      || userBadge.interest.length === 0
      || userBadge.taste.length === 0
    ) {
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
    }
  }, []);

  return (
    <>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[{ ...styles.menu, marginTop: 0 }, FONT.Regular]}>관심사 </Text>
          {type !== ("write" && "filter") &&
            <Text style={{ color: theme.color.main }}>*</Text>
          }
        </View>
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {React.Children.toArray(userBadge.interest.map((item, idx) => (
            <Badge type="picker" layoutType={type === "filter" ? "filter" : "normal"} badge="interest" text={item.title} idx={idx} isClick={userBadge.interest[idx].isClick}
              userBadge={userBadge} setUserBadge={(interestProp) => {
                if (type === "filter") {
                  setUserBadge({
                    household: userBadge.household.map(v => ({ ...v, isClick: false })),
                    taste: userBadge.taste.map(v => ({ ...v, isClick: false })),
                    interest: interestProp
                  });
                }
                else {
                  setUserBadge({ ...userBadge, interest: interestProp });
                }
              }
              } />
          )))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...styles.menu }}>
          <Text style={FONT.Regular}>가족구성 </Text>
          {type !== ("write" && "filter") &&
            <>
              <Text style={[{ color: theme.color.main }, FONT.Regular]}>*</Text>
              <Text style={[styles.guide, FONT.Regular]}>
                1가지만 선택해주세요</Text>
            </>
          }
        </View>
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {React.Children.toArray(userBadge.household.map((item, idx) => (
            <Badge type="picker" layoutType={type === "filter" ? "filter" : "normal"} badge="household" text={item.title} idx={idx} isClick={userBadge.household[idx].isClick}
              userBadge={userBadge} setUserBadge={(householdProp) => {
                if (type === "filter") {
                  setUserBadge({
                    household: householdProp,
                    taste: userBadge.taste.map(v => ({ ...v, isClick: false })),
                    interest: userBadge.interest.map(v => ({ ...v, isClick: false }))
                  });
                }
                else {
                  setUserBadge({ ...userBadge, household: householdProp });
                }
              }} />
          )))}
        </View>
        <Text style={[styles.menu, FONT.Regular]}>입맛</Text>
        <View style={{ flexDirection: 'row' }}>
          {React.Children.toArray(userBadge.taste.map((item, idx) => (
            <Badge type="picker" layoutType={type === "filter" ? "filter" : "normal"} badge="taste" text={item.title} idx={idx} isClick={userBadge.taste[idx].isClick}
              userBadge={userBadge} setUserBadge={(tasteProp) => {
                if (type === "filter") {
                  setUserBadge({
                    household: userBadge.household.map(v => ({ ...v, isClick: false })),
                    taste: tasteProp,
                    interest: userBadge.interest.map(v => ({ ...v, isClick: false }))
                  });
                }
                else {
                  setUserBadge({ ...userBadge, taste: tasteProp });
                }
              }}
            />
          )))}
        </View>
        {isInitial &&
          <TouchableOpacity
            onPress={resetIsClick}
            style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: h2p(50) }}>
            <Image source={initialize} resizeMode="contain" style={{ height: 12, width: 12, marginRight: 5 }} />
            <Text style={[{ color: theme.color.grayscale.a09ca4, fontWeight: 'bold' }, FONT.Bold]}>초기화</Text>
          </TouchableOpacity>
        }
      </ScrollView>
    </>
  );
};

export default SelectLayout;

const styles = StyleSheet.create({
  menu: {
    marginTop: h2p(40),
    marginBottom: h2p(5)
  },
  guide: {
    marginLeft: 15,
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
  }
});