import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import Badge from '~/components/badge';
import { BadgeType } from '~/types';
import { colorCheck } from '~/assets/icons';
import { FONT } from '~/styles/fonts';

interface OnepickLayoutProps {
  userBadge: BadgeType,
  setUserBadge: (badge: BadgeType) => void;
}

const OnepickLayout = ({ userBadge, setUserBadge }: OnepickLayoutProps) => {

  return (
    <>
      <View style={{ marginBottom: h2p(40) }}>
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
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
  subTitle: {
    fontSize: 14,
    color: theme.color.black,
    marginTop: h2p(20),
  },
});

export default OnepickLayout;