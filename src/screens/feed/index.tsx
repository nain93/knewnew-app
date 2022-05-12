import { StyleSheet, Text, View, Image, FlatList } from 'react-native';
import React, { Fragment, useEffect, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import Header from '~/components/header';
import mainLogo from '~/assets/logo';
import FeedReview from '~/components/review/feedReview';
import { tagfilter } from '~/assets/icons';

const Feed = () => {
  const [scrollOffset, setScrollOffset] = useState(0);

  return (
    <>
      <Header
        headerLeft={<Image source={mainLogo} resizeMode="contain" style={{ width: d2p(96), height: h2p(20) }} />}
        isBorder={false} bgColor={theme.color.grayscale.f7f7fc}
      />
      <View style={{ flex: 1, backgroundColor: theme.color.grayscale.f7f7fc }}>
        {scrollOffset <= 0 &&
          <Fragment>
            {/* eslint-disable-next-line react-native/no-raw-text */}
            <View style={styles.main}><Text style={{ fontSize: 20, fontWeight: 'bold' }}>뉴뉴는 지금{"\n"}
              {/* eslint-disable-next-line react-native/no-raw-text */}
              <Text style={{ color: theme.color.main }}>#비건</Text> 관련 메뉴 추천 중 👀</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <View style={styles.filter}><Image source={tagfilter} style={{ width: 11, height: 10, marginRight: 10 }} /><Text>태그 변경</Text></View></View>
          </Fragment>}
        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          renderItem={(review) => <FeedReview review={review} />}
          style={{ marginTop: 0, paddingBottom: h2p(31) }}
          keyExtractor={(review) => String(review.id)}
          onScroll={(event) => {
            const currentScrollOffset = event.nativeEvent.contentOffset.y;
            console.log(currentScrollOffset);
            setScrollOffset(currentScrollOffset);
          }}
        />
      </View>
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
  writer: '열려라참깨'
}, {
  id: 1,
  badge: '비건',
  title: '하림조각닭',
  review: 'triangle',
  household: '애기가족',
  content: `오설록 초콜릿 쿠키도 맛있어요! 공부할때 하나씩 꺼내먹기 좋아용
가격은 좀 ㅎㄷㄷ하지만 … 오설록이라서 찐해서 좋아욤`,
  date: '2022.04.26',
  store: '마켓컬리',
  writer: '룰루랄라'
}, {
  id: 2,
  badge: '다이어터',
  title: '쓱 양배추 웩',
  review: 'close',
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
  review: 'triangle',
  household: '가족한끼',
  content: `유통사, 상품명 둘 다 입력안했을 경우에는 추천표식도 없습니다 (뉴뉴 심볼과 같이 그냥 글만 노출)`,
  date: '2022.04.26',
  writer: '일반글고객'
}, {
  id: 4,
  badge: '다이어터',
  title: '하림조각닭',
  review: 'heart',
  household: '신혼부부',
  content: `이거 사서 먹었는데 진짜 맛있네요 치킨 배달시켜먹었던 지난날이 후회될정도로 맛있고 양많고 싸고 간편해요. 생닭이라 좀 쫄았는데 냉동고에서 꺼내서 에프만 돌리면 완성이라서 저같은 자취생한테 딱…`,
  photo: 'ss',
  date: '2022.04.26',
  writer: '꿈빛파티시엘'
},];

export default Feed;

const styles = StyleSheet.create({
  main: {
    fontSize: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: h2p(35),
    paddingBottom: h2p(18),
    paddingHorizontal: 20,
    width: '100%',
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