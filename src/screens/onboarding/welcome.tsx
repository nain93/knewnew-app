import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationRoute } from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import { handIcon, tagFood, tagHome, tagLife } from '~/assets/icons';
import BasicButton from '~/components/button/basicButton';
import Header from '~/components/header';
import CloseIcon from '~/components/icon/closeIcon';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { UserInfoType } from '~/types/user';
import { d2p, h2p } from '~/utils';

export interface NavigationType {
  navigation: NavigationStackProp;
  route?: NavigationRoute<{
    userInfo: UserInfoType,
    userBadge: {
      foodLife: string,
      lifeStyle: string,
      household: string
    }
  }>;
}

const Welcome = ({ navigation, route }: NavigationType) => {

  const handleSignIn = () => {
    //@ts-ignore
    navigation.reset({ routes: [{ name: "TabNav" }] });
  };

  return (
    <>
      <Header isBorder={false}
        headerLeft={<CloseIcon onPress={() => {
          //@ts-ignore
          navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
        }} />}
      />
      <View style={styles.container}>
        <View style={{ marginTop: h2p(50) }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: h2p(10) }}>
            <Image source={tagHome} style={{ marginRight: d2p(12), width: d2p(16), height: d2p(16) }} />
            <Text style={[FONT.SemiBold, { fontSize: 18, color: theme.color.grayscale.C_79737e }]}>
              {route?.params?.userBadge.household}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: h2p(10) }}>
            <Image source={tagLife} style={{ marginRight: d2p(12), width: d2p(16), height: d2p(16) }} />
            <Text style={[FONT.SemiBold, { fontSize: 18, color: theme.color.grayscale.C_79737e }]}>
              {route?.params?.userBadge.lifeStyle}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: h2p(10) }}>
            <Image source={tagFood} style={{ marginRight: d2p(12), width: d2p(16), height: d2p(16) }} />
            <Text style={[FONT.SemiBold, { fontSize: 18, color: theme.color.grayscale.C_79737e }]}>
              {route?.params?.userBadge.foodLife}</Text>
          </View>
        </View>
        <View style={styles.main}>
          <Text style={[styles.mainText, { color: theme.color.main }, { lineHeight: 36 }, FONT.SemiBold]}>
            {route?.params?.userInfo.nickname}</Text>
          <Text style={[styles.mainText, { lineHeight: 36 }, FONT.SemiBold]}>님,</Text>
          <Text style={[styles.mainText, { lineHeight: 36 }, FONT.SemiBold]}>
            뉴뉴에 오신 것을 환영해요!</Text>
        </View>
      </View>
      <View style={styles.alertContainer}>
        <Image source={handIcon} style={{ width: d2p(39), height: d2p(39) }} />
        <Text style={[FONT.Bold, { color: theme.color.main, fontSize: 30, marginTop: h2p(5), marginBottom: h2p(10) }]}>
          잠깐!</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={[FONT.Bold, { fontSize: 20 }]}>뉴뉴 시작 전,</Text>
          <Text style={[FONT.Bold, { fontSize: 20, color: theme.color.main }]}> 꼭 </Text>
          <Text style={[FONT.Bold, { fontSize: 20 }]}>읽어주세요!</Text>
        </View>
        <View style={{ marginVertical: h2p(40), marginBottom: "auto" }}>
          <View style={{ flexDirection: "row", marginBottom: h2p(20) }}>
            <Text style={FONT.Regular}>
              뉴뉴는 오로지
            </Text>
            <Text style={FONT.Bold}> 찐소비자</Text>
            <Text style={FONT.Regular}>들을 위한 공간입니다.</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[FONT.Regular, { lineHeight: 20 }]}>광고, 협찬 등 홍보 목적의 활동은 </Text>
            <Text style={[FONT.Bold, { lineHeight: 20 }]}>엄격히 금지</Text>
            <Text style={[FONT.Regular, { lineHeight: 20 }]}>합니다.</Text>
          </View>
          <Text style={[FONT.Regular, { lineHeight: 20 }]}>특히 뒷광고는 표시광고법 제3조 제1항에 의거하여</Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={[FONT.Bold, { lineHeight: 20 }]}>엄연한 불법행위</Text>
            <Text style={[FONT.Regular, { lineHeight: 20 }]}>임을 알려드립니다.</Text>
          </View>
        </View>
        <BasicButton
          viewStyle={{ marginBottom: h2p(40) }}
          onPress={handleSignIn} text="후다닥 입장하기" bgColor={theme.color.main} textColor={theme.color.white} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: d2p(20)
  },
  main: {
    flexDirection: 'row',
    marginBottom: h2p(50),
    marginTop: h2p(20),
    flexWrap: "wrap"
  },
  mainText: {
    fontSize: 26
  },
  tag: {
    color: theme.color.main,
    fontSize: 16
  },
  subText: {
    color: theme.color.grayscale.C_79737e,
    fontSize: 14,
    marginTop: h2p(10), marginBottom: "auto"
  },
  alertContainer: {
    flex: 1,
    backgroundColor: theme.color.grayscale.f7f7fc,
    paddingHorizontal: d2p(20),
    paddingTop: h2p(40)
  }
});

export default Welcome;
