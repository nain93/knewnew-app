import { StyleSheet, Text, View, Image, FlatList, Platform, Dimensions, TouchableOpacity, Animated } from 'react-native';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import Header from '~/components/header';
import mainLogo from '~/assets/logo';
import FeedReview from '~/components/review/feedReview';
import { tagfilter } from '~/assets/icons';

import RBSheet from "react-native-raw-bottom-sheet";
import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';
import SelectLayout from '~/components/selectLayout';
import { BadgeType } from '~/types';
import AlertPopup from '~/components/popup/alertPopup';
import ReKnew from '~/components/review/reKnew';
import { useQuery, useQueryClient } from 'react-query';
import { getReviewList } from '~/api/review';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import Loading from '~/components/loading';
import { getMyProfile } from '~/api/user';
import { MyPrfoileType } from '~/types/user';
import { ReviewListType } from '~/types/review';

function StatusBarPlaceHolder({ scrollOffset }: { scrollOffset: number }) {
  return (
    <View style={{
      width: "100%",
      height: getStatusBarHeight(),
      backgroundColor: scrollOffset >= h2p(130) ? theme.color.white : theme.color.grayscale.f7f7fc
    }} />
  );
}

const Feed = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isPopupOpen, setIspopupOpen] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const tagRefRBSheet = useRef<RBSheet>(null);
  const [userBadge, setUserBadge] = useState<BadgeType>({
    interest: [],
    household: [],
    taste: []
  });
  const token = useRecoilValue(tokenState);
  const queryClient = useQueryClient();

  const [filterBadge, setFilterBadge] = useState("");

  // TODO useInfiniteQuery
  const reviewListQuery = useQuery<ReviewListType[], Error>(["reviewList", token, filterBadge], async () => {
    // * 필터한 리뷰리스트
    if (filterBadge) {
      const queryData = await getReviewList({ token, tag: filterBadge });
      return queryData;
    }
    // * 전체 리뷰리스트
    else {
      const queryData = getReviewList({ token });
      return queryData;
    }
  }, {
    enabled: !!token,
  });

  const getMyProfileQuery = useQuery<MyPrfoileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token
  });

  // const filteredMutation = useMutation(["filteredList", token], (badge: string) => getFilteredReview(token, badge));

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

  if (reviewListQuery.isLoading) {
    return <Loading />;
  }

  return (
    <>
      {Platform.OS === "ios" &&
        <StatusBarPlaceHolder scrollOffset={scrollOffset} />}
      <Header
        viewStyle={isIphoneX() ? { marginTop: 0 } : {}}
        customRight={
          <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: 10 }}>
            {scrollOffset >= h2p(130) ?
              <TouchableOpacity
                onPress={() => tagRefRBSheet.current?.open()}
                style={[styles.filter, { marginRight: 0, marginBottom: 0 }]}>
                <Image source={tagfilter} style={{ width: 11, height: 10, marginRight: d2p(10) }} />
                <Text>태그 변경</Text>
              </TouchableOpacity> : <View />}
          </Animated.View>
        }
        headerLeft={scrollOffset >= h2p(130) ?
          <Animated.View style={{ opacity: fadeAnim ? fadeAnim : 1, zIndex: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {filterBadge ? `#${filterBadge}` : `#${getMyProfileQuery.data?.representBadge}`}
            </Text>
          </Animated.View> : <Image source={mainLogo} resizeMode="contain" style={{ width: d2p(96), height: h2p(20) }} />}
        isBorder={scrollOffset >= h2p(130) ? true : false} bgColor={scrollOffset >= h2p(130) ? theme.color.white : theme.color.grayscale.f7f7fc}
      />
      <View style={{ flex: 1, backgroundColor: theme.color.grayscale.f7f7fc }}>
        <FlatList
          refreshing={reviewListQuery.isLoading}
          onRefresh={() => {
            setFilterBadge("");
            queryClient.invalidateQueries("reviewList");
          }}
          data={reviewListQuery.data}
          ListHeaderComponent={() =>
            <Fragment>
              <View style={styles.main}>
                <Text style={styles.mainText}>뉴뉴는 지금</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ ...styles.mainText, color: theme.color.main }}>#비건 </Text>
                  <Text style={styles.mainText}>관련 메뉴 추천 중 👀</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => tagRefRBSheet.current?.open()}
                  style={styles.filter}>
                  <Image source={tagfilter} style={{ width: 11, height: 10, marginRight: d2p(10) }} />
                  <Text>태그 변경</Text>
                </TouchableOpacity>
              </View>
            </Fragment>
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            <FeedReview review={item} />
            // <ReKnew review={item} />
          }
          style={{ marginTop: 0, marginBottom: h2p(80) }}
          keyExtractor={(review) => String(review.id)}
          onScroll={(event) => {
            const currentScrollOffset = event.nativeEvent.contentOffset.y;
            setScrollOffset(currentScrollOffset);
          }}
        />
      </View>
      <RBSheet
        ref={tagRefRBSheet}
        closeOnDragDown
        dragFromTopOnly
        animationType="fade"
        height={Dimensions.get("window").height * ((Platform.OS === "ios" ? 461 : 481) / 760)}
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
            alignItems: "center", marginBottom: h2p(40)
          }}>
          <Text style={{ color: theme.color.grayscale.C_79737e, fontWeight: "500" }}>
            보고싶은 태그를 하나만 선택해주세요
          </Text>
          <TouchableOpacity
            onPress={() => {
              // * 태그 선택 안했을경우
              if (userBadge.household.every(v => !v.isClick) &&
                userBadge.interest.every(v => !v.isClick) &&
                userBadge.taste.every(v => !v.isClick)
              ) {
                setIspopupOpen(true);
                setTimeout(() => {
                  setIspopupOpen(false);
                }, 1500);
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
              queryClient.invalidateQueries("reviewList");
              tagRefRBSheet.current?.close();
            }}
            style={{
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 5,
              width: d2p(100), height: h2p(30), backgroundColor: theme.color.main
            }}>
            <Text style={{ color: theme.color.white, fontSize: 12, fontWeight: '500' }}>태그 적용</Text>
          </TouchableOpacity>
        </View>
        <SelectLayout type="filter" userBadge={userBadge} setUserBadge={setUserBadge} />
        {isPopupOpen &&
          <AlertPopup text={"태그를 선택해주세요"} popupStyle={{ bottom: h2p(20) }} />
        }
      </RBSheet>
    </>
  );
};

export default Feed;

const styles = StyleSheet.create({
  main: {
    paddingTop: h2p(35),
    paddingBottom: h2p(18),
    paddingHorizontal: 20,
    width: '100%',
  },
  mainText: {
    fontSize: 20, fontWeight: 'bold'
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
  }
});