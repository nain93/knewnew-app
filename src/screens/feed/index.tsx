import { StyleSheet, Text, View, Image, FlatList, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import Header from '~/components/header';
import FeedReview from '~/components/review/feedReview';
import { graysearch, leftArrow, whiteClose } from '~/assets/icons';

import RBSheet from "react-native-raw-bottom-sheet";
import { useInfiniteQuery, useQuery } from 'react-query';
import { getReviewList } from '~/api/review';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { bottomDotSheetState, tokenState } from '~/recoil/atoms';
import Loading from '~/components/loading';
import { getMyProfile } from '~/api/user';
import { MyProfileType } from '~/types/user';
import { FoodLogType, MarketType, ReviewListType, SatisfactionType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loading } from '~/assets/gif';
import { hitslop, markeForFiltertList, reactList } from '~/utils/constant';
import CloseIcon from '~/components/icon/closeIcon';
import ResetButton from '~/components/button/resetButton';
import BasicButton from '~/components/button/basicButton';
import MarketLayout from '~/components/layout/MarketLayout';
import ReactionLayout from '~/components/layout/ReactionLayout';
import CustomBottomSheet from '~/components/popup/CustomBottomSheet';
import { useFocusEffect } from '@react-navigation/native';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';

export interface FeedProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    refresh: boolean,
    foodLog?: FoodLogType | "all",
    market?: MarketType,
    sort?: "0" | "1" | "2"
  }>;
}

