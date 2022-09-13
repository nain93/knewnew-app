import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationRoute } from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import { tagFood, tagHome, tagLife } from '~/assets/icons';
import { welcomeImage } from '~/assets/logo';
import BasicButton from '~/components/button/basicButton';
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

const Welcome3 = ({ navigation, route }: NavigationType) => {

  const handleSignIn = () => {
    //@ts-ignore
    navigation.reset({ routes: [{ name: "TabNav" }] });
  };

  return (
    <View style={{ flex: 1, paddingTop: isIphoneX() ? h2p(120) + getStatusBarHeight() : h2p(120), }}>
      <View style={styles.container}>
        <View>
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
          <Text style={[FONT.SemiBold, { color: theme.color.main, fontSize: 26, marginTop: h2p(30) }]}>
            맛있는 발견을 하러 가볼까요?
          </Text>
        </View>
        <Image source={welcomeImage}
          resizeMode="contain"
          style={{
            alignSelf: "center",
            width: d2p(156), height: h2p(151),
            marginTop: h2p(75),
          }} />
      </View>
      <View style={{ marginBottom: h2p(40), marginTop: "auto", marginHorizontal: d2p(20) }}>
        <BasicButton
          onPress={handleSignIn} text="후다닥 입장하기" bgColor={theme.color.main} textColor={theme.color.white} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: d2p(20),
  },
  main: {
    flexDirection: 'row',
    marginTop: h2p(20),
    flexWrap: "wrap",
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
    marginTop: "auto",
    backgroundColor: theme.color.grayscale.f7f7fc,
    paddingHorizontal: d2p(20),
    paddingTop: h2p(20)
  }
});

export default Welcome3;
