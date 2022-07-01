import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View, Animated, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import Header from '~/components/header';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { plusIcon } from '~/assets/icons';
import { TextInput } from 'react-native-gesture-handler';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { noProfile } from '~/assets/images';
import RBSheet from 'react-native-raw-bottom-sheet';
import CloseIcon from '~/components/icon/closeIcon';
import SelectLayout from '~/components/selectLayout';
import { FONT } from '~/styles/fonts';
import { BadgeType } from '~/types';
import { initialBadgeData } from '~/utils/data';
import OnepickLayout from '~/components/layout/OnepickLayout';
import { useMutation, useQueryClient } from 'react-query';
import { deleteUser, editUserProfile } from '~/api/user';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, okPopupState, tokenState } from '~/recoil/atoms';
import ImageCropPicker from 'react-native-image-crop-picker';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import Loading from '~/components/loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { preSiginedImages, uploadImage } from '~/api';
import { hitslop } from '~/utils/constant';
import AlertPopup from '~/components/popup/alertPopup';
import FadeInOut from '~/hooks/fadeInOut';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface ProfileEditType {
  nickname: string,
  headline: string,
  profileImage: {
    fields: {
      key: string
    }
  } | null,
  tags: Array<string>,
  representBadge: string,
  remainingPeriod?: number
}

interface ProfileType {
  nickname: string,
  headline: string,
  profileImage: string | null,
  tags: Array<string>,
  representBadge: string
}
interface EditProfileProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    profile: ProfileType
    foucsHeadLine?: boolean
  }>;
}

