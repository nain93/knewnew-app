import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { TabView } from 'react-native-tab-view';
import Welcome3 from '~/screens/onboarding/welcome3';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { UserInfoType } from '~/types/user';
import { FONT } from '~/styles/fonts';
import { d2p, h2p } from '~/utils';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { eyesIcon } from '~/assets/icons';
import theme from '~/styles/theme';
import { hitslop } from '~/utils/constant';
import { welcomeImage2, welcomeImage3 } from '~/assets/logo';

export interface WelcomeType {
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

const Welcome = ({ navigation, route }: WelcomeType) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "welcome" },
    { key: "welcome2" },
    { key: "welcome3" },
  ]);

  const skipWelcome = () => {
    //@ts-ignore
    navigation.reset({ routes: [{ name: "TabNav" }] });
  };

  return (
    <View style={{ flex: 1 }}>
      <TabView
        onIndexChange={setIndex}
        navigationState={{ index, routes }}
        renderScene={({ route: tabKey }) => {
          switch (tabKey.key) {
            case "welcome":
              return (
                <View style={styles.container}>
                  <View style={styles.header}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={[FONT.Regular, { fontSize: 16 }]}>뉴뉴 빠르게 훑어보기</Text>
                      <Image source={eyesIcon} style={{ width: d2p(20), height: d2p(20), marginLeft: d2p(5) }} />
                    </View>
                    <TouchableOpacity
                      onPress={skipWelcome}
                      hitSlop={hitslop}>
                      <Text style={[FONT.Medium, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
                        {`skip >`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[FONT.SemiBold, { fontSize: 26, marginTop: h2p(90), lineHeight: 36 }]}>
                    {`뉴뉴는\n온라인 장보기 전\n추천템을 모아보는\n`}
                    <Text style={[FONT.SemiBold, { color: theme.color.main }]}>
                      소비자들의 공간</Text>
                    이에요.
                  </Text>
                  <Text style={[FONT.Regular, { fontSize: 16, marginTop: h2p(40), lineHeight: 22 }]}>
                    {`쓱, 컬리, 쿠팡, 네이버 등 온라인에서 발굴한\n다른 유저들의 인생템을 구경하세요!`}
                  </Text>
                  <Image source={welcomeImage2}
                    resizeMode="contain"
                    style={{
                      marginTop: h2p(72),
                      width: d2p(296),
                      height: h2p(193),
                      marginLeft: "auto"
                    }} />
                </View>
              );
            case "welcome2":
              return (
                <View style={styles.container}>
                  <View style={styles.header}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={[FONT.Regular, { fontSize: 16 }]}>뉴뉴 빠르게 훑어보기</Text>
                      <Image source={eyesIcon} style={{ width: d2p(20), height: d2p(20), marginLeft: d2p(5) }} />
                    </View>
                    <TouchableOpacity
                      onPress={skipWelcome}
                      hitSlop={hitslop}>
                      <Text style={[FONT.Medium, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
                        {`skip >`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[FONT.SemiBold, { fontSize: 26, marginTop: h2p(90), lineHeight: 36 }]}>
                    <Text style={[FONT.SemiBold, { color: theme.color.main }]}>
                      {`협찬과 광고를\n엄격히 금지`}</Text>
                    하고 있어요.
                  </Text>
                  <Text style={[FONT.Regular, { marginTop: h2p(40), fontSize: 16, lineHeight: 22 }]}>
                    {`광고없는 공간을 위해\n뉴뉴가 실시간으로 광고를 추적하고 있어요.\n`}
                    광고로 판정될 경우 <Text style={{ color: theme.color.main }}>계정이 영구 정지</Text>됩니다.
                  </Text>
                  <View style={{
                    backgroundColor: theme.color.grayscale.f7f7fc,
                    paddingHorizontal: d2p(10),
                    paddingVertical: h2p(8),
                    marginTop: h2p(10)
                  }}>
                    <Text style={[FONT.Regular, { fontSize: 13, lineHeight: 18 }]}>
                      {` ※ 광고임을 밝히지 않는 이른바 '뒷광고'는\n표시광고법 제3조 제1항에 의거하여 `}
                      <Text style={FONT.Bold}>엄연한 불법행위</Text>입니다.
                    </Text>
                  </View>
                  <Image source={welcomeImage3}
                    resizeMode="contain"
                    style={{
                      marginTop: h2p(83),
                      alignSelf: "center",
                      width: d2p(146), height: h2p(151)
                    }} />
                </View>
              );
            case "welcome3":
              return (<Welcome3 navigation={navigation} route={route} />);
            default:
              return null;
          }
        }}
        renderTabBar={(p) => null}
      />
      <View style={{
        position: "absolute",
        bottom: h2p(60),
        flexDirection: "row",
        alignSelf: "center",
        zIndex: -1
      }}>
        {React.Children.toArray(routes.map((_, i) => (
          <View style={{
            width: d2p(6), height: d2p(6),
            backgroundColor: i === index ? theme.color.main : theme.color.grayscale.eae7ec,
            borderRadius: 6,
            marginHorizontal: d2p(5)
          }} />
        )))}
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? h2p(30) + getStatusBarHeight() : h2p(30),
    paddingHorizontal: d2p(20),
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between"
  },
});