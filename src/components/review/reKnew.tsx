import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import ReviewIcon from '../icon/reviewIcon';
import { more, retweetfrom, tag } from '~/assets/icons';
import { FONT } from '~/styles/fonts';
import { ReviewParentType } from '~/types/review';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { useNavigation } from '@react-navigation/native';
import { noProfile } from '~/assets/images';

interface FeedReviewProps {
  review: ReviewParentType,
  filterBadge?: string
  type?: "detail"
}

const ReKnew = ({ review, filterBadge, type }: FeedReviewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [tags, setTags] = useState<Array<string>>([]);

  useEffect(() => {
    // const copy: { [index: string]: Array<string> }
    //   = { ...review.tags };
    // setTags(
    //   Object.keys(copy).reduce<Array<string>>((acc, cur) => {
    //     acc = acc.concat(copy[cur]);
    //     return acc;
    //   }, [])
    // );
    if (review.tags.interest) {
      setTags(review.tags.interest);
    }
  }, []);

  if (!review.isActive) {
    return (
      <View style={[styles.review, { paddingBottom: 0 }]}>
        <View style={{ flexDirection: "row" }}>
          <Image source={retweetfrom}
            style={{ width: d2p(15), height: d2p(40) }} />
          <View style={{
            marginLeft: d2p(10),
            width: Dimensions.get("window").width - d2p(65),
            paddingVertical: h2p(5),
            justifyContent: "center",
            backgroundColor: theme.color.grayscale.f7f7fc,
            borderRadius: 5
          }}>
            <Text style={[FONT.Regular, { marginLeft: d2p(25), color: theme.color.grayscale.C_79737e }]}>
              원문 글이 삭제되었습니다.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.review}>
      <View style={{ flexDirection: "row", height: h2p(20) }}>
        <View style={{ flexDirection: "row" }}>
          <Image source={retweetfrom}
            style={{ width: d2p(15), height: d2p(40) }} />
          <TouchableOpacity
            onPress={() => navigation.navigate("Mypage", { id: review.author.id })}
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
          </View>
          {type === "detail" &&
            <Text style={[FONT.Regular, { position: "absolute", top: h2p(25), left: d2p(10), fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
              {simpleDate(review.created, "전")}</Text>
          }
        </View>
      </View>

      <View style={{ marginLeft: type === "detail" ? d2p(25) : d2p(75) }}>
        <ReviewIcon viewStyle={{ marginBottom: h2p(10), marginTop: type === "detail" ? h2p(35) : h2p(15) }} review={review.satisfaction} />
        <Text style={[{ lineHeight: 21, color: theme.color.black }, FONT.Regular]}>{review.content}</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          width: Dimensions.get("window").width - d2p(90),
          marginTop: h2p(10), flexWrap: "wrap"
        }}>
          <Image source={tag} style={{ width: d2p(10), height: d2p(10), marginRight: d2p(5) }} />

          {React.Children.toArray(tags.map((v) => {
            if (v === filterBadge) {
              return;
            }
            return <Text style={[{ fontSize: 12, color: theme.color.grayscale.C_79737e }, FONT.Regular]}>#{v} </Text>;
          }))}
          {
            filterBadge ?
              <Text style={[FONT.Regular, { color: theme.color.main, fontSize: 12 }]}>#{filterBadge}</Text>
              :
              null
          }
        </View>
        {review.market &&
          <View style={styles.sign}>
            <Text style={[styles.store, FONT.Regular]}>{review.market}</Text>
          </View>
        }
        {
          (() => {
            switch (review.images.length) {
              // * 사진 없음
              case 0: {
                return null;
              }
              // * 사진 1개
              case 1: {
                return (
                  <Image source={{ uri: review.images[0]?.image }}
                    style={[styles.imageWrap, {
                      width:
                        Dimensions.get("window").width - d2p(120),
                      aspectRatio: 3 / 2
                    }]} />
                );
              }
              // * 사진 2개
              case 2: {
                return (
                  <View style={[styles.imageWrap, { borderWidth: 0, flexDirection: "row" }]}>
                    {React.Children.toArray(review.images.map((v, i) => (
                      <Image source={{ uri: v.image }} style={{
                        marginRight: i === 0 ? d2p(10) : 0,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: theme.color.grayscale.d3d0d5,
                        width:
                          type === "detail" ?
                            Dimensions.get("window").width - d2p(220)
                            :
                            Dimensions.get("window").width - d2p(245),
                        aspectRatio: 3 / 2,
                      }} />
                    )))}
                  </View>
                );
              }
              // * 사진 3개이상
              default:
                return (
                  <View style={[styles.imageWrap, { borderWidth: 0, flexDirection: "row" }]}>
                    {React.Children.toArray(review.images.slice(0, 3).map((v, i) => (
                      <View>
                        <Image source={{ uri: v.image }} style={{
                          marginRight: i !== 2 ? d2p(5) : 0,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: theme.color.grayscale.d3d0d5,
                          width:
                            Dimensions.get("window").width - d2p(283.5),
                          aspectRatio: 3 / 2,
                        }} />
                        {i === 2 &&
                          <View style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            borderRadius: 10,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            justifyContent: "center",
                            alignItems: "center"
                          }}>
                            <Image source={more} style={{ width: d2p(26), height: d2p(16) }} />
                          </View>}
                      </View>
                    )))}
                  </View>
                );
            }
          })()
        }
      </View>
    </View>
  );
};

export default ReKnew;

const styles = StyleSheet.create({
  review: {
    paddingTop: d2p(20),
  },
  title: {
    fontSize: 16,
    marginHorizontal: d2p(10)
  },
  household: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4
  },
  sign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: h2p(10),
  },
  store: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
    marginRight: d2p(10)
  },
  imageWrap: {
    borderWidth: 1,
    borderColor: theme.color.grayscale.d3d0d5,
    borderRadius: 10,
    marginTop: h2p(10)
  }
});

