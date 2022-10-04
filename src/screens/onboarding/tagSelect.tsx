import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
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

interface TagSelectPropType {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    nickname: string
  }>;
}

const TagSelect = ({ navigation, route }: TagSelectPropType) => {
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);

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
      <View style={{ marginTop: h2p(50) }}>
        <TouchableOpacity style={styles.tagButton}>
          <Text style={[FONT.Medium, { fontSize: 13 }]}>빵식가</Text>
        </TouchableOpacity>
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
    paddingHorizontal: d2p(20),
    alignItems: "center"
  },
  tagButton: {
    borderWidth: 1,
    width: d2p(63), height: d2p(63),
    borderRadius: 63,
    justifyContent: "center", alignItems: "center"
  }
});