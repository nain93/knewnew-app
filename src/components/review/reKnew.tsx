import { View, Text, Pressable, StyleSheet, Dimensions, Image } from 'react-native';
import React from 'react';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import Badge from '../badge';
import ReviewIcon from '../icon/reviewIcon';
import { retweetfrom, tag } from '~/assets/icons';
import { FONT } from '~/styles/fonts';

interface FeedReviewProps {
  review: any
}

const ReKnew = ({ review }: FeedReviewProps) => {

  return (
    <View style={styles.review}>
      <View style={{ flexDirection: 'row' }}>
        <Image source={retweetfrom} style={{ width: 15, height: 40, position: 'absolute', left: -75 }} />
        <View style={{ backgroundColor: 'black', width: 40, height: 40, borderRadius: 20, marginRight: 5, position: 'absolute', left: -50 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.title, FONT.Medium]}>{review.writer}</Text>
          <Badge type="feed" text={review.badge} />
          <Text style={[styles.household, FONT.Regular]}>{review.household}</Text>
        </View>
      </View>
      <View style={{ marginVertical: h2p(12), }}>
        <ReviewIcon review={review.review} />
      </View>
      <Text style={[{ color: theme.color.black }, FONT.Regular]}>{review.content}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Image source={tag} style={{ width: 10, height: 10, marginRight: 5 }} />
        <Text style={[{ fontSize: 12, color: theme.color.grayscale.C_79737e },FONT.Regular]}>
          {React.Children.toArray(review?.tag?.map((v) => <Text>#{v} </Text>))}
          <Text style={{ color: theme.color.main }}>#비건</Text></Text>
      </View>
    </View>
  );
};

export default ReKnew;

const styles = StyleSheet.create({
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    marginHorizontal: d2p(10), marginTop: h2p(20),
    borderRadius: 10,
    paddingRight: d2p(10), paddingLeft: d2p(85), paddingVertical: d2p(15)
  },
  title: {
    fontSize: 16, fontWeight: 'bold',
    marginRight: 5
  },
  household: {
    fontSize: 12,
    marginLeft: 5,
    color: theme.color.grayscale.a09ca4
  }
});

