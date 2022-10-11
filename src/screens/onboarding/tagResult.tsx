import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import FastImage from 'react-native-fast-image';
import { InterestTagType } from '~/types';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { dishImage } from '~/assets/images';
import BasicButton from '~/components/button/basicButton';

interface TagResultPropType {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    nickname: string,
    tags: InterestTagType[]
  }>;
}

const TagResult = ({ navigation, route }: TagResultPropType) => {
  return (
    <View style={styles.container}>
      <View style={{
        alignItems: "center", height: "100%",
        justifyContent: "center",
        paddingBottom: h2p(90)
      }}>
        <Image source={dishImage} style={{ width: d2p(36), height: d2p(36) }} />
        <Text style={[FONT.SemiBold, {
          fontSize: 22,
          lineHeight: 30.8,
          marginTop: h2p(10),
          textAlign: "center"
        }]}>
          {`${route.params?.nickname}님을 나타내는\n입맛 태그가 선택되었습니다.`}
        </Text>
        <View style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: h2p(50)
        }}>
          {React.Children.toArray(route.params?.tags.map((v, i) => (
            <View
              style={[styles.tagButton, {
                marginLeft: i === (5 + 9 * (Math.floor(i / 5) - 1)) ? d2p(36.5) : 0
              }]}>
              <Text style={[FONT.Medium, {
                color: v.isClick ? theme.color.white : theme.color.black,
                fontSize: 13, textAlign: "center"
              }]}>{v.title}</Text>
              {(v.isClick && v.url) &&
                <FastImage source={v.url} style={[styles.tagButton, {
                  position: "absolute",
                  zIndex: -1,
                  borderWidth: 0
                }]} />
              }
            </View>
          )))}
        </View>
      </View>

      <Text style={[FONT.Regular, {
        color: theme.color.grayscale.C_78737D,
        marginTop: "auto", marginBottom: h2p(20)
      }]}>
        입맛 태그는 마이페이지에서 언제든지 수정할 수 있습니다.
      </Text>
      <BasicButton
        onPress={() => {
          //@ts-ignore
          navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
        }}
        text="홈으로 이동" bgColor={theme.color.main} textColor={theme.color.white} />
    </View>
  );
};

export default TagResult;

const styles = StyleSheet.create({
  container: {
    paddingTop: isIphoneX() ? getStatusBarHeight() + h2p(68) : h2p(68),
    paddingBottom: getBottomSpace() + h2p(40),
    flex: 1,
    paddingHorizontal: d2p(17.5),
    alignItems: "center",
  },
  tagButton: {
    borderWidth: 1,
    width: (Dimensions.get("window").width - d2p(60)) / 5,
    height: (Dimensions.get("window").width - d2p(60)) / 5,
    borderRadius: 63,
    justifyContent: "center", alignItems: "center",
    marginHorizontal: d2p(5),
    marginTop: h2p(10)
  }
});