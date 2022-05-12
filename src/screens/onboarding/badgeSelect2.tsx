import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import Badge from '~/components/badge';
import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";
import { UserInfoType } from '~/types';
import { userSignup } from '~/api/user';

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<UserInfoType>;
}


const interest = [{ title: "빵식가", isClick: false }, { title: "애주가", isClick: false }, { title: "디저트러버", isClick: false },
{ title: "캠핑족", isClick: false }, { title: "속편한식사", isClick: false }, { title: "다이어터", isClick: false }, { title: "비건", isClick: false },
{ title: "간편식", isClick: false }, { title: "한끼식사", isClick: false }];

const BadgeSelect2 = ({ route, navigation }: BadgeSelectProps) => {

  const [userInfo, setUserInfo] = useState<UserInfoType>();
  const [errorMsg, setErrorMsg] = useState("");

  const [interestArr, setInterestArr] = useState(interest);

  const handleNext = async () => {
    // todo 토큰 리코일, asynstoarge에 저장
    // todo 유효성검사
    // const data = await userSignup({ token: "", ...userInfo });
    // if(data){
    //   navigation.navigate("Welcome");
    // }
    navigation.navigate("Welcome");
  };

  useEffect(() => {
    setUserInfo(route.params);
  }, [route.params]);

  console.log(userInfo, 'userInfo');
  const family = [{ title: "자취생", isClick: false }, { title: "애기가족", isClick: false }, { title: "가족한끼", isClick: false }, { title: "신혼부부", isClick: false }];
  const taste = [{ title: "맵찔이", isClick: false }, { title: "맵고수", isClick: false }, { title: "느끼만렙", isClick: false }];
  return (
    <View style={styles.container}>
      <View style={{ marginBottom: d2p(60) }}>
        {/* eslint-disable-next-line react-native/no-raw-text */}
        <Text style={styles.title}>나를 <Text style={{ color: theme.color.main }}>대표하는 뱃지</Text>를{"\n"}
          골라주세요.</Text>
        {/* eslint-disable-next-line react-native/no-raw-text */}
        <Text style={styles.subTitle}>선택하신 관심사 중에서{"\n"}<Text style={{ fontWeight: 'bold' }}>나를 대표하는 뱃지 1개</Text>를 선택해주세요.</Text>
        <Text style={{ color: theme.color.main, marginTop: h2p(20), fontSize: 12 }}>대표 뱃지는 저장 후 7일동안 다시 변경할 수 없습니다.</Text>
      </View>
      <View>
        <View style={{ flexDirection: 'row' }}><Text style={{ ...styles.menu, marginTop: 0 }}>관심사 </Text><Text style={{ color: theme.color.main }}>*</Text></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {interest.map((item) => (
            <Badge type="picker" text={item.title} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...styles.menu }}><Text>가족구성 </Text><Text style={{ color: theme.color.main }}>*</Text>
          <Text style={{ marginLeft: 15, color: theme.color.grayscale.a09ca4, fontSize: 12 }}>1가지만 선택해주세요</Text></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {family.map((item) => (
            <Badge type="unabled" text={item.title} />
          ))}
        </View>
        <Text style={styles.menu}>입맛</Text>
        <View style={{ flexDirection: 'row', marginBottom: 'auto' }}>
          {taste.map((item) => (
            <Badge type="unabled" text={item.title} />
          ))}
        </View>
        <BasicButton onPress={handleNext} text="선택완료" bgColor={theme.color.main} textColor={theme.color.white} viewStyle={{ marginTop: h2p(41), marginBottom: h2p(40) }} />
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
  title: {
    fontSize: 26,
    fontWeight: '600',

  },
  subTitle: {
    fontSize: 14,
    color: theme.color.black,
    marginTop: d2p(20),

  },
  menu: {
    marginTop: h2p(40),
    marginBottom: h2p(5)
  },
  select: {
    borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 16,
    marginTop: d2p(8), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
});

export default BadgeSelect2;