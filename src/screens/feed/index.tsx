import { StyleSheet, Text, View, Image, FlatList, Platform, Dimensions, TouchableOpacity, Animated, Pressable } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import Header from '~/components/header';
import mainLogo from '~/assets/logo';
import FeedReview from '~/components/review/feedReview';
import { colorCheck, tagfilter } from '~/assets/icons';

import RBSheet from "react-native-raw-bottom-sheet";
import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';
import SelectLayout from '~/components/selectLayout';
import { BadgeType } from '~/types';
import AlertPopup from '~/components/popup/alertPopup';
import { useInfiniteQuery, useQuery } from 'react-query';
import { getReviewList } from '~/api/review';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { myIdState, refreshState, tokenState } from '~/recoil/atoms';
import Loading from '~/components/loading';
import { getMyProfile } from '~/api/user';
import { MyProfileType } from '~/types/user';
import { ReviewListType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import { initialBadgeData } from '~/utils/data';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import FadeInOut from '~/hooks/fadeInOut';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
  const fadeHook = FadeInOut({ isPopupOpen, setIsPopupOpen });
  const [scrollOffset, setScrollOffset] = useState(0);
  const tagRefRBSheet = useRef<RBSheet>(null);
  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const [token, setToken] = useRecoilState(tokenState);
  const setMyId = useSetRecoilState(myIdState);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filterBadge, setFilterBadge] = useState("");
  const [allClick, setAllClick] = useState(false);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const flatListRef = useRef<FlatList>(null);

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
      else {
        SplashScreen.hide();
      }
    },
    onError: () => {
      setToken("");
      AsyncStorage.removeItem("token");
      SplashScreen.hide();
    }
  });

  const reviewListQuery = useInfiniteQuery<ReviewListType[], Error>(["reviewList", token, filterBadge], async ({ pageParam = 0 }) => {
    if (allClick) {
      const queryData = await getReviewList({ token, tag: "", offset: pageParam });
      return queryData;
    }
    else {
      const queryData = await getReviewList({ token, tag: filterBadge, offset: pageParam });
      return queryData;
    }
  }, {
    getNextPageParam: (next, all) => all.flat().length,
    onSettled: () => {
      SplashScreen.hide();
    }
  });
  const reviewKey = useCallback((review) => String(review.id), []);
  const reviewHeader = useCallback(() =>
    <>
      <View style={styles.main}>
        <Text style={[styles.mainText, FONT.Bold]}>뉴뉴는 지금</Text>
        <View style={{ flexDirection: 'row' }}>
          {filterBadge ?
            <>
              <Text style={[styles.mainText, { color: theme.color.main, marginTop: Platform.OS === "ios" ? h2p(2) : 0 }, FONT.Bold]}>
                {filterBadge ? `#${filterBadge}` : `#${getMyProfileQuery.data?.representBadge}`} </Text>
              <Text style={[styles.mainText, FONT.Bold]}>관련 메뉴 추천 중 👀</Text>
            </>
            :
            <>
              <Text style={[styles.mainText, { color: theme.color.main, marginTop: Platform.OS === "ios" ? h2p(2) : 0 }, FONT.Bold]}>
                모든 메뉴 </Text>
              <Text style={[styles.mainText, FONT.Bold]}>추천 중 👀</Text>
            </>
          }

        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity
          onPress={() => tagRefRBSheet.current?.open()}
          style={styles.filter}>
          <Image source={tagfilter} style={{ width: d2p(11), height: d2p(10), marginRight: d2p(10) }} />
          <Text style={FONT.Medium}>태그 변경</Text>
        </TouchableOpacity>
      </View>
    </>
    , [filterBadge, getMyProfileQuery.data?.representBadge]);

  const reviewFooter = useCallback(() => <View style={{ height: h2p(117) }} />, []);

  const reviewRenderItem = useCallback(({ item, index }) =>
    <Pressable onPress={() =>
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
    </Pressable>, [filterBadge, selectedIndex]);

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

  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        setRefresh(false);
      }
    }, [refresh]));

  useEffect(() => {
    if (route.params?.refresh) {
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [route.params]);

  useEffect(() => {
    if (!userBadge.household.every(v => !v.isClick) ||
      !userBadge.interest.every(v => !v.isClick) ||
      !userBadge.taste.every(v => !v.isClick)) {
      setAllClick(false);
    }
  }, [userBadge]);

  if (reviewListQuery.isLoading || refresh) {
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
              <TouchableOpacity
                onPress={() => tagRefRBSheet.current?.open()}
                style={[styles.filter, { marginRight: 0, marginBottom: 0 }]}>
                <Image source={tagfilter} style={{ width: d2p(11), height: d2p(10), marginRight: d2p(10) }} />
                <Text style={FONT.Medium}>태그 변경</Text>
              </TouchableOpacity> : <View />}
          </Animated.View>
        }
        headerLeft={scrollOffset >= h2p(130) ?
          <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: 10 }}>
            {allClick ?
              <Text style={[{ fontSize: 16 }, FONT.Bold]}>
                모든 메뉴
              </Text>
              :
              <Text style={[{ fontSize: 16 }, FONT.Bold]}>
                {filterBadge ? `#${filterBadge}` : `#${getMyProfileQuery.data?.representBadge}`}
              </Text>
            }
          </Animated.View> : <Image source={mainLogo} resizeMode="contain" style={{ width: d2p(96), height: d2p(20) }} />}
        isBorder={scrollOffset >= h2p(130) ? true : false} bgColor={scrollOffset >= h2p(130) ? theme.color.white : theme.color.grayscale.f7f7fc}
      />
      <View>
        <FlatList
          ref={flatListRef}
          onEndReached={() => {
            if (reviewListQuery.data &&
              reviewListQuery.data.pages.flat().length > 19) {
              reviewListQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.8}
          refreshing={reviewListQuery.isLoading}
          onRefresh={reviewListQuery.refetch}
          data={reviewListQuery.data?.pages.flat()}
          ListHeaderComponent={reviewHeader}
          showsVerticalScrollIndicator={false}
          renderItem={reviewRenderItem}
          ListFooterComponent={reviewFooter}
          style={{ marginTop: 0, marginBottom: h2p(80), backgroundColor: theme.color.grayscale.f7f7fc }}
          keyExtractor={reviewKey}
          onScroll={(event) => {
            const currentScrollOffset = event.nativeEvent.contentOffset.y;
            setScrollOffset(currentScrollOffset);
          }}
        />
      </View>
      <RBSheet
        ref={tagRefRBSheet}
        onOpen={() =>
          setUserBadge({
            interest: userBadge.interest.map(v => {
              if (v.title === filterBadge) {
                return { title: v.title, isClick: true };
              }
              return { title: v.title, isClick: false };
            }),
            household: userBadge.household.map(v => {
              if (v.title === filterBadge) {
                return { title: v.title, isClick: true };
              }
              return { title: v.title, isClick: false };
            }),
            taste: userBadge.taste.map(v => {
              if (v.title === filterBadge) {
                return { title: v.title, isClick: true };
              }
              return { title: v.title, isClick: false };
            })
          })
        }
        closeOnDragDown
        dragFromTopOnly
        animationType="fade"
        height={Dimensions.get("window").height * (481 / 760)}
        openDuration={250}
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
            paddingTop: isIphoneX() ? getStatusBarHeight() + d2p(15) : d2p(15),
          }, draggableIcon: {
            display: "none"
          }
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: h2p(20)
          }}>
          <Text style={[{ color: theme.color.grayscale.C_79737e }, FONT.Medium]}>
            보고싶은 태그를 하나만 선택해주세요
          </Text>
          <TouchableOpacity
            onPress={() => {
              // * 태그 선택 안했을경우
              if (userBadge.household.every(v => !v.isClick) &&
                userBadge.interest.every(v => !v.isClick) &&
                userBadge.taste.every(v => !v.isClick) &&
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
              const copy: { [index: string]: Array<{ isClick: boolean, title: string }> } = { ...userBadge };
              const badge = Object.keys(userBadge).reduce((acc, cur) => {
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
            setUserBadge(initialBadgeData);
          }}
          style={{
            paddingHorizontal: d2p(15),
            paddingVertical: h2p(5),
            maxWidth: d2p(140),
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
        <SelectLayout type="filter" userBadge={userBadge} setUserBadge={setUserBadge} />
        {isPopupOpen.isOpen &&
          <Animated.View style={{ opacity: fadeHook.fadeAnim ? fadeHook.fadeAnim : 1, zIndex: fadeHook.fadeAnim ? fadeHook.fadeAnim : -1 }}>
            <AlertPopup text={isPopupOpen.content} popupStyle={{ bottom: h2p(20) }} />
          </Animated.View>
        }
      </RBSheet>
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
    paddingHorizontal: 20,
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
    borderRadius: 5,
    paddingVertical: h2p(7),
    paddingHorizontal: d2p(17),
    backgroundColor: theme.color.white,
    width: d2p(100),
    marginRight: d2p(20),
    marginBottom: h2p(20)
  },
  tagBtn: {
    color: theme.color.white,
    fontSize: 12
  }
});