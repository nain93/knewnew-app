import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { WriteReviewType } from '~/types/review';
import { BadgeType } from '~/types';
import { initialBadgeData } from '~/utils/data';
import OnepickLayout from '~/components/onepickLayout';
import { useMutation, useQueryClient } from 'react-query';
import { deleteUser, editUserProfile } from '~/api/user';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, okPopupState, tokenState } from '~/recoil/atoms';
import ImageCropPicker from 'react-native-image-crop-picker';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import Loading from '~/components/loading';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface ProfileEditType {
  nickname: string,
  occupation: string,
  profileImage?: string,
  tags: Array<string>,
  representBadge: string
}
interface EditProfileProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    profile: ProfileEditType
  }>;
}

const EditProfile = ({ navigation, route }: EditProfileProps) => {
  const nameInputRef = useRef<TextInput>(null);
  const selfInputRef = useRef<TextInput>(null);
  const tagRefRBSheet = useRef<RBSheet>(null);
  const { nickname, occupation, profileImage, tags, representBadge } = route.params?.profile || {
    nickname: "",
    occupation: "",
    profileImage: "",
    tags: [],
    representBadge: ""
  };
  const [profileInfo, setProfileInfo] = useState<ProfileEditType>({
    nickname: nickname ? nickname : "",
    occupation: occupation ? occupation : "",
    profileImage: profileImage ? profileImage : "",
    tags: tags ? tags : [],
    representBadge: representBadge ? representBadge : ""
  });

  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const [isBadgeNext, setIsBadgeNext] = useState(false);
  const [token, setToken] = useRecoilState(tokenState);
  const myId = useRecoilValue(myIdState);
  const setModalOpen = useSetRecoilState(okPopupState);
  const queryClient = useQueryClient();

  const editProfileMutation = useMutation(["editprofile", token],
    (profile: ProfileEditType) => editUserProfile({ token, id: myId, profile }), {
    onSuccess: () => {
      queryClient.invalidateQueries("myProfile");
      // todo 수정완료 alert
      // navigation.goBack()
    }
  });
  const deleteUserMutation = useMutation("deleteUser", () => deleteUser({ token, id: myId }));

  useEffect(() => {
    setUserBadge({
      interest: userBadge.interest.map(v => {
        if (v.title === profileInfo.representBadge) {
          return { ...v, isClick: true, masterBadge: true };
        }
        if (profileInfo.tags.includes(v.title)) {
          return { ...v, isClick: true };
        }
        return v;
      }),
      household: userBadge.household.map(v => {
        if (profileInfo.tags.includes(v.title)) {
          return { ...v, isClick: true };
        }
        return v;
      }),
      taste: userBadge.taste.map(v => {
        if (profileInfo.tags.includes(v.title)) {
          return { ...v, isClick: true };
        }
        return v;
      })
    });
  }, []);


  const pickImage = () => {
    ImageCropPicker.openPicker({
      mediaType: "photo",
      crop: "true",
      includeBase64: true,
      compressImageMaxWidth: 720,
      compressImageMaxHeight: 720
    }).then(v => setProfileInfo({ ...profileInfo, profileImage: `data:${v.mime};base64,${v.data}` }));
  };

  useEffect(() => {
    // * 회원탈퇴시 온보딩화면으로
    if (!token) {
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  }, [token]);


  if (editProfileMutation.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} imageStyle={{ width: d2p(11), height: h2p(25) }} />}
        title="프로필 수정"
        headerRightPress={() => {
          const copy: { [index: string]: Array<{ isClick: boolean, title: string }> } = { ...userBadge };
          const reduceTags = Object.keys(copy).reduce<Array<string>>((acc, cur) => {
            acc = acc.concat(copy[cur].filter(v => v.isClick).map(v => v.title));
            return acc;
          }, []);
          if (profileInfo.profileImage?.includes("https")) {
            editProfileMutation.mutate({
              nickname: profileInfo.nickname,
              occupation: profileInfo.occupation,
              representBadge: userBadge.interest.filter(v => v.masterBadge)[0]?.title || profileInfo.representBadge,
              tags: reduceTags
            });
          } else {
            editProfileMutation.mutate({
              ...profileInfo,
              representBadge: userBadge.interest.filter(v => v.masterBadge)[0]?.title || profileInfo.representBadge,
              tags: reduceTags
            });
          }
        }}
        headerRight={<Text style={{ color: theme.color.main }}>완료</Text>} />
      <View style={styles.container}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImage}>
          <Image source={profileInfo.profileImage ? { uri: profileInfo.profileImage } : noProfile}
            style={{ width: d2p(60), height: d2p(60), borderRadius: 60 }} />
          <Image source={plusIcon}
            style={{ width: d2p(18), height: h2p(18), position: "absolute", bottom: 0, right: 0 }} />
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
            { color: profileInfo.occupation.length >= 140 ? theme.color.main : theme.color.grayscale.d3d0d5 }]}>
              {`(${profileInfo.occupation.length}/140자)`}</Text>
          </View>
          <Pressable onPress={() => selfInputRef.current?.focus()} style={styles.textInput}>
            <TextInput
              multiline
              maxLength={141}
              value={profileInfo.occupation}
              onChangeText={e => {
                if (e.length > 140) {
                  setProfileInfo({ ...profileInfo, occupation: e.slice(0, e.length - 1) });
                }
                else {
                  setProfileInfo({ ...profileInfo, occupation: e });
                }
              }}
              ref={selfInputRef}
              autoCapitalize="none"
              style={[FONT.Regular, {
                color: theme.color.black,
                fontSize: 16, padding: 0, paddingTop: 0, includeFontPadding: false,
              }]}
              placeholder="자기소개를 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
            {!profileInfo.occupation &&
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
            marginTop: "auto",
            marginLeft: "auto",
            marginRight: d2p(20),
            marginBottom: getBottomSpace() + h2p(25),
          }}
        >
          <Text style={[FONT.Bold,
          { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
            회원탈퇴
          </Text>
        </TouchableOpacity>
      </View>
      <RBSheet
        animationType="fade"
        ref={tagRefRBSheet}
        closeOnDragDown
        dragFromTopOnly
        onClose={() => setIsBadgeNext(false)}
        height={Dimensions.get("window").height - h2p(200)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: d2p(20),
            paddingVertical: h2p(20)
            // paddingTop: isIphoneX() ? getStatusBarHeight() + d2p(15) : d2p(15),
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
          <Text style={[{ fontSize: 16, fontWeight: "bold" }, FONT.Bold]}>
            {isBadgeNext ? "대표뱃지 선택" : "태그 선택"}
          </Text>
          <TouchableOpacity onPress={() => {
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
          <OnepickLayout userBadge={userBadge} setUserBadge={(badge: BadgeType) => setUserBadge(badge)} />
          :
          <>
            <View style={{ marginBottom: h2p(40), marginTop: h2p(20) }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[{ fontWeight: 'bold' }, FONT.Bold]}>나를 소개하는 태그</Text>
                <Text style={FONT.Regular}>를 골라주세요.</Text>
              </View>
              <Text style={FONT.Regular}>최소 2개 최대 10개까지 고를 수 있어요.</Text>
            </View>
            <SelectLayout isInitial={isBadgeNext ? false : true} userBadge={userBadge} setUserBadge={(badge: BadgeType) => setUserBadge(badge)} />
          </>
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
    marginBottom: h2p(40),
    borderWidth: 1,
    alignSelf: "center",
    borderColor: theme.color.grayscale.eae7ec
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
  title: {
    color: theme.color.black,
    fontSize: 26,
    fontWeight: '600',
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