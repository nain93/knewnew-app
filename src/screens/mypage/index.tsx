import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import Modal from "react-native-modal";
import { myIdState, tokenState } from '~/recoil/atoms';
import { getMyProfile, getUserBookmarkList, getUserReviewList, userFollow } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { MyProfileType } from '~/types/user';
import { noProfile } from '~/assets/images';
import Loading from '~/components/loading';
import { FONT } from '~/styles/fonts';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { ReviewListType } from '~/types/review';
import { close, graywrite } from '~/assets/icons';
import FastImage from 'react-native-fast-image';
import { productBookmarkList } from '~/api/product';
import { ProductListType } from '~/types/product';
import { blogImage, instaImage, youtubeImage } from '~/assets/icons/sns';
import { hitslop } from '~/utils/constant';
import { interestTagData } from '~/utils/data';
import { InterestTagType } from '~/types';

interface MypageProps {
  navigation: NavigationStackProp;
  route: NavigationRoute;
}

const sequence = [4, 11, 18, 25];

const Mypage = ({ navigation }: MypageProps) => {
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();
  const [taste, setTaste] = useState<InterestTagType[]>(interestTagData);
  const [isTasteMore, setIsTasteMore] = useState(false);
  const [isTwoLine, setIsTwoLine] = useState(false);

  // const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", myId], async () => {
  //   const queryData = await getMyProfile(token);
  //   queryClient.setQueryData("myProfile", queryData);
  //   return queryData;
  // }, {
  //   onSuccess: (data) => {
  //     queryClient.setQueryData("myProfile", data);
  //   },
  // });

  const userReviewListQuery = useQuery<ReviewListType[], Error>(["userReviewList", myId], async () => {
    const queryData = await getUserReviewList({ token, id: myId, offset: 0, limit: 3 });
    return queryData;
  });

  const userBookmarkListQuery = useQuery<ReviewListType[], Error>(["userBookmarkList"], async () => {
    const queryData = await getUserBookmarkList({ token, id: myId, offset: 0, limit: 3 });
    return queryData;
  });

  const userProductBookmarkQuery = useInfiniteQuery<ProductListType[], Error>(["userProductBookmark"], async ({ pageParam }) => {
    const queryData = await productBookmarkList({ token, id: myId, offset: pageParam, limit: 5 });
    return queryData;
  }, {
    getNextPageParam: (next, all) => all.flat().length
  });

  const followMutation = useMutation("userFollow", ({ userId, isFollow }: { userId: number, isFollow: boolean }) =>
    userFollow({ token, userId, isFollow }), {
    onSuccess: () => {
      queryClient.invalidateQueries("myProfile");
    }
  });

  useEffect(() => {
    // * 로그아웃시 온보딩화면으로
    if (!token) {
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  }, [token]);

  // if (getMyProfileQuery.isLoading) {
  //   return (
  //     <Loading />
  //   );
  // }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}>
      <View style={styles.profileImage}>
        <View style={{ flexDirection: "row", width: d2p(80) }}>
          <Image source={youtubeImage} style={{ width: d2p(24), height: d2p(24), marginRight: d2p(4) }} />
          <Image source={instaImage} style={{ width: d2p(24), height: d2p(24), marginRight: d2p(4) }} />
          <Image source={blogImage} style={{ width: d2p(24), height: d2p(24) }} />
        </View>
        <View style={{
          alignItems: "center", position: "absolute",
          width: Dimensions.get("window").width,
          borderBottomWidth: 1,
          borderColor: theme.color.grayscale.f7f7fc,
          paddingBottom: h2p(14.5)
        }}>
          <FastImage style={{
            width: d2p(60), height: d2p(60), borderRadius: 60,
            borderWidth: 1,
            borderColor: theme.color.grayscale.eae7ec,
            marginTop: h2p(10)
          }}
            source={noProfile}
          // source={getMyProfileQuery.data?.profileImage ? { uri: getMyProfileQuery.data?.profileImage } : noProfile} 
          />
          <Text style={[FONT.Bold, {
            fontSize: 20, marginTop: h2p(10), marginHorizontal: d2p(20),
            textAlign: "center"
          }]}>
            nickname
            <Text style={{ color: theme.color.grayscale.C_9F9CA3 }}>님</Text>
          </Text>

          {/* 팔로우 기능 개발후 주석해제 */}
          {/* <View style={{ flexDirection: "row", marginTop: h2p(8) }}>
            <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, fontSize: 12 }]}>
              팔로잉 <Text style={{ color: theme.color.black }}>193</Text>
            </Text>
            <Text> ・ </Text>
            <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, fontSize: 12 }]}>
              팔로워 <Text style={{ color: theme.color.black }}>60</Text>
            </Text>
          </View> */}
        </View>
        <Pressable
          onPress={() => {
            navigation.navigate("editProfile",
              {
                profile:
                {
                  // nickname: getMyProfileQuery?.data?.nickname,
                  // headline: getMyProfileQuery?.data?.headline,
                  // profileImage: getMyProfileQuery?.data?.profileImage,
                  // tags:[],
                  // representBadge: getMyProfileQuery?.data?.representBadge,
                  // remainingPeriod: getMyProfileQuery?.data?.remainingPeriod
                }
              });
          }}
          style={{
            paddingHorizontal: d2p(8), paddingVertical: h2p(4),
            flexDirection: "row",
            borderWidth: 1,
            borderRadius: 12,
            borderColor: theme.color.grayscale.e9e7ec,
            marginLeft: "auto"
          }}
        >
          <Image source={graywrite} style={{ width: d2p(12), height: d2p(12), marginRight: d2p(2.75) }} />
          <Text style={[FONT.Regular, { color: theme.color.grayscale.C_9F9CA3, fontSize: 12 }]}>
            {` 프로필 수정`}
          </Text>
        </Pressable>
        {/* 뱃지 기능 추가후 주석해제 */}
        {/* <View style={{
              marginLeft: d2p(10),
              borderWidth: 1,
              borderRadius: 10, height: d2p(20),
              backgroundColor: "#fff8db",
              borderColor: "#ffd991",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: d2p(10)
            }}>
              <Text style={[FONT.Medium, { fontSize: 10, color: "rgb(255,107,41)" }]}>{`다이어터 >`}</Text>
            </View> */}
      </View>

      <View
        style={styles.profileInfo}>
        {/* {(getMyProfileQuery.data?.tags.taste && getMyProfileQuery.data?.tags.taste?.length > 3) && */}
        <Pressable
          onPress={() => setIsTasteMore(true)}
          style={{ marginLeft: "auto" }}>
          {/* <Image source={tasteMoreIcon} style={{ width: d2p(32), height: d2p(20) }} /> */}
        </Pressable>
        {/* } */}
      </View>
      <Text style={[FONT.Regular, {
        marginHorizontal: d2p(20),
        color: theme.color.grayscale.C_443e49,
        marginTop: h2p(15)
      }]}>
        간편하면서도 맛있고 있어보이는 요리를 만들고자
        노력하고 정진하는 요린이입니다.👩‍🍳
      </Text>
      <View style={{
        height: h2p(8),
        marginTop: h2p(20),
        backgroundColor: theme.color.grayscale.f7f7fc
      }} />

      <View style={styles.foodLog}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[FONT.Bold, styles.foodLogTitle]}>
            내 푸드로그
            <Text style={[FONT.Regular, { fontSize: 16, color: theme.color.grayscale.C_79737e }]}>
              {` ${userReviewListQuery.data?.length}`}
            </Text>
          </Text>
          {userReviewListQuery.data && userReviewListQuery.data?.length > 0 &&
            <Pressable
              hitSlop={hitslop}
              onPress={() => console.log("more")}
              style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center" }}>
              <Text style={[FONT.Medium, { color: theme.color.grayscale.a09ca4 }]}>더보기</Text>
              {/* <Image source={smallRightArrow} style={{
                width: d2p(16), height: d2p(16)
              }} /> */}
            </Pressable>
          }
        </View>
        <View style={{
          marginTop: h2p(10),
          flexDirection: "row",
          borderRadius: 5,
          backgroundColor: userReviewListQuery.data?.length === 0
            ? theme.color.grayscale.f7f7fc : theme.color.white
        }}>
          {userReviewListQuery.data?.length === 0 ?
            <View style={{
              width: Dimensions.get("window").width - d2p(40),
              height: (Dimensions.get("window").width - d2p(48)) / 3,
              alignItems: "center",
              justifyContent: "center"
            }}>
              <View style={{ alignItems: "center" }}>
                <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.C_9F9CA3 }]}>
                  nickname님의 인생템을 알려주세요.
                </Text>
                <Pressable style={{
                  borderColor: theme.color.main, borderRadius: 5,
                  width: d2p(130),
                  backgroundColor: theme.color.white,
                  borderWidth: 1,
                  paddingVertical: h2p(7),
                  paddingHorizontal: d2p(20),
                  marginTop: h2p(6)
                }}>
                  <Text style={[FONT.Medium, { fontSize: 12, color: theme.color.main, textAlign: "center" }]}>
                    첫 푸드로그 남기기</Text>
                </Pressable>
              </View>
            </View>
            :
            React.Children.toArray(userReviewListQuery.data?.map(v => (
              <>
                {/* 이미지 필수여야함 */}
                {/* <FastImage source={{ uri: v.images[0].image }}
            style={{ width: (Dimensions.get("window").width - d2p(48)) / 3, aspectRatio: 1,
            marginRight: d2p(4),borderRadius: 5 }} /> */}
                <View
                  style={{
                    borderRadius: 5,
                    width: (Dimensions.get("window").width - d2p(48)) / 3, aspectRatio: 1,
                    marginRight: d2p(4)
                  }} />
              </>
            )))
          }
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: theme.color.grayscale.eae7ec }} />

      <View style={styles.foodLog}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[FONT.Bold, styles.foodLogTitle]}>
            담은 푸드로그
            <Text style={[FONT.Regular, { fontSize: 16, color: theme.color.grayscale.C_79737e }]}>
              {` ${userBookmarkListQuery.data?.length}`}
            </Text>
          </Text>
          {userBookmarkListQuery.data && userBookmarkListQuery.data?.length > 0 &&
            <Pressable
              onPress={() => console.log("more")}
              style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center" }}>
              <Text style={[FONT.Medium, { color: theme.color.grayscale.a09ca4 }]}>더보기</Text>
              {/* <Image source={smallRightArrow} style={{
                width: d2p(16), height: d2p(16)
              }} /> */}
            </Pressable>
          }
        </View>
        <View style={{
          marginTop: h2p(10),
          flexDirection: "row",
          borderRadius: 5,
          backgroundColor: userBookmarkListQuery.data?.length === 0
            ? theme.color.grayscale.f7f7fc : theme.color.white
        }}>
          {userBookmarkListQuery.data?.length === 0 ?
            <View style={{
              width: Dimensions.get("window").width - d2p(40),
              height: (Dimensions.get("window").width - d2p(48)) / 3,
              alignItems: "center",
              justifyContent: "center"
            }}>
              <View style={{ alignItems: "center" }}>
                <Text style={[FONT.Regular, {
                  textAlign: "center", lineHeight: 16,
                  fontSize: 12, color: theme.color.grayscale.C_79737e
                }]}>
                  {`$nickname님의 푸드로그가 비었어요.\n맛있는 라이프를 위해 푸드로그를 담아보러 갈까요?`}
                </Text>
                <Pressable style={{
                  borderColor: theme.color.main, borderRadius: 5,
                  width: d2p(130),
                  backgroundColor: theme.color.white,
                  borderWidth: 1,
                  paddingVertical: h2p(7),
                  paddingHorizontal: d2p(10),
                  marginTop: h2p(10)
                }}>
                  <Text style={[FONT.Medium, { fontSize: 12, color: theme.color.main, textAlign: "center" }]}>
                    디저트러버 방 구경하기</Text>
                </Pressable>
              </View>
            </View>
            :
            React.Children.toArray(userBookmarkListQuery.data?.map(v => (
              <>
                {/* 이미지 필수여야함 */}
                {/* <FastImage source={{ uri: v.images[0].image }}
            style={{ width: (Dimensions.get("window").width - d2p(48)) / 3, aspectRatio: 1,
            marginRight: d2p(4),borderRadius: 5 }} /> */}
                <View
                  style={{
                    borderRadius: 5,
                    width: (Dimensions.get("window").width - d2p(48)) / 3, aspectRatio: 1,
                    marginRight: d2p(4)
                  }} />
              </>
            )))
          }
        </View>
      </View>

      {/* 입맛 팝업 */}
      {isTasteMore &&
        <Modal
          isVisible={isTasteMore}
          style={{ alignItems: "center" }}
          hideModalContentWhileAnimating={true}
          animationIn="fadeIn"
          animationOut="fadeOut"
          onBackdropPress={() => setIsTasteMore(false)}
          backdropTransitionOutTiming={0}
          onBackButtonPress={() => setIsTasteMore(false)}
        >
          <View style={{
            backgroundColor: theme.color.white,
            width: Dimensions.get("window").width - d2p(40),
            paddingHorizontal: d2p(20),
            paddingTop: h2p(20),
            paddingBottom: d2p(20),
            borderRadius: 10,
          }}>
            <View style={{
              marginBottom: h2p(25),
              flexDirection: "row", alignItems: "center", justifyContent: "space-between"
            }}>
              <Text style={[FONT.Medium, { fontSize: 18 }]}>nickname님의 입맛은?</Text>
              <Pressable onPress={() => setIsTasteMore(false)} hitSlop={hitslop}>
                <Image source={close} style={{ width: d2p(14), height: d2p(14) }} />
              </Pressable>
            </View>
            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: d2p(11.5)
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
                    marginLeft: sequence.includes(i) ? d2p(34) : d2p(2.5)
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
          </View>
        </Modal>
      }
