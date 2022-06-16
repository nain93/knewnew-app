import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSetRecoilState } from 'recoil';
import { okPopupState, tokenState } from '~/recoil/atoms';
import { useQueryClient } from 'react-query';

interface MypageHeaderProps {
  setOpenMore: (isOpen: boolean) => void
}

const MypageHeader = ({ setOpenMore }: MypageHeaderProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const setToken = useSetRecoilState(tokenState);
  const setModalOpen = useSetRecoilState(okPopupState);
  const queryClient = useQueryClient();
  const profile: any = queryClient.getQueryData("myProfile");

  return (
    <View style={styles.clickBox}>
      <TouchableOpacity
        onPress={() => navigation.navigate("editProfile",
          {
            profile:
            {
              nickname: profile.nickname,
              occupation: profile.occupation,
              profileImage: profile.profileImage,
              tags: profile.tags,
              representBadge: profile.representBadge
            }
          })}
        style={{ width: d2p(90), height: h2p(35), justifyContent: "center", alignItems: "center" }}>
        <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>프로필 수정</Text>
      </TouchableOpacity>
      <View style={{ borderWidth: 1, width: d2p(70), alignSelf: "center", borderColor: theme.color.grayscale.e9e7ec }} />
      <TouchableOpacity
        onPress={() => Linking.openURL("https://pf.kakao.com/_YQFcb")}
        style={{ width: d2p(90), height: h2p(35), justifyContent: "center", alignItems: "center" }}>
        <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>문의하기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setModalOpen({
            isOpen: true,
            content: "로그아웃 하시겠습니까?",
            okButton: () => {
              AsyncStorage.removeItem("token");
              setToken("");
            }
          });
          setOpenMore(false);
        }}
        style={{ width: d2p(90), height: h2p(35), justifyContent: "center", alignItems: "center" }}>
        <Text style={[FONT.Regular, { color: theme.color.main }]}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MypageHeader;

const styles = StyleSheet.create({
  clickBox: {
    borderRadius: 5,
    position: 'absolute', right: d2p(46), top: h2p(50),
    shadowColor: '#000000',
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: (Platform.OS === 'android') ? 3 : 0,
    backgroundColor: theme.color.white,
    zIndex: 11
  },
});