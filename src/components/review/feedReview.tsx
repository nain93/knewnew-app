import { View, Text, Pressable, StyleSheet, Dimensions, Image, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import React, { useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import Badge from '../badge';
import ReviewIcon from '../icon/reviewIcon';
import ReactionIcon from '../icon/reactionIcon';
import { more, tag } from '~/assets/icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { ReviewListType } from '~/types/review';
import { useMutation } from 'react-query';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import { likeReview } from '~/api/review';
import { FONT } from '~/styles/fonts';

interface FeedReviewProps {
  review: ReviewListType,
  isRetweet?: boolean,
  viewStyle?: ViewStyle,
}

const FeedReview = ({ review, viewStyle, isRetweet = false }: FeedReviewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [like, setLike] = useState<boolean>(review.isLike);
  const [cart, setCart] = useState<boolean>(false);
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);


  const likeReviewFeedMutation = useMutation('likeReviewFeed', ({ id, state }: { id: number, state: boolean }) => likeReview(token, id, state));

  return (
    <Pressable onPress={() => navigation.navigate("FeedDetail", { id: review.id })}
      style={[styles.review, viewStyle]}>
      {review.author.id === myId ?
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
        </View>}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ backgroundColor: 'black', width: d2p(40), height: d2p(40), borderRadius: 40, marginRight: d2p(5), position: 'absolute', left: d2p(-50) }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', width: Dimensions.get('window').width - d2p(120) }}>
          <Text style={[styles.title, FONT.Medium]}>{review.author.nickname}</Text>
          <Badge type="feed" text={review.author.representBadge} />
          <Text style={[{ fontSize: 12, marginLeft: d2p(5), color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>{review.author.household}</Text>
        </View>
        <TouchableOpacity>
          <Image
            source={more}
            resizeMode="contain"
            style={{ width: 26, height: 16 }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <ReviewIcon review={review.satisfaction} />
        <Text style={[{ fontSize: 10, color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>{simpleDate(review.created, ' 전')}</Text>
      </View>
      <Text style={[{ color: theme.color.black, marginBottom: 10 }, FONT.Regular]}>{review.content}</Text>
      {!isRetweet &&
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={tag} style={{ width: 10, height: 10, marginRight: 5 }} />
          <Text style={[{ fontSize: 12, color: theme.color.grayscale.C_79737e }, FONT.Regular]}>
            {React.Children.toArray(review?.tags?.map((v) => <Text>#{v} </Text>))}
          </Text>
        </View>}
      {!isRetweet &&
        <View style={styles.sign}>
          <Text style={[styles.store, FONT.Regular]}>{review.market}</Text>
        </View>}
      {review.images.length > 0 &&
        <Image source={{ uri: review.images[0]?.image }}
          style={{ borderRadius: 10, width: Dimensions.get("window").width - d2p(90), aspectRatio: 3 / 2 }} />
      }
      <View style={styles.reactionContainer}>
        <ReactionIcon name="cart" state={cart} isState={(isState: boolean) => setCart(isState)} />
        <ReactionIcon name="comment" count={review.commentCount} />
        <ReactionIcon name="like" count={review.likeCount} state={like}
          isState={(isState: boolean) => { setLike(isState); }} mutation={likeReviewFeedMutation} id={review.id} />
        <ReactionIcon name="retweet" />
      </View>
    </Pressable>
  );
};

export default FeedReview;

const styles = StyleSheet.create({
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    borderRadius: 10,
    marginHorizontal: d2p(10), marginTop: h2p(20),
    paddingRight: d2p(10), paddingLeft: d2p(60), paddingTop: d2p(15)
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    marginVertical: h2p(12),
  },
  title: {
    fontSize: 16, fontWeight: 'bold',
    marginRight: d2p(10)
  },
  sign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: h2p(10), marginBottom: h2p(14.5),
    bordeWidth: 1,
    borderStyle: 'dotted',
    borderColor: theme.color.grayscale.e9e7ec
  },
  store: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
    marginRight: d2p(10)
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around',
    marginTop: 9.5, marginBottom: 15
  },
  dottedLine: {
    borderWidth: 1,
    borderColor: theme.color.grayscale.e9e7ec,
    borderStyle: 'dotted',
  },
  clickBox: {
    display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
    width: 70, height: 70, borderRadius: 5,
    position: 'absolute', right: d2p(36), top: 5,
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