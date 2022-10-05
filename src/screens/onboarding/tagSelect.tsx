import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { dishImage } from '~/assets/images';
import { d2p, h2p } from '~/utils';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { FONT } from '~/styles/fonts';
import BasicButton from '~/components/button/basicButton';
import theme from '~/styles/theme';
import { close } from '~/assets/icons';
import { useMutation } from 'react-query';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { editUserProfile } from '~/api/user';
import { postProfileType } from '~/types/user';
import { interestTagData } from '~/utils/data';
import FastImage from 'react-native-fast-image';
import { InterestTagType } from '~/types';

interface TagSelectPropType {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    nickname: string
  }>;
}

const TagSelect = ({ navigation, route }: TagSelectPropType) => {
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const [taste, setTaste] = useState<InterestTagType[]>(interestTagData);

  const editProfileMutation = useMutation(["editprofile", token],
    (profileprop: postProfileType) => editUserProfile({ token, id: myId, profile: profileprop }), {
    onSuccess: async () => {
      navigation.goBack();
    }
  });

  return (
    <View style={styles.container}>
      <Image source={dishImage} style={{ width: d2p(36), height: d2p(36) }} />
      <Text style={[FONT.SemiBold, {
        fontSize: 22,
        lineHeight: 30.8,
        marginTop: h2p(10),
        textAlign: "center"
      }]}>
        {`${route.params?.nickname}님을 나타내는\n입맛 태그를 마음껏 선택해주세요.`}
      </Text>
      <View style={{
        marginTop: h2p(40),
        flexDirection: "row", flexWrap: "wrap"
      }}>
        {React.Children.toArray(taste.map((v, i) => (
          <TouchableOpacity
            onPress={() => {
              setTaste(taste.map((click, clickIdx) => {
                if (clickIdx === i) {
                  return { ...click, isClick: !click.isClick };
                }
                else {
                  return click;
                }
              }));
            }}
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
          </TouchableOpacity>
        )))}
      </View>
      <View style={{ marginTop: "auto" }}>
        <BasicButton
          onPress={() => console.log("ss")}
          text="선택 완료"
          bgColor={theme.color.white}
          textColor={theme.color.main}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: h2p(20) }}>
        <Text style={[FONT.ExtraBold, {
          marginRight: d2p(5),
          fontSize: 12, color: theme.color.grayscale.d2d0d5
        }]}>
          나중에 할래요.
        </Text>
        <Image source={close} style={{ width: d2p(10), height: d2p(10) }} />
      </View>
    </View>
  );
};

export default TagSelect;

const styles = StyleSheet.create({
  container: {
    paddingTop: isIphoneX() ? getStatusBarHeight() + h2p(68) : h2p(68),
    paddingBottom: getBottomSpace() + h2p(40),
    flex: 1,
    paddingHorizontal: d2p(17.5),
    alignItems: "center"
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