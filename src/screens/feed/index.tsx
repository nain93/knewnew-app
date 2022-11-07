import { StyleSheet, Text, View, Image, FlatList, Dimensions, Pressable } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { convertFoodLogName, d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import FeedReview from '~/components/review/feedReview';

import RBSheet from "react-native-raw-bottom-sheet";
import { useInfiniteQuery } from 'react-query';
import { getReviewList } from '~/api/review';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { bottomDotSheetState, tokenState } from '~/recoil/atoms';
import Loading from '~/components/loading';
import { FoodLogType, MarketType, ReviewListType, SatisfactionType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { loading } from '~/assets/gif';
import { markeForFiltertList, reactList } from '~/utils/constant';
import { FilterType } from '~/types';
import FoodLog from '~/screens/feed/foodLog';

export interface FeedProps {
  filterScreen: FilterType;
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    refresh: boolean,
    foodLog?: FoodLogType | "all",
    market?: MarketType,
    sort?: "0" | "1" | "2"
  }>;
}

const Feed = ({ navigation, route, filterScreen }: FeedProps) => {
  const reactRefRBSheet = useRef<RBSheet>(null);
  const marketRefRBSheet = useRef<RBSheet>(null);
  const [token, setToken] = useRecoilState(tokenState);
  const [filterBadge, setFilterBadge] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const setIsBottomDotSheet = useSetRecoilState(bottomDotSheetState);

  const [sort, setSort] = useState<"0" | "1" | "2" | "3">("0");
  const [sortMarket, setSortMarket] = useState<string[]>();
  const [sortReact, setSortReact] = useState<string[]>();
  const [clickedMarket, setClickMarket] = useState<Array<{
    title: MarketType,
    isClick: boolean
  }>>(markeForFiltertList.map(v => {
    return { title: v, isClick: false };
  }));
  const [clickedReact, setClickReact] = useState<Array<{
    title: SatisfactionType,
    isClick: boolean
  }>>(reactList.map(v => {
    return { title: v, isClick: false };
  }));

  // const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", token, filterBadge], () => getMyProfile(token), {
  //   enabled: !!token,
  //   onError: () => {
  //     setToken("");
  //     AsyncStorage.removeItem("token");
  //     //@ts-ignore
  //     navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
  //   }
  // });

  const reviewListQuery = useInfiniteQuery<ReviewListType[], Error>(["reviewList", sort, sortReact, sortMarket, filterBadge], async ({ pageParam = 0 }) => {
    const queryData = await getReviewList({
      token, tag: filterBadge,
      market: (clickedMarket.filter(v => v.isClick)).map(v => v.title).toString(),
      satisfaction: (clickedReact.filter(v => v.isClick)).map(v => v.title).toString(),
      offset: pageParam, limit: 5,
      sort
    });
    return queryData;
  }, {
    getPreviousPageParam: (next, all) => all.flat().length - 5,
    getNextPageParam: (next, all) => all.flat().length
  });

  const reviewKey = useCallback((review) => String(review.id), []);
  const reviewHeader = useCallback(() =>
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: d2p(20),
      marginTop: h2p(30)
    }}>
      <Text style={[FONT.Bold, { fontSize: 20 }]}>
        모두보기
      </Text>
      <Pressable
        onPress={() => navigation.goBack()}
        style={{ flexDirection: "row", alignItems: "center" }}>
        {/* <Image source={filterIcon} style={{
          marginRight: d2p(6.5),
          width: d2p(11.5), height: d2p(11)
        }} /> */}
        <Text style={[FONT.Regular, { fontSize: 12 }]}>
          필터 선택
        </Text>
      </Pressable>
    </View>
    , [filterBadge, sort, sortReact, sortMarket]);

  const reviewFooter = useCallback(() => <View style={{ height: h2p(117) }} />, []);

  const footerLoading = useCallback(() =>
    <View style={{ height: h2p(117) }}>
      <Image source={loading} style={{ alignSelf: "center", width: d2p(70), height: d2p(70) }} />
    </View>, []);

  const reviewEndReached = useCallback(() => {
    if (reviewListQuery.data &&
      reviewListQuery.data.pages.flat().length > 4 &&
      reviewListQuery.hasNextPage
    ) {
      reviewListQuery.fetchNextPage();
    }
  }, [reviewListQuery]);

  const reviewRenderItem = useCallback(({ item, index }) =>
    <Pressable
      onPress={() => {
        navigation.push("FeedDetail", {
          authorId: item.author.id,
          id: item.id, badge: filterBadge,
          isLike: item.isLike, isBookmark: item.isBookmark
        });
      }}
      style={styles.review}>
      <FeedReview
        review={item}
        filterBadge={filterBadge}
      />
    </Pressable>
    , [filterBadge]);

  useEffect(() => {
    if (route.params?.market) {
      setClickMarket(clickedMarket.map(v => {
        if (v.title === route.params?.market) {
          return { ...v, isClick: true };
        }
        return v;
      }));
      setSortMarket([route.params.market]);
    }
    if (route.params?.foodLog) {
      if (route.params.foodLog === "all") {
        setFilterBadge("");
      }
      else {
        setFilterBadge(convertFoodLogName(route.params.foodLog));
      }
    }
    if (route.params?.sort) {
      setSort(route.params.sort);
    }
    if (route.params?.refresh) {
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [route.params]);

  if (filterScreen === "찾아보기") {

    if (reviewListQuery.isLoading) {
      <Loading />;
    }

    return (
      <FlatList
        ref={flatListRef}
        onEndReached={reviewEndReached}
        refreshing={reviewListQuery.isLoading}
        onRefresh={() => {
          // todo 리뷰리스트 새로고침
        }}
        data={reviewListQuery.data?.pages.flat()}
        ListHeaderComponent={reviewHeader}
        showsVerticalScrollIndicator={false}
        renderItem={reviewRenderItem}
        onEndReachedThreshold={0.5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListFooterComponent={reviewListQuery.isFetchingNextPage ? footerLoading : reviewFooter}
        style={{ marginTop: 0, marginBottom: h2p(80) }}
        keyExtractor={reviewKey}
      />
    );
  }

  else {
    return (
      <FoodLog navigation={navigation} route={route} />
    );
  }
};


export default Feed;

const styles = StyleSheet.create({
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    borderRadius: 15,
    marginHorizontal: d2p(10), marginTop: h2p(10),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15)
  },
  main: {
    paddingTop: h2p(35),
    marginBottom: h2p(40),
    paddingHorizontal: d2p(20),
    width: '100%',
  },
  mainText: {
    fontSize: 20
  },
  filter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.color.grayscale.C_9F9CA3,
    borderRadius: 5,
    paddingVertical: h2p(7),
    paddingHorizontal: d2p(15),
    backgroundColor: theme.color.white,
    marginRight: d2p(20),
    marginBottom: h2p(20)
  },
  filterTag: {
    borderColor: theme.color.grayscale.e9e7ec,
    borderWidth: 1,
    width: d2p(70), height: h2p(25),
    borderRadius: 12.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: d2p(5),
    flexDirection: "row"
  },
  tagBtn: {
    color: theme.color.white,
    fontSize: 12
  }
});