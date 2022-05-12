import { View, Text, Pressable, StyleSheet, Dimensions, Image } from 'react-native';
import React, { Fragment, useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import Badge from '../badge';
import MoreIcon from '~/components/icon/moreIcon';
import ReviewIcon from '../icon/reviewIcon';
import ReactionIcon from '../icon/reactionIcon';
import { retweetfrom, tag } from '~/assets/icons';

interface FeedReviewProps {
  review: any,
  isRetweet: boolean
}

const FeedReview = ({ review, isRetweet }: FeedReviewProps) => {
  const [like, setLike] = useState<boolean>(false);
  const [cart, setCart] = useState<boolean>(false);
  const [save, setSave] = useState<boolean>(false);

  return (
    <View style={styles.review}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ backgroundColor: 'black', width: 40, height: 40, borderRadius: 20, marginRight: 5, position: 'absolute', left: -50 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.title}>{review.item.writer}</Text>
          <Badge type="feed" text={review.item.badge} />
          <Text style={{ fontSize: 12, marginLeft: 5, color: theme.color.grayscale.a09ca4 }}>{review.item.household}</Text>
        </View>
        <MoreIcon onPress={() => console.log('공유/신고')} />
      </View>
      <Pressable onPress={() => console.log('피드 상세')}>
        <View style={styles.titleContainer}>
          <ReviewIcon review={review.item.review} />
          <Text style={{ fontSize: 10, color: theme.color.grayscale.a09ca4 }}>5분 전</Text>
        </View>
        <Text style={{ color: theme.color.black }}>{review.item.content}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Image source={tag} style={{ width: 10, height: 10, marginRight: 5 }} />
          <Text style={{ fontSize: 12, color: theme.color.grayscale.C_79737e }}>#간편식 #한끼식사 <Text style={{ color: theme.color.main }}>#비건</Text></Text>
        </View>
      </Pressable>
      <View style={styles.sign}>
        <Text style={styles.store}>{review.item.store}</Text>
      </View>
      {review.item.photo && <View style={{ backgroundColor: 'black', width: d2p(270), height: h2p(180), borderRadius: 18, marginRight: 5 }} />}
      <View style={styles.reactionContainer}>
        <ReactionIcon name="cart" state={cart} setState={(isState: boolean) => setCart(isState)} />
        <ReactionIcon name="comment" />
        <ReactionIcon name="like" state={like} setState={(isState: boolean) => setLike(isState)} />
        <ReactionIcon name="retweet" />
      </View>
      {isRetweet &&
        <Fragment>
          <View style={{ flexDirection: 'row' }}>
            <Image source={retweetfrom} style={{ width: 15, height: 40, position: 'relative', left: -50 }} />
            <View style={{ backgroundColor: 'black', width: 40, height: 40, borderRadius: 20, marginRight: 5, position: 'relative', left: -40 }} />
          </View>
        </Fragment>}
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