import { StyleSheet, Text, View, Image, FlatList, Platform, Dimensions, TouchableOpacity, ViewStyle, ScrollView, Animated } from 'react-native';
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
import { BadgeType, ReviewListType } from '~/types';
import AlertPopup from '~/components/popup/alertPopup';
import ReKnew from '~/components/review/reKnew';
import { useQuery } from 'react-query';
import { getReviewList } from '~/api/review';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import Loading from '~/components/loading';

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

  const reviewListQuery = useQuery<ReviewListType, Error>(["reviewList", token], () => getReviewList(token), {
    enabled: !!token,
  });

  const [bottomSheetHeight, setBottomSheetHeight] = useState(0);

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
        headerLeft={scrollOffset >= h2p(130) ? <View /> : <Image source={mainLogo} resizeMode="contain" style={{ width: d2p(96), height: h2p(20) }} />}
        isBorder={scrollOffset >= h2p(130) ? true : false} bgColor={scrollOffset >= h2p(130) ? theme.color.white : theme.color.grayscale.f7f7fc}
      />
      <View style={{ flex: 1, backgroundColor: theme.color.grayscale.f7f7fc }}>
        <FlatList
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
        <ScrollView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center", marginBottom: h2p(40)
            }}>
            <Text style={{ color: theme.color.grayscale.C_79737e, fontWeight: "500" }}>
              보고싶은 태그를 선택해주세요
            </Text>
            <TouchableOpacity
              onPress={() => {
                // TODO 태그적용(필터) api
                if (userBadge.household.every(v => !v.isClick) ||
                  userBadge.interest.every(v => !v.isClick)) {
                  setIspopupOpen(true);
                  setTimeout(() => {
                    setIspopupOpen(false);
                  }, 1500);
                  return;
                }
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
          <SelectLayout userBadge={userBadge} setUserBadge={setUserBadge} />
          {isPopupOpen &&
            <AlertPopup text={"관심사(or가족구성)을 선택해주세요"} popupStyle={{ bottom: h2p(20) }} />
          }
        </ScrollView>
      </RBSheet>
    </>
  );
};

const data = [{
  id: 0,
  badge: '다이어터',
  title: '하림조각닭',
  review: 'heart',
  household: '자취생',
  content: `닭가슴살만 먹기 질려서 이거 사봤는데, 고구마 달달하니 맛있어요
직장인 도시락으로도 괜찮고, 전자레인지에만 돌려도 되서 간편하네용
단백질 + 식이섬유 한번에 챙길 수 있음!`,
  date: '2022.04.26',
  store: '마켓컬리',
  writer: '열려라참깨',
  tag: ['간편식', '한끼식사']
}, {
  id: 1,
  badge: '비건',
  title: '하림조각닭',
  review: 'circle',
  household: '애기가족',
  content: `오설록 초콜릿 쿠키도 맛있어요! 공부할때 하나씩 꺼내먹기 좋아용
가격은 좀 ㅎㄷㄷ하지만 … 오설록이라서 찐해서 좋아욤`,
  date: '2022.04.26',
  store: '마켓컬리',
  writer: '룰루랄라',
  tag: ['간편식', '한끼식사', '비건']
}, {
  id: 2,
  badge: '다이어터',
  title: '쓱 양배추 웩',
  review: 'bad',
  household: '신혼부부',
  content: `쓱 양배추 진짜 별로에요;; 맨날 상해서 오는듯
추천 표시는 유통사는 있든 없든 무관하게 상품명 등록해야 노출 (작성페이지에서 상품명-> 추천표식)`,
  date: '2022.04.26',
  store: '쿠팡프레시',
  writer: '불만고객'
}, {
  id: 3,
  badge: '디저트러버',
  title: '',
  review: 'circle',
  household: '가족한끼',
  content: `유통사, 상품명 둘 다 입력안했을 경우에는 추천표식도 없습니다 (뉴뉴 심볼과 같이 그냥 글만 노출)`,
  date: '2022.04.26',
  writer: '일반글고객',
  tag: ['간편식']
}, {
  id: 4,
  badge: '다이어터',
  title: '하림조각닭',
  review: 'heart',
  household: '신혼부부',
  content: `이거 사서 먹었는데 진짜 맛있네요 치킨 배달시켜먹었던 지난날이 후회될정도로 맛있고 양많고 싸고 간편해요. 생닭이라 좀 쫄았는데 냉동고에서 꺼내서 에프만 돌리면 완성이라서 저같은 자취생한테 딱…`,
  photo: 'ss',
  date: '2022.04.26',
  writer: '꿈빛파티시엘',
  tag: ['한끼식사']
},];

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