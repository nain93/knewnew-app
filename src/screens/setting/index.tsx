import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { rightArrow, settingKnewnew } from '~/assets/icons';
import { versioningAOS, versioningIOS } from '~/utils/constant';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, okPopupState, tokenState } from '~/recoil/atoms';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { deleteUser, getMyProfile } from '~/api/user';
import ToggleButton from '~/components/button/toggleButton';
import Loading from '~/components/loading';
import messaging from '@react-native-firebase/messaging';
//@ts-ignore
import VersionCheck from 'react-native-version-check';
import { MyProfileType } from '~/types/user';

interface SettingProps {
  navigation: NavigationStackProp;
  route: NavigationRoute;
}

const Setting = ({ navigation }: SettingProps) => {
  const [token, setToken] = useRecoilState(tokenState);
  const myId = useRecoilValue(myIdState);
  const setModalOpen = useSetRecoilState(okPopupState);
  const [isLatestVersion, setIsLatestVersion] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const [isOn, setIsOn] = useState(true);


  const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile"], async () => {
    const queryData = await getMyProfile(token);
    queryClient.setQueryData("myProfile", queryData);
    return queryData;
  });


  const deleteUserMutation = useMutation("deleteUser", () => deleteUser({ token, id: myId }), {
    onSuccess: async () => {
      unregisterDevice();
      setToken("");
      AsyncStorage.removeItem("token");
    }
  });

  // * 알람 디바이스 해제
  const unregisterDevice = async () => {
    messaging().unregisterDeviceForRemoteMessages();
    AsyncStorage.removeItem("isNotification");
  };

  useEffect(() => {
    AsyncStorage.getItem("isNotification").then((notification) => {
      if (notification) {
        const isNotiOn = JSON.parse(notification);
        setIsOn(isNotiOn);
      }
    });
  }, [getMyProfileQuery.data]);


  useEffect(() => {
    // * 최신버전 체크
    if (!__DEV__) {
      if (Platform.OS === "ios") {
        VersionCheck.getLatestVersion({
          provider: "appStore"
        }).then((latestVersion: string) => {
          if (latestVersion === versioningIOS) {
            setIsLatestVersion(true);
          }
          else {
            setIsLatestVersion(false);
          }
        });
      }

      if (Platform.OS === "android") {
        VersionCheck.getLatestVersion({
          provider: "playStore"
        }).then((latestVersion: string) => {
          if (latestVersion === versioningAOS) {
            setIsLatestVersion(true);
          }
          else {
            setIsLatestVersion(false);
          }
        });
      }
    }

  }, []);

  if (deleteUserMutation.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header title="설정"
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} />}
      />
      <View style={styles.container}>
        <View style={styles.list}>
          <Text style={[FONT.Regular, styles.listText]}>버전 정보</Text>
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.C_443e49 }]}>
            {(Platform.OS === "ios" ? `v.${versioningIOS}` : `v.${versioningAOS}`)} {isLatestVersion && "(최신 버전)"}
          </Text>
        </View>
        <View style={styles.list}>
          <Text style={[FONT.Regular, styles.listText]}>알림 설정</Text>
          <ToggleButton isOn={isOn} setIsOn={setIsOn} />
        </View>
        {/* 차단 기능 개발후 주석해제 */}
        {/* <Pressable style={styles.list}>
          <Text style={[FONT.Regular, styles.listText]}>차단 관리</Text>
          <Image source={rightArrow} style={{ width: d2p(12), height: d2p(25) }} />
        </Pressable> */}
        <Pressable
          onPress={() => navigation.navigate("termScreen")}
          style={styles.list}>
          <Text style={[FONT.Regular, styles.listText]}>이용 약관</Text>
          <Image source={rightArrow} style={{ width: d2p(12), height: d2p(25) }} />
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL("https://pf.kakao.com/_YQFcb")}
          style={styles.list}>
          <Text style={[FONT.Regular, styles.listText]}>문의하기</Text>
          <Image source={rightArrow} style={{ width: d2p(12), height: d2p(25) }} />
        </Pressable>
        <Pressable
          onPress={() => {
            setModalOpen({
              isOpen: true,
              content: "로그아웃 하시겠습니까?",
              okButton: () => {
                unregisterDevice();
                AsyncStorage.removeItem("token");
                setToken("");
              }
            });
          }}
          style={[styles.list, { borderBottomWidth: 0 }]}>
          <Text style={[FONT.Regular, styles.listText]}>로그아웃</Text>
          <Image source={rightArrow} style={{ width: d2p(12), height: d2p(25) }} />
        </Pressable>
        <Pressable
          onPress={() => {
            setModalOpen({
              isOpen: true,
              content: `탈퇴 후 재가입시 데이터는 복구되지 않습니다.\n 정말 탈퇴하시겠습니까?`,
              okButton: () => deleteUserMutation.mutate()
            });
          }}
          style={[styles.list, { borderWidth: 0, marginTop: h2p(15) }]}>
          <Text style={[FONT.Regular, styles.listText]}>회원 탈퇴</Text>
          <Image source={rightArrow} style={{ width: d2p(12), height: d2p(25) }} />
        </Pressable>
        {/* 오픈소스 라이선스 정리후 주석해제 */}
        {/* <Pressable
          onPress={() => navigation.navigate("openSource")}
          style={{
            marginTop: h2p(20),
            marginLeft: d2p(30),
          }}>
          <Text style={[FONT.Regular, {
            textDecorationLine: "underline",
            fontSize: 12, color: theme.color.grayscale.a09ca4
          }]}>
            오픈소스 라이선스 보기
          </Text>
        </Pressable> */}
        <Image source={settingKnewnew} style={{
          alignSelf: "center",
          marginBottom: isIphoneX() ? getBottomSpace() : h2p(30),
          marginTop: "auto", width: d2p(96), height: d2p(20)
        }} />
      </View>
    </>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.grayscale.f7f7fc
  },
  list: {
    paddingHorizontal: d2p(30),
    paddingVertical: h2p(15),
    borderBottomWidth: 1,
    borderBottomColor: theme.color.grayscale.f7f7fc,
    backgroundColor: theme.color.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  listText: {
    fontSize: 16,
    color: theme.color.grayscale.C_443e49
  }
});