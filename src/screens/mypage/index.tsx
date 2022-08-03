import { Dimensions, FlatList, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { myIdState, tokenState } from '~/recoil/atoms';
import { getMyProfile, getUserBookmarkList, getUserProfile, getUserReviewList, userFollow } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { MyProfileType } from '~/types/user';
import { noProfile } from '~/assets/images';
import Loading from '~/components/loading';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import FeedReview from '~/components/review/feedReview';
import { FONT } from '~/styles/fonts';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import BasicButton from '~/components/button/basicButton';
import { ReviewListType } from '~/types/review';
import { graywrite } from '~/assets/icons';
import FastImage from 'react-native-fast-image';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomBottomSheet from '~/components/popup/CustomBottomSheet';
import FollowBottomTab from '~/screens/mypage/followBottomTab';
import CloseIcon from '~/components/icon/closeIcon';

interface MypageProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    id?: number,
    refresh?: boolean
  }>;
}

const Mypage = ({ navigation, route }: MypageProps) => {
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [index, setIndex] = useState(0);
  const [followIndex, setFollowIndex] = useState(0);
  const reviewRef = useRef<FlatList>(null);
  const bookmarkRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const followRef = useRef<RBSheet>(null);

  const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", route.params?.id], async () => {
    if (route.params?.id && (route.params.id !== myId)) {
      const queryData = await getUserProfile(token, route.params?.id);
      return queryData;
    }
    else {
      const queryData = await getMyProfile(token);
      queryClient.setQueryData("myProfile", queryData);
      return queryData;
    }
  }, {
    enabled: !!route.params?.id,
    onSuccess: (data) => {
      queryClient.setQueryData("myProfile", data);
    },
  });

  const userReviewListQuery = useInfiniteQuery<ReviewListType[], Error>(["userReviewList", route.params?.id], async ({ pageParam = 0 }) => {
    if (route.params?.id) {
      const queryData = await getUserReviewList({ token, id: route.params?.id, offset: pageParam, limit: 5 });
      return queryData;
    }
  }, {
    enabled: !!route.params?.id,
    getNextPageParam: (next, all) => all.flat().length
  });

  const userBookmarkListQuery = useInfiniteQuery<ReviewListType[], Error>(["userBookmarkList", route.params?.id], async ({ pageParam = 0 }) => {
    if (route.params?.id) {
      const queryData = await getUserBookmarkList({ token, id: route.params?.id, offset: pageParam, limit: 5 });
      return queryData;
    }
  }, {
    enabled: !!route.params?.id,
    getNextPageParam: (next, all) => all.flat().length
  });

  const followMutation = useMutation("userFollow", ({ userId, isFollow }: { userId: number, isFollow: boolean }) =>
    userFollow({ token, userId, isFollow }), {
    onSuccess: () => {
      queryClient.invalidateQueries("myProfile");
    }
  });

  const tabHeader = useCallback(() => (
    <>
      <View pointerEvents="box-none" style={{ paddingHorizontal: d2p(20) }} >
        <View style={styles.profileImage} >
          <View>
            {/* <Text style={[FONT.Bold, { color: theme.color.main, marginBottom: h2p(5) }]}>
            느끼만렙 맵찔이
          </Text> */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[FONT.Bold, { fontSize: 20 }]}>
                {getMyProfileQuery.data?.nickname}
              </Text>
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
            <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, marginTop: h2p(10) }]}>
              {`${getMyProfileQuery.data?.tags.foodStyle} ${getMyProfileQuery.data?.tags.household} ${getMyProfileQuery.data?.tags.occupation}`}
            </Text>
          </View>
          <FastImage style={{
            width: d2p(70), height: d2p(70), borderRadius: 70,
            borderWidth: 1,
            borderColor: theme.color.grayscale.eae7ec
          }}
            source={getMyProfileQuery.data?.profileImage ? { uri: getMyProfileQuery.data?.profileImage } : noProfile} />
        </View>
        <View style={styles.profileInfo}>
          <Pressable
            onPress={() => {
              if (route.params?.id === myId) {
                navigation.navigate("editProfile",
                  {
                    profile:
                    {
                      nickname: getMyProfileQuery?.data?.nickname,
                      headline: getMyProfileQuery?.data?.headline,
                      profileImage: getMyProfileQuery?.data?.profileImage,
                      tags: {
                        foodStyle: getMyProfileQuery?.data?.tags.foodStyle.map(v => ({ title: v, isClick: true })),
                        household: getMyProfileQuery?.data?.tags.household.map(v => ({ title: v, isClick: true })),
                        occupation: getMyProfileQuery?.data?.tags.occupation.map(v => ({ title: v, isClick: true })),
                      },
                      representBadge: getMyProfileQuery?.data?.representBadge,
                      remainingPeriod: getMyProfileQuery?.data?.remainingPeriod
                    }
                  });
              }
            }}
            style={styles.headline}>
            <Text style={[FONT.Medium, {
              color: getMyProfileQuery.data?.headline ? theme.color.black : theme.color.grayscale.a09ca4
            }]}>
              {getMyProfileQuery.data?.headline ? getMyProfileQuery.data?.headline : "자기소개를 입력해주세요."}
            </Text>
            <Image
              style={{ width: d2p(10.5), height: d2p(10.5) }}
              source={graywrite}
            />
          </Pressable>
          <View style={{
            borderBottomWidth: 4, borderBottomColor: theme.color.grayscale.f7f7fc,
            borderTopWidth: 4, borderTopColor: theme.color.grayscale.f7f7fc,
            width: Dimensions.get("window").width,
            // flexDirection: "row",
          }}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => {
                  setFollowIndex(0);
                  followRef.current?.open();
                }}
                style={{
                  width: "50%",
                  paddingLeft: d2p(10), paddingVertical: h2p(10)
                }}>
                <View style={{ alignItems: "center", marginVertical: h2p(10) }}>
                  <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
                    팔로잉
                  </Text>
                  <Text style={[FONT.SemiBold, { marginTop: h2p(5) }]}>192</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setFollowIndex(1);
                  followRef.current?.open();
                }}
                style={{
                  width: "50%",
                  paddingRight: d2p(10), paddingVertical: h2p(10)
                }}>
                <View style={{
                  alignItems: "center", marginVertical: h2p(10),
                  borderLeftWidth: 1,
                  borderLeftColor: theme.color.grayscale.f7f7fc
                }}>
                  <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
                    팔로워
                  </Text>
                  <Text style={[FONT.SemiBold, { marginTop: h2p(5) }]}>60</Text>
                </View>
              </TouchableOpacity>
            </View>
            {route.params?.id !== myId &&
              <View style={{
                marginHorizontal: d2p(20), marginBottom: h2p(20),
                flexDirection: "row", alignItems: "center"
              }}>
                <BasicButton
                  onPress={() => {
                    // todo isFollow true면 false 반대면 true
                    if (getMyProfileQuery.data) {
                      followMutation.mutate({
                        userId: getMyProfileQuery.data?.id,
                        isFollow: true
                      });
                    }
                  }}
                  viewStyle={{ width: Dimensions.get("window").width - d2p(110), height: h2p(35) }}
                  text="팔로우" bgColor={theme.color.main} textColor={theme.color.white} />
                <TouchableOpacity style={{
                  borderWidth: 1,
                  borderColor: theme.color.grayscale.a09ca4,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 5,
                  width: d2p(60), height: h2p(35),
                  marginLeft: d2p(10)
                }}>
                  <Text style={[FONT.Medium, { color: theme.color.grayscale.C_443e49 }]}>
                    차단
                  </Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        </View>
      </View>
      <CustomBottomSheet
        customStyles={{
          container: {
            padding: 0,
            paddingTop: h2p(20),
            borderRadius: 30,
          }
        }}
        sheetRef={followRef}
        height={Dimensions.get("window").height - h2p(60)}
      >
        <>
          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            paddingHorizontal: d2p(30), marginBottom: h2p(20)
          }}>
            <CloseIcon onPress={() => followRef.current?.close()}
              imageStyle={{ width: d2p(15), height: h2p(15) }} />
            <Text style={[{ fontSize: 16, marginRight: d2p(15) }, FONT.Bold]}>{getMyProfileQuery.data?.nickname}</Text>
            <View />
          </View>
          {/* 팔로우 바텀 시트 */}
          {route.params?.id &&
            <FollowBottomTab
              followIndex={followIndex}
              id={route.params.id} />
          }
        </>
      </CustomBottomSheet>
    </>
  ), [getMyProfileQuery.data, followIndex]);

  // * 작성글
  const reviewKey = useCallback((v) => String(v.id), []);
  const reviewEmpty = useCallback(() => {
    if (!userReviewListQuery.isLoading) {
      return (
        <View style={{ paddingTop: h2p(100) }}>
          <View style={{ marginBottom: h2p(180) }}>
            <Text style={[FONT.Regular,
            {
              color: theme.color.grayscale.C_79737e,
              textAlign: "center",
            }]}>
              작성한 글이 없습니다.</Text>
          </View>
          {(route.params?.id === myId) &&
            <BasicButton
              viewStyle={{ marginHorizontal: d2p(20) }}
              onPress={() => navigation.navigate('Write', { loading: false, isEdit: false })}
              text="작성하기" textColor={theme.color.main} bgColor={theme.color.white} />
          }
        </View>
      );
    }
    return null;
  }, [userReviewListQuery.isLoading, route.params?.id]);

  const reviewHeader = useCallback(() => {
    if (userReviewListQuery.isLoading) {
      return (
        <Loading viewStyle={{
          position: "relative",
          top: h2p(90)
        }} />
      );
    }
    return null;
  }, [userReviewListQuery.isLoading]);

  const reviewRenderItem = useCallback(
    (review) => {
      if (userReviewListQuery.isLoading) {
        return null;
      }
      return (
        <Pressable
          onPress={() => navigation.navigate("FeedDetail",
            { id: review.item.id, isLike: review.item.isLike, authorId: review.item.author.id })}
          style={styles.review}
        >
          <FeedReview
            clickBoxStyle={{ right: d2p(26), top: h2p(-10) }}
            idx={review.index}
            selectedIndex={selectedIndex}
            setSelectedIndex={(selectIdx: number) => setSelectedIndex(selectIdx)}
            review={review.item} />
        </Pressable>
      );
    }
    , [selectedIndex, userReviewListQuery.isLoading]);

  const reviewEndReached = useCallback(() => {
    if (userReviewListQuery.data &&
      userReviewListQuery.data.pages.flat().length > 4) {
      userReviewListQuery.fetchNextPage();
    }
  }, [userReviewListQuery]);

  const reviewRefresh = useCallback(() => {
    userReviewListQuery.refetch();
    getMyProfileQuery.refetch();
  }, []);
  const reviewFooter = useCallback(() => <View style={{ height: h2p(100) }} />, []);

  // * 담은글
  const bookmarkKey = useCallback((v) => (v.id).toString(), []);
  const bookmarkEmpty = useCallback(() => {
    if (!userBookmarkListQuery.isLoading) {
      return (
        <View style={{ paddingTop: h2p(100) }}>
          <View style={{ marginBottom: h2p(180) }}>
            <Text style={[FONT.Regular,
            {
              color: theme.color.grayscale.C_79737e,
              textAlign: "center",
            }]}>
              담은 글이 없습니다.</Text>
          </View>
          {(route.params?.id === myId) &&
            <BasicButton
              viewStyle={{ marginHorizontal: d2p(20) }}
              onPress={() => navigation.navigate('Feed')}
              text="담으러 가기" textColor={theme.color.main} bgColor={theme.color.white} />
          }
        </View>
      );
    }
    return null;
  }, [userBookmarkListQuery.isLoading, route.params?.id]);

  const bookmarkHeader = useCallback(() => {
    if (userBookmarkListQuery.isLoading) {
      return (
        <Loading viewStyle={{
          position: "relative",
          top: h2p(90)
        }} />
      );
    }
    return null;
  }, [userBookmarkListQuery.isLoading]);

  const bookmarkRenderItem = useCallback((bookmarks) => {
    if (userBookmarkListQuery.isLoading) {
      return null;
    }
    return (
      <Pressable
        onPress={() => navigation.navigate("FeedDetail",
          { id: bookmarks.item.id, isLike: bookmarks.item.isLike, authorId: bookmarks.item.author.id })}
        style={styles.review}
      >
        <FeedReview
          clickBoxStyle={{ right: d2p(26), top: h2p(-10) }}
          idx={bookmarks.index}
          selectedIndex={selectedIndex}
          setSelectedIndex={(selectIdx: number) => setSelectedIndex(selectIdx)}
          review={bookmarks.item} />
      </Pressable>
    );
  }, [userBookmarkListQuery.isLoading, selectedIndex]);

  const bookmarkEndReached = useCallback(() => {
    if (userBookmarkListQuery.data &&
      userBookmarkListQuery.data?.pages.flat().length > 4) {
      userBookmarkListQuery.fetchNextPage();
    }
  }, [userBookmarkListQuery]);

  const bookmarkRefresh = useCallback(() => {
    userBookmarkListQuery.refetch();
    getMyProfileQuery.refetch();
  }, []);

  const bookmarkFooter = useCallback(() => <View style={{ height: h2p(100) }} />, []);

  useEffect(() => {
    // * 로그아웃시 온보딩화면으로
    if (!token) {
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  }, [token]);

  if (getMyProfileQuery.isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Tabs.Container
        onIndexChange={setIndex}
        containerStyle={styles.container}
        renderTabBar={(props) => <MaterialTabBar
          contentContainerStyle={{ paddingBottom: h2p(4.5), paddingTop: h2p(20) }}
          indicatorStyle={{
            height: 2,
            backgroundColor: theme.color.black,
            marginBottom: d2p(-1),
          }} TabItemComponent={(tabs) => (
            <Pressable
              onPress={() => props.onTabPress(tabs.label)}
              style={{ width: Dimensions.get("window").width / 2 }}>
              <Text style={[{
                fontSize: 16,
                textAlign: "center"
              }, tabs.index === index ? FONT.Bold : FONT.Regular]}>{tabs.label}
              </Text>
            </Pressable>
          )} {...props} />}
        renderHeader={tabHeader}
      >
        <Tabs.Tab
          name={`작성 글 ${getMyProfileQuery.data?.reviewCount}`}>
          <Tabs.FlatList
            ref={reviewRef}
            ListHeaderComponent={Platform.OS === "android" ? reviewHeader : null}
            ListEmptyComponent={reviewEmpty}
            onEndReached={reviewEndReached}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            refreshing={userReviewListQuery.isLoading}
            onRefresh={reviewRefresh}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={reviewFooter}
            data={userReviewListQuery.data?.pages.flat()}
            renderItem={reviewRenderItem}
            keyExtractor={reviewKey}
          />

        </Tabs.Tab>
        <Tabs.Tab name={`담은 글 ${getMyProfileQuery.data?.bookmarkCount}`}>
          <Tabs.FlatList
            ref={bookmarkRef}
            ListHeaderComponent={Platform.OS === "android" ? bookmarkHeader : null}
            ListEmptyComponent={bookmarkEmpty}
            onEndReached={bookmarkEndReached}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            refreshing={userBookmarkListQuery.isLoading}
            onRefresh={bookmarkRefresh}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={bookmarkFooter}
            data={userBookmarkListQuery.data?.pages.flat()}
            renderItem={bookmarkRenderItem}
            keyExtractor={bookmarkKey}
          />
        </Tabs.Tab>
      </Tabs.Container>
    </>
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
    marginVertical: h2p(30),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  profileInfo: {
    alignItems: "center"
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
});