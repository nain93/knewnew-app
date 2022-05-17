import { View, Text, Dimensions, StyleSheet, Pressable, Image, ScrollView, TextInput } from 'react-native';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import ReviewIcon from '~/components/icon/reviewIcon';
import MoreIcon from '~/components/icon/moreIcon';
import Badge from '~/components/badge';
import ReactionIcon from '~/components/icon/reactionIcon';
import { tag } from '~/assets/icons';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { getReviewDetail, likeReview } from '~/api/review';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ReviewListType } from '~/types/review';
import Loading from '~/components/loading';

interface reviewProps {
  id: number;
  badge: string;
  title: string;
  review: 'heart' | 'circle' | 'bad';
  household: '자취생' | '애기가족' | '가족한끼' | '신혼부부';
  content: string;
  date: string;
  store: string;
  writer: string;
  tag: Array<string>;
  photo?: string;
}

const reviewContent = {
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
  tag: ['간편식', '한끼식사'],
  photo: 'ss',
};
interface FeedDetailProps {
  navigation: NavigationStackProp
  route: NavigationRoute<{
    id: number
  }>;
}

const FeedDetail = ({ route, navigation }: FeedDetailProps) => {
  const [review, setReview] = useState<reviewProps>();
  const [like, setLike] = useState<boolean>(false);
  const [cart, setCart] = useState<boolean>(false);
  const commentRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();

  const token = useRecoilValue(tokenState);

  const reviewDetailQuery = useQuery<ReviewListType, Error>(["reviewDetail", token], async () => {
    if (route.params) {
      const detail = await getReviewDetail(token, route.params.id);
      return detail;
    }
  }, {
    enabled: !!token,
    // onSuccess:(data)=>setLike(data.isLike)
  });

  const likeReviewMutation = useMutation('likeReview', ({ id, state }: { id: number, state: boolean }) => likeReview(token, id, state));

  useEffect(() => {
    queryClient.invalidateQueries("reviewDetail");
  }, [likeReviewMutation.data,]);

  if (reviewDetailQuery.isLoading) {
    return <Loading />;
  }

  return (
    <Fragment>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} imageStyle={{ width: 11, height: 25 }} />}
        title="리뷰 상세"
      />
      {/* <FeedReview review={review} /> */}
      <KeyboardAwareScrollView style={styles.review}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: d2p(20) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: 'black', width: 40, height: 40, borderRadius: 20, marginRight: 5, position: 'absolute', left: 0 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: d2p(50), flexWrap: 'wrap', maxWidth: Dimensions.get('window').width - d2p(120) }}>
              <Text style={styles.writer}>{reviewDetailQuery.data?.author.nickname}</Text>
              <Badge type="feed" text={reviewDetailQuery.data?.author.representBadge} />
            </View>
            <MoreIcon onPress={() => console.log('공유/신고')} viewStyle={{ position: 'relative', top: 10 }} />
          </View>

          <Pressable onPress={() => console.log('피드 상세')}>
            <View style={{ marginTop: h2p(5), marginLeft: d2p(50), }}>
              <Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4 }}>
                {(reviewDetailQuery.data) && simpleDate(reviewDetailQuery.data?.created)} 전</Text>
            </View>
            <View style={{ paddingTop: h2p(20) }}>
              <ReviewIcon review={reviewDetailQuery.data?.satisfaction} />
              <Text style={{ color: theme.color.black, marginBottom: 10, paddingTop: h2p(15) }}>{reviewDetailQuery.data?.content}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={tag} style={{ width: 10, height: 10, marginRight: 5 }} />
              <Text style={{ fontSize: 12, color: theme.color.grayscale.C_79737e }}>{React.Children.toArray(reviewDetailQuery.data?.tags?.map((v) => <Text>#{v} </Text>))}
                <Text style={{ color: theme.color.main }}>#비건</Text>
              </Text>
            </View>
          </Pressable>

          <View style={styles.sign}>
            <Text style={styles.store}>{reviewDetailQuery.data?.market}</Text>
          </View>
          {review?.photo && <View style={{
            backgroundColor: 'black', width: Dimensions.get('window').width - d2p(40),
            height: Dimensions.get("window").height * (180 / 760), borderRadius: 18, marginRight: 5
          }} />}
          <View style={styles.reactionContainer}>
            <ReactionIcon name="cart" state={cart} setState={(isState: boolean) => setCart(isState)} />
            <View style={{ borderLeftWidth: 1, borderLeftColor: theme.color.grayscale.eae7ec, height: h2p(26) }} />
            <ReactionIcon name="like" count={reviewDetailQuery.data?.likeCount} state={like}
              isLike={(isState: boolean) => { setLike(isState); }} mutation={likeReviewMutation} id={route.params?.id} />
          </View>
          <Text style={{ marginTop: 20, fontSize: 12, color: theme.color.grayscale.C_79737e, fontWeight: 'bold', paddingBottom: h2p(20) }}>작성된 댓글 2개</Text>
          <View>
            <View style={{ backgroundColor: 'black', width: 30, height: 30, borderRadius: 15, marginRight: 5, position: 'absolute', left: 0 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: d2p(38), position: 'relative', top: 6, }}>
              <Text style={{ fontWeight: '500' }}>어쩌구참깨</Text>
              <Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4, marginLeft: 10 }}>2022.04.26 10:56</Text>
            </View>
            <Text style={{ color: theme.color.grayscale.C_443e49, paddingLeft: d2p(38), marginTop: h2p(10) }}>저도 이거 좋아해요!! 근데 염지가 많이 됐는지 저한테는 살짝 짜더라구요</Text>
            <View style={styles.commentLine} />
          </View>
          <View>
            <View style={{ backgroundColor: 'black', width: 30, height: 30, borderRadius: 15, marginRight: 5, position: 'absolute', left: 0 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: d2p(38), position: 'relative', top: 6, }}>
              <Text style={{ fontWeight: '500' }}>어쩌구참깨</Text>
              <Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4, marginLeft: 10 }}>2022.04.26 10:56</Text>
            </View>
            <Text style={{ color: theme.color.grayscale.C_443e49, paddingLeft: d2p(38), marginTop: h2p(10) }}>저도 이거 좋아해요!! 근데 염지가 많이 됐는지 저한테는 살짝 짜더라구요</Text>
            <View style={styles.commentLine} />
          </View>
        </View>


        <View style={{
          borderTopColor: theme.color.grayscale.eae7ec, borderTopWidth: 1,
          left: 0,
          position: 'absolute', bottom: 0, width: Dimensions.get("window").width, backgroundColor: theme.color.white, paddingVertical: h2p(14), paddingHorizontal: d2p(20)
        }}>
          <TextInput style={{
          }}
            placeholder="댓글을 남겨보세요" placeholderTextColor={theme.color.grayscale.d3d0d5} />
          <Pressable style={{ position: 'absolute', right: 20, top: 14 }}>
            <Text style={{ color: theme.color.grayscale.a09ca4 }}>작성</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Fragment>
  );
};

export default FeedDetail;

const styles = StyleSheet.create({
  review: {
    position: "relative",
    marginTop: h2p(20),
    paddingBottom: isIphoneX() ? getBottomSpace() : 0
  },
  writer: {
    fontSize: 16, fontWeight: 'bold',
    marginRight: 5
  },
  sign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: h2p(10), marginBottom: h2p(14.5),
  },
  store: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
    marginRight: d2p(10)
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-evenly',
    paddingTop: 20, paddingBottom: h2p(10.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.color.grayscale.eae7ec
  },
  commentLine: {
    borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc,
    width: Dimensions.get('window').width - d2p(40),
    marginTop: h2p(14), marginBottom: h2p(10)
  }
});