const EditProfile = ({ navigation, route }: EditProfileProps) => {
  const nameInputRef = useRef<TextInput>(null);
  const selfInputRef = useRef<TextInput>(null);
  const tagRefRBSheet = useRef<RBSheet>(null);
  const [profileInfo, setProfileInfo] = useState<ProfileEditType>({
    nickname: "",
    headline: "",
    profileImage: null,
    tags: [],
    representBadge: "",
    remainingPeriod: 0
  });

  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const [isBadgeNext, setIsBadgeNext] = useState(false);
  const [token, setToken] = useRecoilState(tokenState);
  const myId = useRecoilValue(myIdState);
  const setModalOpen = useSetRecoilState(okPopupState);
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState(route.params?.profile.profileImage || "");
  const [isPopupOpen, setIsPopupOpen] = useState({ isOpen: false, content: "" });
  const { fadeAnim } = FadeInOut({ isPopupOpen, setIsPopupOpen });
  const [uploadBody, setUploadBody] = useState<{
    uri: string,
    name: string | undefined,
    type: string
  }>();

  const editProfileMutation = useMutation(["editprofile", token],
    (profileprop: ProfileType) => editUserProfile({ token, id: myId, profile: profileprop }), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("myProfile");
      navigation.goBack();
    }
  });
  const deleteUserMutation = useMutation("deleteUser", () => deleteUser({ token, id: myId }), {
    onSuccess: () => {
      setToken("");
      AsyncStorage.removeItem("token");
    }
  });
  const presignMutation = useMutation("presignImages",
    async (fileName: Array<string>) => preSiginedImages({ token, fileName, route: "user" }),
    {
      onSuccess: async (data) => {
        const copy: { [index: string]: Array<{ isClick: boolean, title: string }> } = { ...userBadge };
        const reduceTags = Object.keys(copy).reduce<Array<string>>((acc, cur) => {
          acc = acc.concat(copy[cur].filter(v => v.isClick).map(v => v.title));
          return acc;
        }, []);

        if (uploadBody) {
          await uploadImage(uploadBody, data[0]);
        }
        setProfileInfo({ ...profileInfo, profileImage: data[0] });

        editProfileMutation.mutate({
          profileImage: profile.includes("https") ? profile.split("com/")[1] : data[0].fields.key,
          nickname: profileInfo.nickname,
          headline: profileInfo.headline,
          representBadge: userBadge.interest.filter(v => v.masterBadge)[0]?.title || profileInfo.representBadge,
          tags: reduceTags
        });
        queryClient.setQueryData("myProfile", {
          profileImage: profile.includes("https") ? profile.split("com/")[1] : data[0].fields.key,
          nickname: profileInfo.nickname,
          headline: profileInfo.headline,
          representBadge: userBadge.interest.filter(v => v.masterBadge)[0]?.title || profileInfo.representBadge,
          tags: reduceTags
        });
      }
    });

  const pickImage = () => {
    ImageCropPicker.openPicker({
      mediaType: "photo",
      crop: "true",
      includeBase64: true,
      compressImageMaxWidth: 720,
      compressImageMaxHeight: 720
    }).then(v => {
      setUploadBody(
        {
          uri: v.path,
          type: v.mime,
          name: Platform.OS === 'ios' ? v.filename : `${Date.now()}.${v.mime === 'image/jpeg' ? 'jpg' : 'png'}`,
        }
      );
      setProfile(`data:${v.mime};base64,${v.data}`);
    });
  };

  useEffect(() => {
    // * 회원탈퇴시 온보딩화면으로
    if (!token) {
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  }, [token]);

  useEffect(() => {
    if (route.params) {
      setProfileInfo({
        ...route.params?.profile,
        headline: route.params.profile.headline || "",
        profileImage: route.params.profile.profileImage ? {
          fields: {
            key: "user" + route.params.profile.profileImage?.split("user")[1]
          }
        } : null
      });

      setUserBadge({
        interest: userBadge.interest.map(v => {
          if (v.title === route.params?.profile.representBadge) {
            return { ...v, isClick: true, masterBadge: true };
          }
          if (route.params?.profile.tags.includes(v.title)) {
            return { ...v, isClick: true };
          }
          return v;
        }),
        household: userBadge.household.map(v => {
          if (route.params?.profile.tags.includes(v.title)) {
            return { ...v, isClick: true };
          }
          return v;
        }),
        taste: userBadge.taste.map(v => {
          if (route.params?.profile.tags.includes(v.title)) {
            return { ...v, isClick: true };
          }
          return v;
        })
      });
    }
  }, [route.params]);

  // * 자기소개 input 포커스
  useEffect(() => {
    if (route.params?.foucsHeadLine) {
      selfInputRef.current?.focus();
    }
  }, [route.params]);

  if (editProfileMutation.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} imageStyle={{ width: d2p(11), height: d2p(25) }} />}
        title="프로필 수정"
        headerRightPress={() => {
          const copy: { [index: string]: Array<{ isClick: boolean, title: string }> } = { ...userBadge };
          const reduceTags = Object.keys(copy).reduce<Array<string>>((acc, cur) => {
            acc = acc.concat(copy[cur].filter(v => v.isClick).map(v => v.title));
            return acc;
          }, []);
          if (!profileInfo.profileImage && !profile) {
            editProfileMutation.mutate({
              profileImage: null,
              nickname: profileInfo.nickname,
              headline: profileInfo.headline,
              representBadge: userBadge.interest.filter(v => v.masterBadge)[0]?.title || profileInfo.representBadge,
              tags: reduceTags
            });
          }
          else {
            presignMutation.mutate([profile]);
          }
        }}
        headerRight={<Text style={[{ color: theme.color.main }, FONT.Regular]}>완료</Text>} />
      <KeyboardAwareScrollView
        enableAutomaticScroll
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
        style={styles.container}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImage}>
          <Image source={profile ? { uri: profile } : noProfile}
            style={{
              width: d2p(60), height: d2p(60),
              borderRadius: 60, borderWidth: 1, borderColor: theme.color.grayscale.eae7ec
            }} />
          <Image source={plusIcon}
            style={{ width: d2p(18), height: h2p(18), position: "absolute", bottom: 0, right: 0 }} />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={hitslop}
          onPress={() => {
            setProfile("");
            setProfileInfo({ ...profileInfo, profileImage: null });
          }}
          style={{ marginBottom: h2p(40), marginTop: h2p(20), alignSelf: "center" }}>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4 }]}>삭제</Text>
        </TouchableOpacity>
        <View>
          <View style={{ flexDirection: "row", paddingHorizontal: d2p(20), marginBottom: d2p(10) }}>
            <Text style={[styles.inputTitle, FONT.Bold]}>닉네임</Text>
            <Text style={[styles.inputText, FONT.Regular, {
              color: profileInfo.nickname.length >= 40 ? theme.color.main : theme.color.grayscale.d3d0d5
            }]}>{`(${profileInfo.nickname.length}/40자)`}</Text>
          </View>
          <Pressable onPress={() => nameInputRef.current?.focus()} style={styles.textInput}>
            <TextInput
              multiline
              value={profileInfo.nickname}
              maxLength={41}
              onChangeText={(e) => {
                if (e.length > 40) {
                  setProfileInfo({ ...profileInfo, nickname: e.slice(0, e.length - 1) });
                }
                else {
                  setProfileInfo({ ...profileInfo, nickname: e });
                }
              }}
              ref={nameInputRef}
              autoCapitalize="none"
              style={[FONT.Regular, {
                color: theme.color.black,
                minWidth: d2p(135),
                fontSize: 16, padding: 0, includeFontPadding: false, paddingTop: 0
              }]}
              placeholder="닉네임을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
            {!profileInfo.nickname &&
              <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.ff5d5d }]}> (필수)</Text>
            }
          </Pressable>
        </View>

        <View style={{ marginTop: h2p(40) }}>
          <View style={{ flexDirection: "row", paddingHorizontal: d2p(20), marginBottom: d2p(10) }}>
            <Text style={[styles.inputTitle, FONT.Bold]}>자기소개</Text>
            <Text style={[styles.inputText, FONT.Regular,
            { color: profileInfo.headline.length >= 140 ? theme.color.main : theme.color.grayscale.d3d0d5 }]}>
              {`(${profileInfo.headline.length}/140자)`}</Text>
          </View>
          <Pressable onPress={() => selfInputRef.current?.focus()} style={styles.textInput}>
            <TextInput
              multiline
              maxLength={141}
              value={profileInfo.headline}
              onChangeText={e => {
                if (e.length > 140) {
                  setProfileInfo({ ...profileInfo, headline: e.slice(0, e.length - 1) });
                }
                else {
                  setProfileInfo({ ...profileInfo, headline: e });
                }
              }}
              ref={selfInputRef}
              autoCapitalize="none"
              style={[FONT.Regular, {
                color: theme.color.black,
                minWidth: d2p(145),
                fontSize: 16, padding: 0, paddingTop: 0, includeFontPadding: false,
              }]}
              placeholder="자기소개를 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
            {!profileInfo.headline &&
              <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}> (선택)</Text>
            }
          </Pressable>
        </View>
        <BasicButton viewStyle={{ alignSelf: "center", marginTop: h2p(40) }}
          onPress={() => tagRefRBSheet.current?.open()}
          text="소개 태그 선택" textColor={theme.color.main} bgColor={theme.color.white} />
        <TouchableOpacity
          onPress={() => {
            setModalOpen({
              isOpen: true,
              content: `탈퇴 후 재가입시 데이터는 복구되지 않습니다.\n 정말 탈퇴하시겠습니까?`,
              okButton: () => {
                deleteUserMutation.mutate();
                AsyncStorage.removeItem("token");
                setToken("");
              }
            });
          }}
          style={{
            position: 'absolute',
            right: d2p(20),
            bottom: getBottomSpace() + h2p(25),

          }}
        >
          <Text style={[FONT.Bold,
          { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
            회원탈퇴
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      <RBSheet
        animationType="fade"
        ref={tagRefRBSheet}
        onClose={() => setIsBadgeNext(false)}
        height={(!isIphoneX() && Platform.OS !== "android") ?
          Dimensions.get("window").height - h2p(120) : Dimensions.get("window").height - h2p(200)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: d2p(20),
            paddingVertical: h2p(20)
          }, draggableIcon: {
            display: "none"
          }
        }}
      >
        <View style={{
          flexDirection: "row", justifyContent: "space-between",
          paddingHorizontal: d2p(10), marginBottom: h2p(10)
        }}>
          <CloseIcon onPress={() => tagRefRBSheet.current?.close()}
            imageStyle={{ width: d2p(15), height: h2p(15) }} />
          <Text style={[{ fontSize: 16 }, FONT.Bold]}>
            {isBadgeNext ? "대표뱃지 선택" : "태그 선택"}
          </Text>
          <TouchableOpacity onPress={() => {
            if (userBadge.interest.every(v => !v.isClick)) {
              setIsPopupOpen({ isOpen: true, content: "관심사를 선택해주세요" });
              return;
            }
            if (userBadge.household.every(v => !v.isClick)) {
              setIsPopupOpen({ isOpen: true, content: "가족구성을 선택해주세요" });
              return;
            }
            if (
              (isBadgeNext && userBadge.interest.filter(v => v.masterBadge)[0].title !== route.params?.profile.representBadge) &&
              profileInfo.remainingPeriod && profileInfo.remainingPeriod > 0 && isBadgeNext) {
              setUserBadge({
                ...userBadge,
                interest: userBadge.interest.map(v => {
                  if (route.params?.profile.representBadge === v.title) {
                    return { ...v, masterBadge: true };
                  }
                  return { ...v, masterBadge: false };
                })
              });
              setIsPopupOpen({
                isOpen: true,
                content: `대표뱃지는 ${profileInfo.remainingPeriod}일 후에 수정 가능합니다`
              });
              return;
            }
            if (!isBadgeNext) {
              setIsBadgeNext(true);
            }
            else {
              tagRefRBSheet.current?.close();
            }
          }}>
            <Text style={[{ color: theme.color.grayscale.ff5d5d }, FONT.Regular]}>
              {isBadgeNext ? "완료" : "다음"}
            </Text>
          </TouchableOpacity>
        </View>
        {isBadgeNext ?
          <OnepickLayout remainingPeriod={profileInfo.remainingPeriod}
            userBadge={userBadge} setUserBadge={(badge: BadgeType) => setUserBadge(badge)} />
          :
          <>
            <View style={{ marginBottom: h2p(40), marginTop: h2p(20) }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={FONT.Bold}>나를 소개하는 태그</Text>
                <Text style={FONT.Regular}>를 골라주세요.</Text>
              </View>
              <Text style={FONT.Regular}>최소 2개 최대 10개까지 고를 수 있어요.</Text>
            </View>
            <SelectLayout
              setIsPopupOpen={(popup: { isOpen: boolean, content: string }) => setIsPopupOpen(popup)}
              remainingPeriod={profileInfo.remainingPeriod}
              isInitial={isBadgeNext ? false : true} userBadge={userBadge}
              setUserBadge={(badge: BadgeType) => setUserBadge(badge)} />
          </>
        }
        {isPopupOpen.isOpen &&
          <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: fadeAnim ? fadeAnim : -1 }}>
            <AlertPopup text={isPopupOpen.content} popupStyle={{ bottom: h2p(20) }} />
          </Animated.View>
        }
      </RBSheet>
    </>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: h2p(30)
  },
  profileImage: {
    width: d2p(60),
    height: d2p(60),
    borderRadius: 60,
    alignSelf: "center"
  },

  inputTitle: {
    fontSize: 16,
    marginRight: d2p(10)
  },
  inputText: {
    fontSize: 12,
  },
  textInput: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(15),
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec
  },
  badgeGuide: {
    color: theme.color.main,
    marginTop: h2p(20),
    fontSize: 12
  },
  subTitle: {
    fontSize: 14,
    color: theme.color.black,
  },
});