</ScrollView>
    );
};


export default Mypage;

const styles = StyleSheet.create({
  container: {
    paddingBottom: h2p(20),
    paddingTop: h2p(5),
    backgroundColor: theme.color.grayscale.f7f7fc
  },
  profileImage: {
    marginVertical: h2p(20),
    flexDirection: "row",
    alignItems: "flex-start",
    height: h2p(123),
    paddingHorizontal: d2p(20)
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: d2p(20)
  },
  headline: {
    width: Dimensions.get("window").width - d2p(40),
    borderWidth: 1,
    minHeight: h2p(40),
    paddingVertical: h2p(10),
    paddingHorizontal: d2p(10),
    borderColor: theme.color.grayscale.ec6863,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    marginBottom: h2p(15),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    borderRadius: 10,
    marginHorizontal: d2p(10), marginTop: h2p(15),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15)
  },
  foodLog: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(20)
  },
  foodLogTitle: {
    fontSize: 16
  },
  tagButton: {
    borderWidth: 1,
    width: (Dimensions.get("window").width - d2p(123)) / 4,
    height: (Dimensions.get("window").width - d2p(123)) / 4,
    borderRadius: 63,
    justifyContent: "center", alignItems: "center",
    marginHorizontal: d2p(2.5),
    marginTop: h2p(5)
  }
});