import { View, Text, Dimensions, StyleSheet, Pressable, Image, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Keyboard } from 'react-native';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import ReviewIcon from '~/components/icon/reviewIcon';
import Badge from '~/components/badge';
import ReactionIcon from '~/components/icon/reactionIcon';
import { more, tag } from '~/assets/icons';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import { useMutation, useQuery } from 'react-query';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { getReviewDetail, likeReview } from '~/api/review';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ReviewListType } from '~/types/review';
import Loading from '~/components/loading';
import { FONT } from '~/styles/fonts';

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

interface FeedDetailProps {
  navigation: NavigationStackProp
  route: NavigationRoute<{
    id: number,
    badge: string,
    isLike: boolean
  }>;
}

const FeedDetail = ({ route, navigation }: FeedDetailProps) => {
  const [like, setLike] = useState<boolean>(route.params?.isLike || false);
  const [cart, setCart] = useState<boolean>(false);

  const [inputHeight, setInputHeight] = useState(0);
  const token = useRecoilValue(tokenState);
  const inputRef = useRef<TextInput>(null);

  const [isMoreClick, setIsMoreClick] = useState<boolean>();
  const myId = useRecoilValue(myIdState);

  const reviewDetailQuery = useQuery<ReviewListType, Error>(["reviewDetail", token], async () => {
    if (route.params) {
      const detail = await getReviewDetail(token, route.params.id);
      return detail;
    }
  }, {
    enabled: !!token,
  });

  const likeReviewMutation = useMutation('likeReview', ({ id, state }: { id: number, state: boolean }) => likeReview(token, id, state));

  // * 키보드 높이 컨트롤
  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", (e) => {
      setInputHeight(0);
    });
    Keyboard.addListener("keyboardWillHide", (e) => {
      setInputHeight(getBottomSpace());
    });
  }, []);



  if (reviewDetailQuery.isLoading || reviewDetailQuery.isFetching) {
    return <Loading />;
  }

  return (
    <Fragment>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => {
          navigation.goBack();
        }} imageStyle={{ width: 11, height: 25 }} />}
        title="리뷰 상세"
      />
      {/* <FeedReview review={review} /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: h2p(30) }}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: d2p(20), paddingTop: h2p(20), flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {isMoreClick &&
              (myId === reviewDetailQuery.data?.author.id ?
                <View style={styles.clickBox}>
                  <Pressable>
                    <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>수정</Text>
                  </Pressable>
                  <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
                  <Pressable>
                    <Text style={[{ color: theme.color.main }, FONT.Regular]}>삭제</Text>
                  </Pressable>
                </View>
                :
                <View style={styles.clickBox}>
                  <Pressable>
                    <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>공유</Text>
                  </Pressable>
                  <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
                  <Pressable>
                    <Text style={[{ color: theme.color.main }, FONT.Regular]}>신고</Text>
                  </Pressable>
                </View>
              )}
            <View style={{ backgroundColor: 'black', width: d2p(40), height: d2p(40), borderRadius: 40 }} />
            <View style={{
              width: Dimensions.get('window').width - d2p(105),
              paddingLeft: d2p(10)
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                <Text style={[styles.writer, FONT.Medium]}>{reviewDetailQuery.data?.author.nickname}</Text>
                {reviewDetailQuery.data?.author.representBadge &&
                  <Badge type="feed" text={reviewDetailQuery.data?.author.representBadge} />}
                <Text style={{ fontSize: 12, marginLeft: d2p(5), color: theme.color.grayscale.a09ca4 }}>{reviewDetailQuery.data?.author.household}</Text>
              </View>
              <View style={{ marginTop: h2p(5) }}>
                <Text style={[{ fontSize: 12, color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>
                  {(reviewDetailQuery.data) && simpleDate(reviewDetailQuery.data?.created, ' 전')}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => setIsMoreClick(!isMoreClick)}>
              <Image
                source={more}
                resizeMode="contain"
                style={{ width: 26, height: 16 }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ paddingTop: h2p(20) }}>
            {reviewDetailQuery.data &&
              <ReviewIcon review={reviewDetailQuery.data?.satisfaction} />}
            <Text style={[styles.content, FONT.Regular]}>{reviewDetailQuery.data?.content}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={tag} style={{ width: 10, height: 10, marginRight: 5 }} />
            <Text style={[{ fontSize: 12, color: theme.color.grayscale.C_79737e }, FONT.Regular]}>
              {React.Children.toArray(reviewDetailQuery.data?.tags.map((v) => {
                if (v === route.params?.badge) {
                  return;
                }
                return <Text>#{v} </Text>;
              }))}
              <Text style={{ color: theme.color.main, fontSize: 12 }}>#{route.params?.badge}</Text>
            </Text>
          </View>

          <View style={styles.sign}>
            <Text style={[styles.store, FONT.Regular]}>{reviewDetailQuery.data?.market}</Text>
          </View>

          {/* TODO 이미지 있을떄 넣기 */}
          <View style={{
            backgroundColor: 'black', width: Dimensions.get('window').width - d2p(40),
            height: Dimensions.get("window").height * (180 / 760), borderRadius: 18, marginRight: 5
          }} />

          <View style={styles.reactionContainer}>
            <ReactionIcon name="cart" state={cart} isState={(isState: boolean) => setCart(isState)} />
            <View style={{ borderLeftWidth: 1, borderLeftColor: theme.color.grayscale.eae7ec, height: h2p(26) }} />
            <ReactionIcon name="like" count={reviewDetailQuery.data?.likeCount} state={like}
              isState={(isState: boolean) => { setLike(isState); }} mutation={likeReviewMutation} id={route.params?.id} />
          </View>
          <Text style={[styles.commentMeta, FONT.Bold]}>작성된 댓글 2개</Text>
          <View>
            <View style={styles.commentImg} />
            <View style={styles.commentContainer}>
              <Text style={[{ fontWeight: '500' }, FONT.Medium]}>어쩌구참깨</Text>
              <Text style={[styles.commentDate, FONT.Regular]}>2022.04.26 10:56</Text>
            </View>
            <Text style={[styles.commentContent, FONT.Regular]}>저도 이거 좋아해요!! 근데 염지가 많이 됐는지 저한테는 살짝 짜더라구요</Text>
            <View style={styles.commentLine} />
          </View>
          <View>
            <View style={styles.commentImg} />
            <View style={styles.commentContainer}>
              <Text style={[{ fontWeight: '500' }, FONT.Medium]}>어쩌구참깨</Text>
              <Text style={[styles.commentDate, FONT.Regular]}>2022.04.26 10:56</Text>
            </View>
            <Text style={[styles.commentContent, FONT.Regular]}>저도 이거 좋아해요!! 근데 염지가 많이 됐는지 저한테는 살짝 짜더라구요</Text>
            <View style={styles.commentLine} />
          </View>
        </ScrollView>
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{
            borderTopColor: theme.color.grayscale.eae7ec,
            borderTopWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: Dimensions.get("window").width,
            marginBottom: inputHeight,
            backgroundColor: theme.color.white, paddingVertical: h2p(14), paddingHorizontal: d2p(20)
          }}>
          <TextInput
            ref={inputRef}
            multiline
            style={[{
              color: theme.color.black,
              includeFontPadding: false,
              paddingTop: 0,
              paddingBottom: 0,
              width: Dimensions.get("window").width - d2p(84),
            }, FONT.Regular]}
            placeholder="댓글을 남겨보세요." placeholderTextColor={theme.color.grayscale.d3d0d5} />
          <Pressable style={() => console.log("작성")}>
            <Text style={[{ color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>작성</Text>
          </Pressable>
        </Pressable>

      </KeyboardAvoidingView>
    </Fragment >
  );
};

export default FeedDetail;

const styles = StyleSheet.create({
  writer: {
    fontSize: 16, fontWeight: 'bold',
    marginRight: d2p(10)
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
  content: {
    color: theme.color.black,
    marginBottom: 10, paddingTop: h2p(15)
  },
  commentLine: {
    borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc,
    width: Dimensions.get('window').width - d2p(40),
    marginTop: h2p(14), marginBottom: h2p(10)
  },
  commentMeta: {
    marginTop: 20,
    paddingBottom: h2p(20),
    fontSize: 12, fontWeight: 'bold',
    color: theme.color.grayscale.C_79737e,
  },
  commentImg: {
    backgroundColor: 'black',
    width: 30, height: 30,
    position: 'absolute', left: 0,
    borderRadius: 15,
    marginRight: 5,
  },
  commentContainer: {
    flexDirection: 'row', alignItems: 'center',
    position: 'relative', top: 6,
    marginLeft: d2p(38),
  },
  commentDate: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
    marginLeft: 10
  },
  commentContent: {
    color: theme.color.grayscale.C_443e49,
    paddingLeft: d2p(38), marginTop: h2p(10)
  },
  clickBox: {
    display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
    width: 70, height: 70, borderRadius: 5,
    position: 'absolute', right: d2p(30), top: 0,
    shadowColor: '#000000',
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: (Platform.OS === 'android') ? 3 : 0,
    backgroundColor: theme.color.white,
    zIndex: 999,
  },
});