const Feed = ({ navigation, route }: FeedProps) => {
  const reactRefRBSheet = useRef<RBSheet>(null);
  const marketRefRBSheet = useRef<RBSheet>(null);
  const [token, setToken] = useRecoilState(tokenState);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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

  const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", token, filterBadge], () => getMyProfile(token), {
    enabled: !!token,
    onError: () => {
      setToken("");
      AsyncStorage.removeItem("token");
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  });

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
    <>
      <View style={styles.main}>
        <Text style={[styles.mainText, FONT.Bold]}>지금 실시간</Text>
        <View style={{ flexDirection: 'row' }}>
          {filterBadge ?
            <>
              <Text style={[styles.mainText, { color: theme.color.main }, FONT.Bold]}>
                {filterBadge ? `#${filterBadge}` : `#${getMyProfileQuery.data?.representBadge}`} </Text>
              <Text style={[styles.mainText, FONT.Bold]}>구경 중이에요!</Text>
            </>
            :
            <>
              <Text style={[styles.mainText, { color: theme.color.main }, FONT.Bold]}>
                모든 메뉴 </Text>
              <Text style={[styles.mainText, FONT.Bold]}>구경 중이에요!</Text>
            </>
          }
        </View>
      </View>

      <View style={{ paddingHorizontal: d2p(10) }}>
        {/* 팔로잉 기능 추가후 주석해제 */}
        {/* <View style={{ flexDirection: "row", alignItems: "center", marginLeft: d2p(10) }}>
          <Image source={grayCheckIcon} style={{ width: d2p(10), height: d2p(8), marginRight: d2p(10) }} />
          <Text style={[FONT.Medium, { color: theme.color.grayscale.a09ca4, fontSize: 12 }]}>
            팔로잉한 유저만 보기
          </Text>
        </View> */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: h2p(10),
        }}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => {
                if (sortReact && sortReact.length > 0) {
                  setClickReact(clickedReact.map(v => ({ ...v, isClick: false })));
                  setSortReact([]);
                }
                else {
                  reactRefRBSheet.current?.open();
                }
              }}
              style={[styles.filterTag, {
                backgroundColor: (sortReact && sortReact.length > 0) ? theme.color.grayscale.C_443e49 : theme.color.white,
              }]}>
              <Text style={[FONT.Regular, {
                marginRight: d2p(5), fontSize: 12,
                color: (sortReact && sortReact.length > 0) ? theme.color.white : theme.color.grayscale.C_443e49
              }]}>
                반응별
              </Text>
              {(sortReact && sortReact.length > 0) ?
                <Image source={whiteClose} style={{ width: d2p(7), height: d2p(7) }} />
                :
                <Image source={leftArrow} style={{ width: d2p(7), height: d2p(15), transform: [{ rotate: "270deg" }] }} />
              }
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (sortMarket && sortMarket.length > 0) {
                  setClickMarket(clickedMarket.map(v => ({ ...v, isClick: false })));
                  setSortMarket([]);
                }
                else {
                  marketRefRBSheet.current?.open();
                }
              }
              }
              style={[styles.filterTag, {
                backgroundColor: (sortMarket && sortMarket.length > 0) ? theme.color.grayscale.C_443e49 : theme.color.white,
              }]}>
              <Text style={[FONT.Regular, {
                marginRight: d2p(5), fontSize: 12,
                color: (sortMarket && sortMarket.length > 0) ? theme.color.white : theme.color.grayscale.C_443e49
              }]}>
                구매처별</Text>
              {(sortMarket && sortMarket.length > 0) ?
                <Image source={whiteClose} style={{ width: d2p(7), height: d2p(7) }} />
                :
                <Image source={leftArrow} style={{ width: d2p(7), height: d2p(15), transform: [{ rotate: "270deg" }] }} />
              }
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            hitSlop={hitslop}
            onPress={() => {
              setSelectedIndex(-1);
              setIsBottomDotSheet({
                isOpen: true,
                topTitle: "최신순 보기",
                topPress: () => setSort("0"),
                middleTitle: "인기순 보기",
                middlePress: () => setSort("1"),
                bottomTitle: "닫기"
              });
            }}
            style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[FONT.Regular, { fontSize: 12, marginRight: d2p(5) }]}>
              {sort === "0" ? "최신순" : sort === "1" ? "인기순" : "최신순"}
            </Text>
            <Image source={leftArrow} style={{ width: d2p(7), height: d2p(15), transform: [{ rotate: "270deg" }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </>
    , [filterBadge, getMyProfileQuery.data?.representBadge, sort, sortReact, sortMarket]);

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
    , [filterBadge, selectedIndex]);

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
        setFilterBadge(route.params.foodLog);
      }
    }
    if (route.params?.sort) {
      setSort(route.params.sort);
    }
    if (route.params?.refresh) {
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [route.params]);

  useFocusEffect(useCallback(() => {
    // * 화면 나갈때 ...팝업 끄기
    return () => setSelectedIndex(-1);
  }, []));

  if (reviewListQuery.isLoading) {
    <Loading />;
  }

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon />}
        headerRight={<Pressable hitSlop={hitslop} onPress={() => navigation.navigate("search")} >
          <Image source={graysearch} style={{ width: d2p(24), height: d2p(24) }} />
        </Pressable>}
        title={`#${filterBadge === "" ? "모든메뉴" : filterBadge}`}
      />
      <Pressable onPress={() => setSelectedIndex(-1)}>
        <FlatList
          ref={flatListRef}
          onEndReached={reviewEndReached}
          refreshing={reviewListQuery.isLoading}
          onRefresh={() => {
            if (sort === "3") {
              reviewListQuery.refetch();
            }
            else {
              setSort("3");
            }
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
          style={{ marginTop: 0, marginBottom: h2p(80), backgroundColor: theme.color.grayscale.f7f7fc }}
          keyExtractor={reviewKey}
        />
      </Pressable>

      {/* 반응별 sheet */}
      <CustomBottomSheet
        height={Dimensions.get("window").height - h2p(480)}
        sheetRef={reactRefRBSheet}
        onOpen={() => {
          setSelectedIndex(-1);
          setClickReact(clickedReact.map(v => {
            if (sortReact?.includes(v.title)) {
              return { ...v, isClick: true };
            }
            return { ...v, isClick: false };
          }));
        }
        }
      >
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: d2p(10), marginBottom: h2p(30) }}>
            <CloseIcon onPress={() => reactRefRBSheet.current?.close()}
              imageStyle={{ width: d2p(15), height: h2p(15) }} />
            <Text style={[{ fontSize: 16, marginRight: d2p(15) }, FONT.Bold]}>반응별로 보기</Text>
            <View />
          </View>
          <ReactionLayout
            clickedReact={clickedReact}
            setClickReact={(react: {
              title: SatisfactionType,
              isClick: boolean
            }[]) => setClickReact(react)}
          />
          <ResetButton resetClick={() => setClickReact(clickedReact.map(v => ({
            title: v.title, isClick: false
          })))}
            viewStyle={{ marginTop: h2p(30), marginBottom: "auto" }} />
          <BasicButton text="필터 저장하기"
            onPress={() => {
              setSortReact(clickedReact.filter(v => v.isClick).map(v => v.title));
              reviewListQuery.refetch();
              reactRefRBSheet.current?.close();
            }}
            bgColor={theme.color.main}
            textColor={theme.color.white}
          />
        </>
      </CustomBottomSheet>

      {/* 구매처별 sheet */}
      <CustomBottomSheet
        sheetRef={marketRefRBSheet}
        height={Dimensions.get("window").height - h2p(456)}
        onOpen={() => {
          setSelectedIndex(-1);
          setClickMarket(clickedMarket.map(v => {
            if (sortMarket?.includes(v.title)) {
              return { ...v, isClick: true };
            }
            return { ...v, isClick: false };
          }));
        }}
      >
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: d2p(10), marginBottom: h2p(30) }}>
            <CloseIcon onPress={() => marketRefRBSheet.current?.close()}
              imageStyle={{ width: d2p(15), height: h2p(15) }} />
            <Text style={[{ fontSize: 16, marginRight: d2p(15) }, FONT.Bold]}>구매처별로 보기</Text>
            <View />
          </View>
          <MarketLayout
            clickedMarket={clickedMarket}
            setClickMarket={(market: {
              title: MarketType,
              isClick: boolean
            }[]) => {
              setClickMarket(market);
            }}
          />
          <ResetButton resetClick={() => {
            setClickMarket(clickedMarket.map(v => ({ title: v.title, isClick: false })));
          }} viewStyle={{ marginTop: h2p(30), marginBottom: "auto" }} />
          <BasicButton text="필터 저장하기"
            onPress={() => {
              setSortMarket(clickedMarket.filter(v => v.isClick).map(v => v.title));
              reviewListQuery.refetch();
              marketRefRBSheet.current?.close();
            }}
            bgColor={theme.color.main}
            textColor={theme.color.white}
          />
        </>
      </CustomBottomSheet>
    </>
  );
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
    borderColor: "#9f9ca3",
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