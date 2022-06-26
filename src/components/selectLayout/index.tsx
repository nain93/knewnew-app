import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Badge from '~/components/badge';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { initialize } from '~/assets/icons';
import { BadgeType } from '~/types';
import { FONT } from '~/styles/fonts';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import { useSetRecoilState } from 'recoil';
import { popupState } from '~/recoil/atoms';

interface SelectLayoutProps {
  userBadge: BadgeType;
  setUserBadge: (badgeProp: BadgeType) => void;
  isInitial?: boolean;
  type?: "filter" | "write" | "normal",
  headerComponent?: JSX.Element,
  remainingPeriod?: number
  setIsPopupOpen?: (popup: { isOpen: boolean, content: string }) => void
}

const SelectLayout = ({ setIsPopupOpen, remainingPeriod, headerComponent, isInitial, userBadge, setUserBadge, type = "normal" }: SelectLayoutProps) => {
  const resetIsClick = () => {
    setUserBadge({
      interest: userBadge.interest.map(v => ({ title: v.title, isClick: false })),
      household: userBadge.household.map(v => ({ title: v.title, isClick: false })),
      taste: userBadge.taste.map(v => ({ title: v.title, isClick: false })),
    });
  };

  return (
    <>
      <ScrollView
        bounces={false}
        style={{ flex: 1, position: "relative" }}
        showsVerticalScrollIndicator={false}>
        {headerComponent}
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.menu, { marginTop: 0 }, FONT.Regular]}>관심사 </Text>
          {type === "normal" &&
            <Text style={{ color: theme.color.main }}>*</Text>
          }
        </View>
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {React.Children.toArray(userBadge.interest.map((item, idx) => {
            if (item.masterBadge) {
              if (remainingPeriod && remainingPeriod > 0) {
                return (
                  <Badge type="picker"
                    layoutType={type === "filter" ? "filter" : "normal"} badge="interest"
                    text={item.title} idx={idx} isClick={userBadge.interest[idx].isClick}
                    userBadge={userBadge} onPress={() => {
                      if (setIsPopupOpen) {
                        setIsPopupOpen({
                          isOpen: true,
                          content: `대표뱃지는 ${remainingPeriod}일 후에 수정 가능합니다`
                        });
                      }
                    }} />
                );
              }
              return (
                <Badge type="picker"
                  layoutType={type === "filter" ? "filter" : "normal"} badge="interest"
                  text={item.title} idx={idx} isClick={userBadge.interest[idx].isClick}
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
                  }} />
              );
            }
            return (
              <Badge type="picker" layoutType={type === "filter" ? "filter" : "normal"} badge="interest"
                text={item.title} idx={idx} isClick={userBadge.interest[idx].isClick}
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
            );
          }))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...styles.menu }}>
          <Text style={FONT.Regular}>가족구성 </Text>
          {type === "normal" &&
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
        <Text style={[styles.menu, { marginTop: h2p(30) }, FONT.Regular]}>입맛</Text>
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
      </ScrollView>
      {isInitial &&
        <TouchableOpacity
          onPress={resetIsClick}
          style={{
            position: "absolute", flexDirection: 'row', right: d2p(30),
            bottom: headerComponent ? h2p(100) : (isIphoneX() ? getBottomSpace() : h2p(20))
          }}>
          <Image source={initialize} resizeMode="contain" style={{ height: d2p(12), width: d2p(12), marginRight: d2p(5) }} />
          <Text style={[{ color: theme.color.grayscale.a09ca4 }, FONT.Bold]}>초기화</Text>
        </TouchableOpacity>
      }
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
    marginLeft: d2p(15),
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
  }
});