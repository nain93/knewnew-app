import { View, Text, Pressable, StyleSheet, Dimensions, Image } from 'react-native';
import React, { useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import Badge from '../badge';
import MoreIcon from '~/components/icon/moreIcon';
import ReviewIcon from '../icon/reviewIcon';
import ReactionIcon from '../icon/reactionIcon';
import { tag } from '~/assets/icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';

interface FeedReviewProps {
  review: any,
  isRetweet?: boolean
}

const FeedReview = ({ review, isRetweet = false }: FeedReviewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [like, setLike] = useState<boolean>(false);
  const [cart, setCart] = useState<boolean>(false);

  return (
    <View style={styles.review}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ backgroundColor: 'black', width: 40, height: 40, borderRadius: 20, marginRight: 5, position: 'absolute', left: -50 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', maxWidth: Dimensions.get('window').width - d2p(120) }}>
          <Text style={styles.title}>{review.author.nickname}</Text>
          <Badge type="feed" text={review.author.representBadge} />
          <Text style={{ fontSize: 12, marginLeft: 5, color: theme.color.grayscale.a09ca4 }}>{review.household}</Text>
        </View>
        <MoreIcon onPress={() => console.log('공유/신고')} />
      </View>
      <Pressable onPress={() => console.log('피드 상세')}>
        <View style={styles.titleContainer}>
          <ReviewIcon review={review.satisfaction} />
          <Text style={{ fontSize: 10, color: theme.color.grayscale.a09ca4 }}>{simpleDate(review.created)} 전</Text>
        </View>
        <Pressable onPress={() => navigation.navigate("FeedDetail", { id: review.id })}>
          <Text style={{ color: theme.color.black, marginBottom: 10 }}>{review.content}</Text>
        </Pressable>
        {!isRetweet &&
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={tag} style={{ width: 10, height: 10, marginRight: 5 }} />
            <Text style={{ fontSize: 12, color: theme.color.grayscale.C_79737e }}>
              {React.Children.toArray(review?.tags?.map((v) => <Text>#{v} </Text>))}
              <Text style={{ color: theme.color.main }}>#비건</Text>
            </Text>
          </View>}
      </Pressable>
      {!isRetweet &&
        <View style={styles.sign}>
          <Text style={styles.store}>{review.market}</Text>
        </View>}
      {review.photo && <View style={{ backgroundColor: 'black', width: d2p(270), height: h2p(180), borderRadius: 18, marginRight: 5 }} />}
      <View style={styles.reactionContainer}>
        <ReactionIcon name="cart" state={cart} setState={(isState: boolean) => setCart(isState)} />
        <ReactionIcon name="comment" count={review.commentCount} />
        <ReactionIcon name="like" count={review.likeCount} state={like} setState={(isState: boolean) => setLike(isState)} />
        <ReactionIcon name="retweet" />
      </View>
    </View>
  );
};

export default FeedReview;

const styles = StyleSheet.create({
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    marginHorizontal: d2p(10), marginTop: h2p(20),
    borderRadius: 10,
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
    marginRight: 5
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
  }
});