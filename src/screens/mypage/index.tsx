import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { myIdState, tokenState } from '~/recoil/atoms';
import { getMyProfile, getUserBookmarkList, getUserProfile, getUserReviewList } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import { MyPrfoileType } from '~/types/user';
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

interface MypageProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    id?: number,
    refresh?: boolean,
    openMore?: boolean
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

  const getMyProfileQuery = useQuery<MyPrfoileType, Error>(["myProfile", route.params?.id], async () => {
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
    <View pointerEvents="none" >
      <View style={styles.profileImage} >
        <Image style={{
          width: d2p(60), height: d2p(60), borderRadius: 60,
          borderWidth: 1,
          borderColor: theme.color.grayscale.eae7ec
        }}
          source={getMyProfileQuery.data?.profileImage ? { uri: getMyProfileQuery.data?.profileImage } : noProfile} />
      </View>
      <View style={styles.profileInfo}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[FONT.Bold, { fontSize: 24, marginRight: d2p(10) }]}>{getMyProfileQuery.data?.nickname}</Text>
          <View style={{
            height: h2p(20), minWidth: d2p(55),
            marginRight: d2p(5),
            justifyContent: "center", alignItems: "center",
            paddingHorizontal: d2p(10), paddingVertical: h2p(3),
            borderRadius: 10, backgroundColor: theme.color.grayscale.f7f7fc, borderWidth: 1, borderColor: theme.color.grayscale.d2d0d5
          }}>
            <Text style={[FONT.Medium, { fontSize: 10, fontWeight: '500' }]}>{getMyProfileQuery.data?.representBadge}</Text>
          </View>
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>{getMyProfileQuery.data?.household}</Text>
        </View>
        <View style={styles.occupation}>
          <Text style={[FONT.Medium, {
            color: getMyProfileQuery.data?.occupation ? theme.color.black : theme.color.grayscale.a09ca4
          }]}>
            {getMyProfileQuery.data?.occupation ? getMyProfileQuery.data?.occupation : "자기소개를 입력해주세요."}</Text>
        </View>
        <View style={{
          flexDirection: "row", flexWrap: "wrap",
          justifyContent: "center",
          width: Dimensions.get("window").width - d2p(40)
        }}>
          {React.Children.toArray(getMyProfileQuery.data?.tags.map(v =>
            <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>#{v} </Text>
          ))}
        </View>
      </View>
    </View>
  ), [getMyProfileQuery.data]);

  const reviewKey = useCallback((v) => String(v.id), []);
  const reviewEmpty = useCallback(() => {
    if (!userReviewListQuery.isLoading) {
      return (
        <View style={{ paddingTop: h2p(100) }}>
          <View style={{ marginBottom: h2p(80) }}>
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

  const reviewRenderItem = useCallback(
    (review) => {
      if (userReviewListQuery.isLoading) {
        return (
          <View style={{
            position: "absolute",
            alignSelf: "center",
            top: h2p(-90)
          }}>
            <Text>zdfjadhgkadjghadkjgadkjghadkjghadkj</Text>
            <Loading />
          </View>
        );
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

  const bookmarkKey = useCallback((v) => (v.id).toString(), []);
  const bookmarkEmpty = useCallback(() => {
    if (!userBookmarkListQuery.isLoading) {
      return (
        <View style={{ paddingTop: h2p(100) }}>
          <View style={{ marginBottom: h2p(80) }}>
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

  const bookmarkRenderItem = useCallback((bookmarks) => {
    if (userBookmarkListQuery.isLoading) {
      return <View style={{
        position: "absolute",
        alignSelf: "center",
        top: h2p(-90)
      }}>
        <Loading />
      </View>;
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

  useEffect(() => {
    // * 로그아웃시 온보딩화면으로
    if (!token) {
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      // * 프로필 수정화면으로 넘겨줄 데이터 쿼리에 저장
      queryClient.setQueryData("myProfile", getMyProfileQuery.data);
    }, [getMyProfileQuery.data, queryClient]));

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
            ListEmptyComponent={reviewEmpty}
            onEndReached={() => userReviewListQuery.fetchNextPage()}
            onEndReachedThreshold={0.8}
            refreshing={userReviewListQuery.isLoading}
            onRefresh={() => {
              userReviewListQuery.refetch();
              getMyProfileQuery.refetch();
            }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => <View style={{ height: h2p(100) }} />}
            data={userReviewListQuery.data?.pages.flat()}
            renderItem={reviewRenderItem}
            keyExtractor={reviewKey}
          />
        </Tabs.Tab>
        <Tabs.Tab name={`담은 글 ${getMyProfileQuery.data?.bookmarkCount}`}>
          <Tabs.FlatList
            ref={bookmarkRef}
            ListEmptyComponent={bookmarkEmpty}
            onEndReached={() => userBookmarkListQuery.fetchNextPage()}
            onEndReachedThreshold={0.8}
            refreshing={userBookmarkListQuery.isLoading}
            onRefresh={() => {
              userBookmarkListQuery.refetch();
              getMyProfileQuery.refetch();
            }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => <View style={{ height: h2p(100) }} />}
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
    width: d2p(60),
    height: d2p(60),
    borderRadius: 60,
    marginBottom: h2p(25),
    marginTop: h2p(30),
    alignSelf: "center"
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: h2p(30)
  },
  occupation: {
    width: Dimensions.get("window").width - d2p(40),
    borderWidth: 1,
    minHeight: h2p(40),
    paddingVertical: h2p(10),
    paddingHorizontal: d2p(10),
    borderColor: theme.color.grayscale.ec6863,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    marginTop: h2p(20),
    marginBottom: h2p(15),
    justifyContent: "center",
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