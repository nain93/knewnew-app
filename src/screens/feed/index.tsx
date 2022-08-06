import { StyleSheet, Text, View, Image, FlatList, Platform, Dimensions, TouchableOpacity, Animated, Pressable, AppState, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import Header from '~/components/header';
import mainLogo from '~/assets/logo';
import FeedReview from '~/components/review/feedReview';
import { colorCheck, leftArrow, noticeIcon, tagfilter, whiteClose } from '~/assets/icons';

import RBSheet from "react-native-raw-bottom-sheet";
import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';
import SelectLayout from '~/components/layout/SelectLayout';
import { InterestTagType } from '~/types';
import AlertPopup from '~/components/popup/alertPopup';
import { useInfiniteQuery, useQuery } from 'react-query';
import { getReviewList } from '~/api/review';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isNotiReadState, myIdState, tokenState } from '~/recoil/atoms';
import Loading from '~/components/loading';
import { getMyProfile } from '~/api/user';
import { MyProfileType } from '~/types/user';
import { MarketType, ReactionType, ReviewListType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import { interestTagData } from '~/utils/data';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import FadeInOut from '~/hooks/useFadeInOut';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loading } from '~/assets/gif';
import { hitslop, marketList, reactList } from '~/utils/constant';
import CloseIcon from '~/components/icon/closeIcon';
import ResetButton from '~/components/button/resetButton';
import BasicButton from '~/components/button/basicButton';
import MarketLayout from '~/components/layout/MarketLayout';
import ReactionLayout from '~/components/layout/ReactionLayout';
import CustomBottomSheet from '~/components/popup/CustomBottomSheet';


function StatusBarPlaceHolder({ scrollOffset }: { scrollOffset: number }) {
  return (
    <View style={{
      width: "100%",
      height: getStatusBarHeight(),
      backgroundColor: scrollOffset >= h2p(130) ? theme.color.white : theme.color.grayscale.f7f7fc
    }} />
  );
}

export interface FeedProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    refresh: boolean
  }>;
}

