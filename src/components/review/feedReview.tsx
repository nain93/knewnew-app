import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import React, { useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import Badge from '../badge';
import MoreIcon from '~/components/icon/moreIcon';
import ReviewIcon from '../icon/reviewIcon';
import ReactionIcon from '../icon/reactionIcon';

interface FeedReviewProps {
  review: any
}

const FeedReview = ({ review }: FeedReviewProps) => {
  const [like, setLike] = useState<boolean>(false);
  const [dislike, setDisLike] = useState<boolean>(false);
  const [save, setSave] = useState<boolean>(false);

  return (
    <View style={styles.review}>
      <View style={{ flexDirection: 'row' }}>
        <Badge type="feed" text={review.item.badge} />
        <MoreIcon onPress={() => console.log('공유/신고')} />
      </View>
      <Pressable onPress={() => console.log('피드 상세')}>
        {review.item.title !== '' ?
          <><View style={styles.titleContainer}>
            <View style={{ backgroundColor: 'black', width: 24, height: 24, borderRadius: 12, marginRight: 5 }} />
            <Text style={styles.title}>{review.item.title}</Text>
            <ReviewIcon review={review.item.review} />
          </View>
            <Text style={{ paddingLeft: d2p(29) }}>{review.item.content}</Text>
            {review.item.photo ? <View style={{ backgroundColor: 'black', width: 60, height: 60, borderRadius: 10, marginTop: 10, marginLeft: d2p(29) }} /> : null}
          </> :
          <View style={{ marginTop: h2p(15) }}>
            <View style={{ backgroundColor: 'black', width: 24, height: 24, borderRadius: 12, marginRight: 5, position: 'absolute' }} />
            <Text style={{ paddingLeft: d2p(29) }}>{review.item.content}</Text>
          </View>
        }
      </Pressable>
      <View style={styles.sign}>
        <Text style={styles.date}>{review.item.date}</Text>
        <Text style={{ color: theme.color.grayscale.C_79737e }}>{review.item.writer}</Text>
      </View>
      <View style={styles.dottedLine} />
      <View style={styles.reactionContainer}>
        <ReactionIcon name="like" state={like} setState={(isState: boolean) => setLike(isState)} />
        <ReactionIcon name="dislike" state={dislike} setState={(isState: boolean) => setDisLike(isState)} />
        <ReactionIcon name="retweet" />
        <ReactionIcon name="comment" />
        <ReactionIcon name="save" state={save} setState={(isState: boolean) => setSave(isState)} />
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
    paddingHorizontal: d2p(15), paddingTop: d2p(15)
  },
  titleContainer: {
    flexDirection: 'row',
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
    marginTop: h2p(20), marginBottom: h2p(14.5),
    bordeWidth: 1,
    borderStyle: 'dotted',
    borderColor: theme.color.grayscale.e9e7ec
  },
  date: {
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