import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Image, TouchableWithoutFeedback, Pressable, FlatList } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import BottomArrowIcon from '~/components/icon/bottomArrowIcon';
import Header from '~/components/header';
import mainLogo from '~/assets/logo';
import FeedReview from '~/components/review/feedReview';

const Feed = () => {
  return (
    <>
      <Header
        headerLeft={<Image source={mainLogo} resizeMode="contain" style={{ width: d2p(96), height: h2p(20) }} />}
      />
      <View style={{ flex: 1, backgroundColor: theme.color.grayscale.f7f7fc }}>
        <View style={styles.filter}><Text>얼리어답터 · 디저트덕후</Text>
          <BottomArrowIcon />
        </View>
        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          renderItem={(review) => <FeedReview review={review} />}
          style={{ marginTop: h2p(40), paddingBottom: h2p(31) }}
          keyExtractor={(review) => String(review.id)} />
        {/* <FeedReview /> */}
      </View>
    </>
  );
};

const data = [{
  id: 0,
  badge: '자취생😶',
  title: '하림조각닭',
  review: 'heart',
  content: `오설록 초콜릿 쿠키도 맛있어요! 공부할때 하나씩 꺼내먹기 좋아용
가격은 좀 ㅎㄷㄷ하지만 … 오설록이라서 찐해서 좋아욤`,
  date: '2022.04.26',
  writer: '꿈빛파티시엘'
}, {
  id: 1,
  badge: '자취생😶',
  title: '하림조각닭',
  review: 'triangle',
  content: `오설록 초콜릿 쿠키도 맛있어요! 공부할때 하나씩 꺼내먹기 좋아용
가격은 좀 ㅎㄷㄷ하지만 … 오설록이라서 찐해서 좋아욤`,
  date: '2022.04.26',
  writer: '유통사선택안한회원'
}, {
  id: 2,
  badge: '자취생😶',
  title: '쓱 양배추 웩',
  review: 'close',
  content: `쓱 양배추 진짜 별로에요;; 맨날 상해서 오는듯
추천 표시는 유통사는 있든 없든 무관하게 상품명 등록해야 노출 (작성페이지에서 상품명-> 추천표식)`,
  date: '2022.04.26',
  writer: '불만고객'
}, {
  id: 3,
  badge: '자취생😶',
  title: '',
  review: '',
  content: `유통사, 상품명 둘 다 입력안했을 경우에는 추천표식도 없습니다 (뉴뉴 심볼과 같이 그냥 글만 노출)`,
  date: '2022.04.26',
  writer: '일반글고객'
}, {
  id: 4,
  badge: '자취생😶',
  title: '하림조각닭',
  review: 'heart',
  content: `이거 사서 먹었는데 진짜 맛있네요 치킨 배달시켜먹었던 지난날이 후회될정도로 맛있고 양많고 싸고 간편해요. 생닭이라 좀 쫄았는데 냉동고에서 꺼내서 에프만 돌리면 완성이라서 저같은 자취생한테 딱…`,
  photo: 'ss',
  date: '2022.04.26',
  writer: '꿈빛파티시엘'
},];

export default Feed;

const styles = StyleSheet.create({
  filter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    paddingVertical: 11,
    paddingHorizontal: 20,
    height: h2p(40),
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: theme.color.grayscale.eae7ec,
    backgroundColor: theme.color.white
  },
});