const Feed = ({ navigation, route }: FeedProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isPopupOpen, setIsPopupOpen] = useState({ isOpen: false, content: "" });
  const fadeHook = FadeInOut({ isPopupOpen: isPopupOpen.isOpen, setIsPopupOpen: (isOpen: boolean) => setIsPopupOpen({ ...isPopupOpen, isOpen }) });
  const [scrollOffset, setScrollOffset] = useState(0);
  const tagRefRBSheet = useRef<RBSheet>(null);
  const reactRefRBSheet = useRef<RBSheet>(null);
  const sortRefSheet = useRef<RBSheet>(null);
  const marketRefRBSheet = useRef<RBSheet>(null);
  const [interestTag, setInterestTag] = useState<InterestTagType>(interestTagData);
  const [token, setToken] = useRecoilState(tokenState);
  const setMyId = useSetRecoilState(myIdState);
  const isNotiRead = useRecoilValue(isNotiReadState);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filterBadge, setFilterBadge] = useState("");
  const [allClick, setAllClick] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [sort, setSort] = useState<"0" | "1">("0");
  const [sortMarket, setSortMarket] = useState<string[]>();
  const [sortReact, setSortReact] = useState<string[]>();
  const [clickedMarket, setClickMarket] = useState<Array<{
    title: MarketType,
    isClick: boolean
  }>>(marketList.map(v => {
    return { title: v, isClick: false };
  }));
  const [clickedReact, setClickReact] = useState<Array<{
    title: ReactionType,
    isClick: boolean
  }>>(reactList.map(v => {
    return { title: v, isClick: false };
  }));

  const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", token, filterBadge], () => getMyProfile(token), {
    enabled: !!token,
    onSuccess: (data) => {
      if (data) {
        // * 최초 유저 대표뱃지로 필터링 설정
        if (!filterBadge && !allClick) {
          setFilterBadge(data.representBadge);
        }
        setMyId(data.id);
      }
    },
    onError: () => {
      setToken("");
      AsyncStorage.removeItem("token");
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  });

  const reviewListQuery = useInfiniteQuery<ReviewListType[], Error>(["reviewList", sort, sortReact, sortMarket, filterBadge], async ({ pageParam = 0 }) => {
    if (allClick) {
      const queryData = await getReviewList({
        token, tag: "",
        market: (clickedMarket.filter(v => v.isClick)).map(v => v.title).toString(),
        satisfaction: (clickedReact.filter(v => v.isClick)).map(v => v.title).toString(),
        offset: pageParam, limit: 5, sort
      });
      return queryData;
    }
    else {
      const queryData = await getReviewList({
        token, tag: filterBadge,
        market: (clickedMarket.filter(v => v.isClick)).map(v => v.title).toString(),
        satisfaction: (clickedReact.filter(v => v.isClick)).map(v => v.title).toString(),
        offset: pageParam, limit: 5, sort
      });
      return queryData;
    }
  }, {
    getNextPageParam: (next, all) => all.flat().length ?? undefined,
    onSettled: () => {
      SplashScreen.hide();
    }
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
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity
          onPress={() => tagRefRBSheet.current?.open()}
          style={styles.filter}>
          <Image source={tagfilter} style={{ width: d2p(11), height: d2p(10), marginRight: d2p(10) }} />
          <Text style={[FONT.Medium, { fontSize: 12, color: theme.color.grayscale.C_443e49 }]}>다른 태그 보기</Text>
        </TouchableOpacity>
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
          flexDirection: "row", marginTop: h2p(10), alignItems: "center",
          justifyContent: "space-between",
          marginBottom: h2p(5)
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
                반응별</Text>
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
            onPress={() => sortRefSheet.current?.open()}
            style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[FONT.Regular, { fontSize: 12, marginRight: d2p(5) }]}>
              {sort === "0" ? "최신순" : "인기순"}
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
      reviewListQuery.data.pages.flat().length > 4) {
      reviewListQuery.fetchNextPage();
    }
  }, [reviewListQuery]);

  const reviewOnScroll = useCallback((event) => {
    const currentScrollOffset = event.nativeEvent.contentOffset.y;
    setScrollOffset(currentScrollOffset);
  }, []);

  const reviewRenderItem = useCallback(({ item, index }) =>
    <Pressable
      onPress={() =>
        navigation.navigate("FeedDetail", {
          authorId: item.author.id,
          id: item.id, badge: filterBadge,
          isLike: item.isLike, isBookmark: item.isBookmark
        })}
      style={styles.review}>
      <FeedReview
        idx={index}
        selectedIndex={selectedIndex}
        setSelectedIndex={(selectIdx: number) => setSelectedIndex(selectIdx)}
        review={item}
        filterBadge={filterBadge}
      />
    </Pressable>
    , [filterBadge, selectedIndex]);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (scrollOffset >= h2p(130)) {
      fadeIn();
    }
    else {
      fadeOut();
    }
  }, [isPopupOpen, fadeAnim, scrollOffset]);


  useEffect(() => {
    if (route.params?.refresh) {
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [route.params]);

  useEffect(() => {
    if (!interestTag.interest.every(v => !v.isClick)) {
      setAllClick(false);
    }
    else {
      setAllClick(true);
    }
  }, [interestTag]);

  if (reviewListQuery.isLoading) {
    return <Loading />;
  }

  return (
    <>
      {Platform.OS === "ios" &&
        <StatusBarPlaceHolder scrollOffset={scrollOffset} />}
      <Header
        type="feed"
        viewStyle={isIphoneX() ? { marginTop: 0 } : {}}
        customRight={
          <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: 10 }}>
            {scrollOffset >= h2p(130) ?
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => tagRefRBSheet.current?.open()}
                  style={[styles.filter, { marginRight: d2p(10), marginBottom: 0 }]}>
                  <Image source={tagfilter} style={{ width: d2p(11), height: d2p(10), marginRight: d2p(10) }} />
                  <Text style={[FONT.Medium, { fontSize: 12 }]}>다른 태그 보기</Text>
                </TouchableOpacity>
                <Pressable
                  hitSlop={hitslop} onPress={() => navigation.navigate("notification")} >
                  {!isNotiRead &&
                    <View style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      borderRadius: 4,
                      width: d2p(4), height: d2p(4), backgroundColor: theme.color.main
                    }} />
                  }
                  <Image source={noticeIcon} style={{ width: d2p(24), height: d2p(24) }} />
                </Pressable>
              </View>
              :
              <View />
            }
          </Animated.View>
        }
        headerLeft={scrollOffset >= h2p(130) ?
          <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: 10 }}>
            {filterBadge ?
              <Text style={[{ fontSize: 16 }, FONT.Bold]}>
                {filterBadge ? `#${filterBadge}` : `#${getMyProfileQuery.data?.representBadge}`}
              </Text>
              :
              <Text style={[{ fontSize: 16 }, FONT.Bold]}>
                모든 메뉴
              </Text>
            }
          </Animated.View>
          :
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: Dimensions.get("window").width - d2p(40)
          }}>
            <Image source={mainLogo} resizeMode="contain" style={{ width: d2p(96), height: d2p(20) }} />
            <Pressable hitSlop={hitslop} onPress={() => navigation.navigate("notification")} >
              {!isNotiRead &&
                <View style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  borderRadius: 4,
                  width: d2p(4), height: d2p(4), backgroundColor: theme.color.main
                }} />
              }
              <Image source={noticeIcon} style={{ width: d2p(24), height: d2p(24) }} />
            </Pressable>
          </View>
        }
        isBorder={scrollOffset >= h2p(130) ? true : false} bgColor={scrollOffset >= h2p(130) ? theme.color.white : theme.color.grayscale.f7f7fc}
      />
      <View>
        <FlatList
          ref={flatListRef}
          onEndReached={reviewEndReached}
          refreshing={reviewListQuery.isLoading}
          onRefresh={reviewListQuery.refetch}
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
          onScroll={reviewOnScroll}
        />
      </View>

      {/* 다른 태그 보기 sheet */}
      <CustomBottomSheet
        sheetRef={tagRefRBSheet}
        onOpen={() =>
          setInterestTag({
            interest: interestTag.interest.map(v => {
              if (v.title === filterBadge) {
                return { title: v.title, isClick: true };
              }
              return { title: v.title, isClick: false };
            })
          })
        }
        height={Dimensions.get("window").height * (481 / 760)}
        customStyles={{
          wrapper: {
            transform: [{ rotate: '180deg' }],
          },
          container: {
            transform: [{ rotate: '180deg' }],
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            paddingHorizontal: d2p(20),
            paddingBottom: h2p(20),
            paddingTop: Platform.OS === "ios" ? getStatusBarHeight() + d2p(15) : d2p(15),
          }, draggableIcon: {
            display: "none"
          }
        }}
      >
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: h2p(20),
            }}>
            <Text style={[{ color: theme.color.grayscale.C_79737e }, FONT.Medium]}>
              보고싶은 태그를 하나만 선택해주세요
            </Text>
            <TouchableOpacity
              onPress={() => {
                // * 태그 선택 안했을경우
                if (
                  interestTag.interest.every(v => !v.isClick) &&
                  !allClick
                ) {
                  setIsPopupOpen({ isOpen: true, content: "태그를 선택해주세요" });
                  return;
                }
                if (allClick) {
                  setFilterBadge("");
                  tagRefRBSheet.current?.close();
                  return;
                }
                // * 태그 선택후 대표 뱃지 적용
                const copy: { [index: string]: Array<{ isClick: boolean, title: string }> } = { ...interestTag };
                const badge = Object.keys(interestTag).reduce((acc, cur) => {
                  if (!copy[cur].every(v => !v.isClick)) {
                    acc = copy[cur].filter(v => v.isClick)[0].title;
                  }
                  return acc;
                }, "");
                setFilterBadge(badge);

                tagRefRBSheet.current?.close();
                // * 필터후 스크롤 offset초기화
                flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 5,
                width: d2p(100), height: h2p(30), backgroundColor: theme.color.main
              }}>
              <Text style={[styles.tagBtn, FONT.Medium]}>태그 적용</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              setAllClick(!allClick);
              setInterestTag(interestTagData);
            }}
            style={{
              paddingHorizontal: d2p(15),
              paddingVertical: h2p(5),
              maxWidth: d2p(150),
              borderRadius: 20,
              backgroundColor: theme.color.white,
              borderWidth: 1,
              borderColor: allClick ? theme.color.main : theme.color.grayscale.d2d0d5,
              flexDirection: "row",
              alignItems: "center", justifyContent: "center",
              marginBottom: h2p(20)
            }}>
            {allClick && <Image source={colorCheck} resizeMode="contain" style={{ width: d2p(10), height: d2p(8), marginRight: d2p(5) }} />}
            <Text style={[FONT.Medium, {
              color: allClick ? theme.color.main : theme.color.black,
              includeFontPadding: false
            }]}>모든 메뉴 보기 👀</Text>
          </TouchableOpacity>
          <SelectLayout type="filter" interestTag={interestTag} setInterestTag={setInterestTag} />
          {isPopupOpen.isOpen &&
            <Animated.View style={{ opacity: fadeHook.fadeAnim ? fadeHook.fadeAnim : 1, zIndex: fadeHook.fadeAnim ? fadeHook.fadeAnim : -1 }}>
              <AlertPopup text={isPopupOpen.content} popupStyle={{ bottom: h2p(20) }} />
            </Animated.View>
          }
        </>
      </CustomBottomSheet>

      {/* 최신순 sheet */}
      <CustomBottomSheet
        sheetRef={sortRefSheet}
        height={Dimensions.get("window").height - h2p(600)}
      >
        <>
          <TouchableOpacity
            onPress={() => {
              setSort("0");
              sortRefSheet.current?.close();
            }}
            style={{
              paddingVertical: h2p(12.5), paddingHorizontal: d2p(10),
              borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc
            }}>
            <Text style={[FONT.Regular, {
              color: sort === "0" ? theme.color.black : theme.color.grayscale.a09ca4
            }]}>최신순</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSort("1");
              sortRefSheet.current?.close();
            }}
            style={{
              paddingVertical: h2p(12.5), paddingHorizontal: d2p(10),
              borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc
            }}>
            <Text style={[FONT.Regular, {
              color: sort === "1" ? theme.color.black : theme.color.grayscale.a09ca4
            }]}>인기순</Text>
          </TouchableOpacity>
        </>
      </CustomBottomSheet>

      {/* 반응별 sheet */}
      <CustomBottomSheet
        height={Dimensions.get("window").height - h2p(480)}
        sheetRef={reactRefRBSheet}
        onOpen={() =>
          setClickReact(clickedReact.map(v => {
            if (sortReact?.includes(v.title)) {
              return { ...v, isClick: true };
            }
            return { ...v, isClick: false };
          }))
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
              title: ReactionType,
              isClick: boolean
            }[]) => setClickReact(react)}
          />
          <ResetButton resetClick={() => setClickReact(clickedReact.map(v => ({
            title: v.title, isClick: false
          })))}
            viewStyle={{ marginTop: h2p(40), marginBottom: "auto" }} />
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
        onOpen={() =>
          setClickMarket(clickedMarket.map(v => {
            if (sortMarket?.includes(v.title)) {
              return { ...v, isClick: true };
            }
            return { ...v, isClick: false };
          }))
        }
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
          }} viewStyle={{ marginTop: h2p(40), marginBottom: "auto" }} />
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
    borderRadius: 10,
    marginHorizontal: d2p(10), marginTop: h2p(15),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15)
  },
  main: {
    paddingTop: h2p(35),
    paddingBottom: h2p(18),
    paddingHorizontal: d2p(20),
    width: '100%'
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