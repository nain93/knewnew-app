import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import Header from '~/components/header';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { knewnewIcon, plusIcon } from '~/assets/icons';
import { TextInput } from 'react-native-gesture-handler';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { noProfile } from '~/assets/images';
import { FONT } from '~/styles/fonts';
import { BadgeType } from '~/types';
import { bonusTagData, initialBadgeData } from '~/utils/data';
import { useMutation, useQueryClient } from 'react-query';
import { editUserProfile } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import ImageCropPicker from 'react-native-image-crop-picker';
import Loading from '~/components/loading';
import { preSiginedImages, uploadImage } from '~/api';
import { hitslop } from '~/utils/constant';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import UserTagLayout from '~/components/layout/UserTagLayout';
import SelectTag from '~/components/selectTag';

interface ProfileEditType {
  nickname: string,
  headline: string,
  profileImage: {
    fields: {
      key: string
    }
  } | null,
  tags: BadgeType,
  remainingPeriod?: number
}

interface ProfileType {
  nickname: string,
  headline: string,
  profileImage: string | null,
  tags: BadgeType
}
interface EditProfileProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    profile: ProfileType
  }>;
}

interface BonusBadgeType {
  title: string,
  isClick: boolean
}

const EditProfile = ({ navigation, route }: EditProfileProps) => {
  const nameInputRef = useRef<TextInput>(null);
  const selfInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [profileInfo, setProfileInfo] = useState<ProfileEditType>({
    nickname: "",
    headline: "",
    profileImage: null,
    tags: {
      foodStyle: [],
      household: [],
      occupation: []
    },
    remainingPeriod: 0
  });

  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const [bonusBadge, setBonusBadge] = useState<BonusBadgeType[]>(bonusTagData);
  const [token] = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState(route.params?.profile.profileImage || "");
  const [uploadBody, setUploadBody] = useState<{
    uri: string,
    name: string | undefined,
    type: string
  }>();

  interface postProfileType {
    nickname: string,
    headline: string,
    profileImage: string | null,
    tags: {
      foodStyle: Array<string>,
      household: Array<string>,
      occupation: Array<string>
    }
  }

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
          tags: {
            foodStyle: userBadge.foodStyle.map(v => v.title),
            household: userBadge.household.map(v => v.title),
            occupation: userBadge.occupation.map(v => {
              if (v.content) {
                return v.content;
              }
              else {
                return v.title;
              }
            })
          }
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

      setUserBadge({
        foodStyle: userBadge.foodStyle.map(v => {
          if ((v.title === route.params?.profile.tags.foodStyle[0].title)) {
            return { ...v, isClick: true };
          }
          return { ...v, isClick: false };
        }),
        household: userBadge.household.map(v => {
          if ((v.title === route.params?.profile.tags.household[0].title)) {
            return { ...v, isClick: true };
          }
          return { ...v, isClick: false };
        }),
        occupation: userBadge.occupation.map(v => {
          if ((v.title === route.params?.profile.tags.occupation[0].title)) {
            return { ...v, isClick: true };
          }
          return { ...v, isClick: false };
        })
      });
    }
    // setInterestTag({
    //   interest: interestTag.interest.map(v => {
    //     if (route.params?.profile.tags.includes(v.title)) {
    //       return { ...v, isClick: true };
    //     }
    //     return v;
    //   })
    // });
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
      />
      <KeyboardAwareScrollView
        ref={scrollRef}
        enableAutomaticScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
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
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: d2p(20), marginBottom: d2p(10) }}>
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
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: d2p(20), marginBottom: d2p(10) }}>
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
        <View style={{ marginTop: h2p(40) }}>
          <Text style={[styles.inputTitle, { marginHorizontal: d2p(20), marginBottom: h2p(10) }, FONT.Bold]}>
            소개 태그
          </Text>
          <View style={{ borderWidth: 1, borderColor: theme.color.grayscale.eae7ec }}>
            <UserTagLayout
              viewStyle={{ paddingVertical: h2p(20), paddingHorizontal: d2p(20) }}
              scrollRef={scrollRef}
              userBadge={userBadge} setUserBadge={(badge: BadgeType) => setUserBadge(badge)} />
          </View>
        </View>
        <View style={{ marginTop: h2p(40) }}>
          <View style={{ marginHorizontal: d2p(20), marginBottom: h2p(10), flexDirection: "row", alignItems: "center" }}>
            <Image source={knewnewIcon} style={{ width: d2p(20), height: d2p(20), marginRight: d2p(5) }} />
            <Text style={[FONT.Bold, styles.inputTitle]}>보너스 입맛 태그</Text>
          </View>
          <View style={styles.textInput}>
            <View>
              <Text style={FONT.Bold}>팔로워에게 보여질 입맛 태그를 선택하세요.</Text>
              <Text style={[FONT.Regular, { marginTop: h2p(20) }]}>내 입맛을 보다 자세하게 설명할 수 있습니다.</Text>
              <Text style={FONT.Regular}>입맛 태그는 점점 더 다양해질 예정이니, 기대해주세요!</Text>
              <View style={{
                borderWidth: 1,
                borderRadius: 10,
                borderColor: theme.color.grayscale.f7f7fc,
                flexDirection: "row",
                alignItems: "flex-start",
                marginTop: h2p(30),
                paddingHorizontal: d2p(20),
                paddingVertical: h2p(15),
                width: Dimensions.get("window").width - d2p(40)
              }}>
                <Text style={[FONT.Bold, { fontSize: 12, marginRight: d2p(18), marginTop: h2p(2) }]}>Bonus</Text>
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={[FONT.Bold, { fontSize: 16 }]}>내 입맛을 알려주세요!</Text>
                    <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.main }]}> (중복가능)</Text>
                  </View>
                  {React.Children.toArray(bonusBadge.map((bonus, bonusIdx) => (
                    <Pressable onPress={() => {
                      setBonusBadge(bonusBadge.map((v, i) => {
                        if (i === bonusIdx) {
                          return { ...v, isClick: !v.isClick };
                        }
                        return v;
                      }));
                    }}>
                      <SelectTag viewStyle={{ paddingTop: h2p(15) }} name={bonus.title} isSelected={bonus.isClick} />
                    </Pressable>
                  )))}
                </View>
              </View>
            </View>
          </View>
        </View>
        <BasicButton viewStyle={{ alignSelf: "center", marginTop: h2p(40) }}
          onPress={() => {
            if (!profileInfo.profileImage && !profile) {
              editProfileMutation.mutate({
                profileImage: null,
                nickname: profileInfo.nickname,
                headline: profileInfo.headline,
                tags: {
                  foodStyle: userBadge.foodStyle.map(v => v.title),
                  household: userBadge.household.map(v => v.title),
                  occupation: userBadge.occupation.map(v => {
                    if (v.content) {
                      return v.content;
                    }
                    else {
                      return v.title;
                    }
                  })
                }
              });
            }
            else {
              presignMutation.mutate([profile]);
            }
          }}
          text="수정 완료" textColor={theme.color.main} bgColor={theme.color.white} />
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
    flexDirection: "row", alignItems: "center",
    borderWidth: 1,
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