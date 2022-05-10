import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { d2p } from '~/utils';
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

const BadgeSelect = ({ route, navigation }: BadgeSelectProps) => {

  const [userInfo, setUserInfo] = useState<UserInfoType>();

  const [errorMsg, setErrorMsg] = useState("");
  const handleLogin = async () => {
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

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: d2p(60) }}>
        {/* eslint-disable-next-line react-native/no-raw-text */}
        <Text style={styles.title}>픽커님을 나타낼 뱃지를{"\n"}
          {/* eslint-disable-next-line react-native/no-raw-text */}
          <Text style={{ color: theme.color.main }}>2가지 이상</Text> 선택해주세요.</Text>
        <Text style={styles.subTitle}>최소 2개 최대 10개까지 고를 수 있고,{"\n"}
          마이페이지에서 언제든지 수정할 수 있어요.</Text>
      </View>
      <ScrollView>
        <Text style={{ ...styles.menu, marginTop: 0 }}>소비스타일</Text>
        <ScrollView horizontal>
          <Badge type="picker" viewStyle={{ marginLeft: d2p(20) }} text="가성비좋아😍" />
          <Badge type="picker" text="비싸도FLEX💸" />
        </ScrollView>
        <Text style={styles.menu}>관심사</Text>
        <ScrollView horizontal>
          <Badge type="picker" viewStyle={{ marginLeft: d2p(20) }} text="빵식가🥐" />
          <Badge type="picker" text="애주가🍻" />
          <Badge type="picker" text="디저트러버🍰" />
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Badge type="picker" viewStyle={{ marginLeft: d2p(20) }} text="속편한식사🍚" />
          <Badge type="picker" text="다이어터🥗" />
          <Badge type="picker" text="캠핑족🏕" />
          <Badge type="picker" viewStyle={{ marginRight: d2p(15) }} text="비건" />
        </ScrollView>
        <Text style={styles.menu}>가족구성</Text>
        <ScrollView horizontal>
          <Badge type="picker" viewStyle={{ marginLeft: d2p(20) }} text="자취생🙂" />
          <Badge type="picker" text="애기가족👶" />
          <Badge type="picker" text="가족한끼👪" />
        </ScrollView>
        <Text style={styles.menu}>입맛</Text>
        <ScrollView horizontal>
          <Badge type="picker" viewStyle={{ marginLeft: d2p(20) }} text="맵찔이😣" />
          <Badge type="picker" text="맵고수🌶" />
          <Badge type="picker" text="느끼만렙😏" />
        </ScrollView>
        <Text style={styles.menu}>선호하는 재료</Text>
        <ScrollView horizontal>
          <Badge type="picker" viewStyle={{ marginLeft: d2p(20) }} text="고기파🍖" />
          <Badge type="picker" text="채소파🥦" />
          <Badge type="picker" text="해산물파🦐" />
        </ScrollView>
        <Text style={styles.menu}>조리방법</Text>
        <ScrollView horizontal>
          <Badge type="picker" viewStyle={{ marginLeft: d2p(20) }} text="간단조리파⏱" />
          <Badge type="picker" text="직접요리파👨‍🍳" />
        </ScrollView>
        <BasicButton onPress={handleLogin} text="선택완료" color={theme.color.main} viewStyle={{ marginTop: d2p(40), marginBottom: d2p(40) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: d2p(42.5)
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    paddingHorizontal: d2p(20)
  },
  subTitle: {
    fontSize: 14,
    color: theme.color.grayscale.C_79737e,
    marginTop: d2p(20),
    paddingHorizontal: d2p(20)
  },
  menu: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: d2p(39),
    marginLeft: d2p(20)
  },
  select: {
    borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 16,
    marginTop: d2p(8), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
});

export default BadgeSelect;