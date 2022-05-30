import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import Badge from '../badge';
import ReviewIcon from '../icon/reviewIcon';
import { retweetfrom, tag } from '~/assets/icons';
import { FONT } from '~/styles/fonts';
import { ReviewParentType } from '~/types/review';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { useNavigation } from '@react-navigation/native';
import { noProfile } from '~/assets/images';

interface FeedReviewProps {
  review: ReviewParentType,
  filterBadge?: string
}

const ReKnew = ({ review, filterBadge }: FeedReviewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [tags, setTags] = useState<Array<string>>([]);

  useEffect(() => {
    const copy: { [index: string]: Array<string> }
      = { ...review.tags };
    setTags(
      Object.keys(copy).reduce<Array<string>>((acc, cur) => {
        acc = acc.concat(copy[cur]);
        return acc;
      }, [])
    );
  }, []);

  return (
    <View style={styles.review}>
      <View style={{ flexDirection: "row", height: h2p(20) }}>
        <View style={{ flexDirection: "row" }}>
          <Image source={retweetfrom}
            style={{ width: d2p(15), height: d2p(40) }} />
          <TouchableOpacity
            onPress={() => navigation.navigate("UserProfile", { id: review.id })}
            style={{
              position: "absolute",
              left: d2p(25),
              borderRadius: 40,
              borderColor: theme.color.grayscale.e9e7ec,
              borderWidth: 1
            }}>
            <Image source={review.author.profileImage ? { uri: review.author.profileImage } : noProfile}
              style={{
                width: d2p(40), height: d2p(40),
                borderRadius: 40
              }} />
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
          width: Dimensions.get('window').width - d2p(120),
          marginLeft: d2p(50)
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.title, FONT.Medium]}>{review.author.nickname}</Text>
            <Badge type="feed" text={review.author.representBadge} />
            <Text style={[styles.household, FONT.Regular]}>{review.author.household}</Text>
          </View>
        </View>
      </View>

      <View style={{ marginLeft: d2p(75) }}>
        <ReviewIcon viewStyle={{ marginBottom: h2p(10), marginTop: h2p(15) }} review={review.satisfaction} />
        <Text style={[{ color: theme.color.black }, FONT.Regular]}>{review.content}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: h2p(10), flexWrap: "wrap" }}>
          <Image source={tag} style={{ width: d2p(10), height: d2p(10), marginRight: d2p(5) }} />
          <Text style={[{ fontSize: 12, color: theme.color.grayscale.C_79737e }, FONT.Regular]}>
            {React.Children.toArray(tags.map((v) => {
              if (v === filterBadge) {
                return;
              }
              return <Text>#{v} </Text>;
            }))}
            {filterBadge &&
              <Text style={{ color: theme.color.main, fontSize: 12 }}>#{filterBadge}</Text>
            }
          </Text>
        </View>
        <View style={styles.sign}>
          <Text style={[styles.store, FONT.Regular]}>{review.market}</Text>
        </View>
      </View>
    </View>
  );
};

export default ReKnew;

const styles = StyleSheet.create({
  review: {
    width: Dimensions.get('window').width - d2p(40),
    borderRadius: 10,
    paddingTop: d2p(20),
    paddingBottom: d2p(15),
  },
  title: {
    fontSize: 16, fontWeight: 'bold',
    marginHorizontal: d2p(10)
  },
  household: {
    fontSize: 12,
    marginLeft: d2p(5),
    color: theme.color.grayscale.a09ca4
  },
  sign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: h2p(10)
  },
  store: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
    marginRight: d2p(10)
  },
});

