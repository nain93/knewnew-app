import { Dimensions, FlatList, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { myIdState, tokenState } from '~/recoil/atoms';
import { getMyProfile, getUserBookmarkList, getUserProfile, getUserReviewList } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
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
import { useFocusEffect } from '@react-navigation/native';
import { graywrite } from '~/assets/icons';

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
  const reviewRef = useRef<FlatList>(null);
  const bookmarkRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", route.params?.id], async () => {
    if (route.params?.id && (route.params.id !== myId)) {
      const queryData = await getUserProfile(token, route.params?.id);
      return queryData;
    }
    else {
      const queryData = await getMyProfile(token);
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
      const queryData = await getUserReviewList({ token, id: route.params?.id, offset: pageParam });
      return queryData;
    }
  }, {
    enabled: !!route.params?.id,
    getNextPageParam: (next, all) => all.flat().length
  });

  const userBookmarkListQuery = useInfiniteQuery<ReviewListType[], Error>(["userBookmarkList", route.params?.id], async ({ pageParam = 0 }) => {
    if (route.params?.id) {
      const queryData = await getUserBookmarkList({ token, id: route.params?.id, offset: pageParam });
      return queryData;
    }
  }, {
    enabled: !!route.params?.id,
    getNextPageParam: (next, all) => all.flat().length
  });

  const tabHeader = useCallback(() => (
    // pointerEvents="none"
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
        <Image style={{
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
                  },
                  foucsHeadLine: true
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
      </View>
    </View>
  ), [getMyProfileQuery.data]);

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

  const reviewFooter = useCallback(() => <View style={{ height: h2p(100) }} />, []);

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
            onEndReached={() => {
              if (userReviewListQuery.data &&
                userReviewListQuery.data.pages.flat().length > 19) {
                userReviewListQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.8}
            refreshing={userReviewListQuery.isLoading}
            onRefresh={() => {
              userReviewListQuery.refetch();
              getMyProfileQuery.refetch();
            }}
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
            onEndReached={() => {
              if (userBookmarkListQuery.data &&
                userBookmarkListQuery.data?.pages.flat().length > 19) {
                userBookmarkListQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.8}
            refreshing={userBookmarkListQuery.isLoading}
            onRefresh={() => {
              userBookmarkListQuery.refetch();
              getMyProfileQuery.refetch();
            }}
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