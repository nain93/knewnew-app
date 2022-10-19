import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import Header from '~/components/header';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { knewnewIcon, plusIcon, settingIcon, whiteSettingIcon } from '~/assets/icons';
import { TextInput } from 'react-native-gesture-handler';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { noProfile } from '~/assets/images';
import { FONT } from '~/styles/fonts';
import { BadgeType, InterestTagType } from '~/types';
import { useMutation, useQueryClient } from 'react-query';
import { editUserProfile } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import ImageCropPicker from 'react-native-image-crop-picker';
import Loading from '~/components/loading';
import { preSiginedImages, uploadImage } from '~/api';
import { hitslop } from '~/utils/constant';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import UserTagLayout from '~/components/layout/CategoryLayout';
import SelectTag from '~/components/selectTag';
import { postProfileType, ProfileEditType } from '~/types/user';
import FastImage from 'react-native-fast-image';
import { interestTagData } from '~/utils/data';
import { blogImage, instaImage, youtubeImage } from '~/assets/icons/sns';

interface ProfileType {
  nickname: string,
  headline: string,
  profileImage: string | null,
  tags: Array<string>
}
interface EditProfileProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    profile: ProfileType
  }>;
}

const EditProfile = ({ navigation, route }: EditProfileProps) => {
  const nameInputRef = useRef<TextInput>(null);
  const selfInputRef = useRef<TextInput>(null);
  const youtubeRef = useRef<TextInput>(null);
  const instaRef = useRef<TextInput>(null);
  const blogRef = useRef<TextInput>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [profileInfo, setProfileInfo] = useState<ProfileEditType>({
    nickname: "",
    headline: "",
    profileImage: null,
    remainingPeriod: 0
  });

  const [taste, setTaste] = useState<string[]>([]);
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState(route.params?.profile.profileImage || "");
  const [uploadBody, setUploadBody] = useState<{
    uri: string,
    name: string | undefined,
    type: string
  }>();

  const editProfileMutation = useMutation(["editprofile", token],
    (profileprop: postProfileType) => editUserProfile({ token, id: myId, profile: profileprop }), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("myProfile");
      navigation.goBack();
    }
  });

  const presignMutation = useMutation("presignImages",
    async (fileName: Array<string>) => preSiginedImages({ token, fileName, route: "user" }),
    {
      onSuccess: async (data) => {
        if (uploadBody) {
          await uploadImage(uploadBody, data[0]);
        }
        setProfileInfo({ ...profileInfo, profileImage: data[0] });
        editProfileMutation.mutate({
          profileImage: profile.includes("https") ? profile.split("com/")[1] : data[0].fields.key,
          nickname: profileInfo.nickname,
          headline: profileInfo.headline,
          tags: taste
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

      setTaste(route.params.profile.tags);

    }
  }, [route.params]);

  if (editProfileMutation.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} />}
        title="프로필 수정"
      />
      <KeyboardAwareScrollView
        ref={scrollRef}
        enableAutomaticScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImage}>
          <FastImage source={profile ? { uri: profile } : noProfile}
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
          style={{ marginTop: h2p(10), alignSelf: "center" }}>
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.d2d0d5 }]}>삭제</Text>
        </TouchableOpacity>
        <View>
          <View style={styles.profileWrap}>
            <Text style={[styles.inputTitle, FONT.Bold]}>닉네임</Text>
            {/* <Text style={[styles.inputText, FONT.Regular, {
              color: profileInfo.nickname.length >= 40 ? theme.color.main : theme.color.grayscale.d2d0d5
            }]}>{`(${profileInfo.nickname.length}/40자) `}</Text> */}
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
              placeholder="닉네임을 입력해주세요." placeholderTextColor={theme.color.grayscale.d2d0d5} />
            {!profileInfo.nickname &&
              <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.mainRed }]}> (필수)</Text>
            }
          </Pressable>
        </View>

        <View style={[styles.profileWrap, { flexDirection: "row", alignItems: "center" }]}>
          <Text style={[styles.inputTitle, FONT.Bold]}>입맛 태그</Text>
          <Image source={whiteSettingIcon} style={{ width: d2p(16), height: d2p(16) }} />
        </View>
        <Pressable
          style={{
            flexDirection: "row",
            paddingTop: h2p(5),
            paddingBottom: h2p(10),
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.color.grayscale.f7f7fc,
            paddingHorizontal: d2p(20),
            flexWrap: "wrap"
          }}
        >
          {React.Children.toArray(["빵식가", "달달", "할매입맛", "해산물매니아", "식재료수집가"].map(v => (
            <View style={{
              borderWidth: 1,
              borderColor: theme.color.black,
              marginRight: d2p(5),
              paddingHorizontal: d2p(10), paddingVertical: h2p(4),
              borderRadius: 12,
              marginTop: h2p(5)
            }}>
              <Text style={[FONT.Medium, { fontSize: 10 }]}>{v}</Text>
            </View>
          )))}
        </Pressable>

        <View style={styles.profileWrap}>
          <Text style={[styles.inputTitle, FONT.Bold]}>자기소개</Text>
          <Text style={[styles.inputText, FONT.Regular,
          { color: profileInfo.headline.length >= 140 ? theme.color.main : theme.color.grayscale.d3d0d5 }]}>
            {`(${profileInfo.headline.length}/140자)`}</Text>
        </View>
        <Pressable onPress={() => selfInputRef.current?.focus()}
          style={styles.textInput}>
          <TextInput
            multiline
            onFocus={() => {
              setTimeout(() => {
                scrollRef.current?.scrollToPosition(0, 100, true);
              }, 300);
            }}
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
              fontSize: 16,
              includeFontPadding: false,
              paddingTop: 0,
            }]}
            placeholder="자기소개를 입력해주세요." placeholderTextColor={theme.color.grayscale.d2d0d5} />
          {!profileInfo.headline &&
            <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.C_443e49 }]}> (선택)</Text>
          }
        </Pressable>

        <View style={styles.profileWrap}>
          <Text style={[styles.inputTitle, FONT.Bold]}>SNS 연동</Text>
        </View>

        <Pressable onPress={() => youtubeRef.current?.focus()} style={styles.textInput}>
          <Image source={youtubeImage} style={{ width: d2p(23), height: d2p(23), marginRight: d2p(10.5) }} />
          <TextInput
            value={profileInfo.headline}
            onChangeText={e => {
              if (e.length > 140) {
                setProfileInfo({ ...profileInfo, headline: e.slice(0, e.length - 1) });
              }
              else {
                setProfileInfo({ ...profileInfo, headline: e });
              }
            }}
            ref={youtubeRef}
            autoCapitalize="none"
            style={[FONT.Regular, {
              color: theme.color.black,
              minWidth: d2p(145),
              padding: 0, paddingTop: 0, includeFontPadding: false,
            }]}
            placeholder="URL을 입력해주세요." placeholderTextColor={theme.color.grayscale.d2d0d5} />
        </Pressable>
        <Pressable onPress={() => instaRef.current?.focus()} style={[styles.textInput, { borderTopWidth: 0 }]}>
          <Image source={instaImage} style={{ width: d2p(23), height: d2p(23), marginRight: d2p(10.5) }} />
          <TextInput
            value={profileInfo.headline}
            onChangeText={e => {
              if (e.length > 140) {
                setProfileInfo({ ...profileInfo, headline: e.slice(0, e.length - 1) });
              }
              else {
                setProfileInfo({ ...profileInfo, headline: e });
              }
            }}
            ref={instaRef}
            autoCapitalize="none"
            style={[FONT.Regular, {
              color: theme.color.black,
              minWidth: d2p(145),
              padding: 0, paddingTop: 0, includeFontPadding: false,
            }]}
            placeholder="URL을 입력해주세요." placeholderTextColor={theme.color.grayscale.d2d0d5} />
        </Pressable>
        <Pressable onPress={() => blogRef.current?.focus()} style={[styles.textInput, { borderTopWidth: 0 }]}>
          <Image source={blogImage} style={{ width: d2p(23), height: d2p(23), marginRight: d2p(10.5) }} />
          <TextInput
            value={profileInfo.headline}
            onChangeText={e => {
              if (e.length > 140) {
                setProfileInfo({ ...profileInfo, headline: e.slice(0, e.length - 1) });
              }
              else {
                setProfileInfo({ ...profileInfo, headline: e });
              }
            }}
            ref={blogRef}
            autoCapitalize="none"
            style={[FONT.Regular, {
              color: theme.color.black,
              minWidth: d2p(145),
              padding: 0, paddingTop: 0, includeFontPadding: false,
            }]}
            placeholder="URL을 입력해주세요." placeholderTextColor={theme.color.grayscale.d2d0d5} />
        </Pressable>

        <View style={{ marginTop: h2p(40) }}>
          <BasicButton viewStyle={{ alignSelf: "center" }}
            onPress={() => {
              if (!profileInfo.profileImage && !profile) {
                editProfileMutation.mutate({
                  profileImage: null,
                  nickname: profileInfo.nickname,
                  headline: profileInfo.headline,
                  tags: taste
                });
              }
              else {
                presignMutation.mutate([profile]);
              }
            }}
            text="수정 완료" textColor={theme.color.main} bgColor={theme.color.white} />
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    paddingTop: h2p(30),
    paddingBottom: h2p(40)
  },
  profileImage: {
    width: d2p(60),
    height: d2p(60),
    borderRadius: 60,
    alignSelf: "center"
  },
  profileWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: d2p(20),
    marginBottom: d2p(10),
    marginTop: h2p(40)
  },
  inputTitle: {
    fontSize: 16,
    marginRight: d2p(5)
  },
  inputText: {
    fontSize: 12,
  },
  textInput: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(15),
    flexDirection: "row", alignItems: "center",
    borderWidth: 1,
    borderColor: theme.color.grayscale.f7f7fc
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