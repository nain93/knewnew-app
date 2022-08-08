import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import ReviewIcon from '../icon/reviewIcon';
import { marketIcon, more, reKnew, retweetfrom, tag } from '~/assets/icons';
import { FONT } from '~/styles/fonts';
import { ReviewParentType } from '~/types/review';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { useNavigation } from '@react-navigation/native';
import { noProfile } from '~/assets/images';
import FastImage from 'react-native-fast-image';
import ReadMore from '@fawazahmed/react-native-read-more';

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
      <View style={{ paddingBottom: 0, paddingTop: h2p(15) }}>
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
    <>
      {/* 상세화면 ui */}
      {type === "detail" ?
        < >
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            height: h2p(20),
            marginTop: h2p(20),
          }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Mypage", { id: review.author.id })}
              style={{
                borderRadius: 40,
                borderColor: theme.color.grayscale.e9e7ec,
                borderWidth: 1,
                overflow: "hidden",
                width: d2p(40),
                height: d2p(40)
              }}>
              <FastImage
                resizeMode="cover"
                source={review.author.profileImage ? { uri: review.author.profileImage } : noProfile}
                style={{
                  width: d2p(40), height: d2p(40)
                }} />
            </TouchableOpacity>

            <View style={{
              width: Dimensions.get('window').width - d2p(135),
              paddingLeft: d2p(10),
            }}>
              <View style={{ alignItems: "center", flexWrap: "wrap" }}>
                <TouchableOpacity onPress={() => navigation.navigate("Mypage", { id: review.author.id })}>
                  <Text style={[styles.title, FONT.Medium]}>
                    {review.author.nickname}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[FONT.Regular, {
                marginTop: h2p(5),
                fontSize: 13, color: theme.color.grayscale.a09ca4
              }]}>{review.tags.interest[0]}
              </Text>
            </View>

            <Text style={[FONT.Regular, { fontSize: 10, color: theme.color.grayscale.a09ca4 }]}>
              {simpleDate(review.created, "전")}</Text>
          </View>

          <View style={{ marginLeft: type === "detail" ? d2p(25) : d2p(75) }}>
            <View style={{
              flexDirection: "row", alignItems: "center",
              justifyContent: "space-between",
              marginTop: h2p(35), marginBottom: h2p(10)
            }}>
              <ReviewIcon review={review.satisfaction} />
              {review.market &&
                <View style={[styles.sign, { alignItems: "center" }]}>
                  <Image source={marketIcon} style={{ width: d2p(16), height: d2p(16), marginRight: d2p(5) }} />
                  <Text style={[styles.store, { marginRight: 0 }, FONT.Regular]}>{review.market}</Text>
                </View>
              }
              {/* <TouchableOpacity
                onPress={() => navigation.navigate("FeedDetail",
                  { id: review.id })}
                style={{
                  borderRadius: 12.5, borderWidth: 1,
                  paddingHorizontal: d2p(10), paddingVertical: h2p(5),
                  borderColor: theme.color.grayscale.e9e7ec,
                }}
              >
                <Text style={[FONT.Regular, { fontSize: 12 }]}>원문 보기</Text>
              </TouchableOpacity> */}
            </View>
            <Text style={[{ lineHeight: 21, color: theme.color.grayscale.C_79737e }, FONT.Regular]}>{review.content}</Text>
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
                          width: d2p(80),
                          aspectRatio: 1
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
                            width: d2p(80),
                            aspectRatio: 1,
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
                              width: d2p(80),
                              aspectRatio: 1,
                            }} />
                            {i === 2 &&
                              <View style={{
                                position: "absolute",
                                width: d2p(80),
                                aspectRatio: 1,
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
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            width: Dimensions.get("window").width - d2p(90),
            marginLeft: d2p(30),
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
        </>
        :
        <View style={{
          paddingVertical: h2p(15),
          paddingHorizontal: d2p(15),
          borderColor: theme.color.grayscale.e9e7ec,
          borderWidth: 1,
          borderRadius: 10,
          width: Dimensions.get("window").width - d2p(70),
          marginLeft: d2p(30),
          marginTop: h2p(20)
        }}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Mypage", { id: review.author.id })}
              style={{
                borderRadius: 20,
                borderColor: theme.color.grayscale.e9e7ec,
                borderWidth: 1,
                overflow: "hidden",
                height: d2p(20),
                width: d2p(20),
                marginRight: d2p(5)
              }}>
              <FastImage
                source={review.author.profileImage ? { uri: review.author.profileImage } : noProfile}
                style={{
                  width: d2p(20), height: d2p(20)
                }} />
            </TouchableOpacity>
            <View style={{
              flexDirection: 'row', alignItems: 'center'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: "wrap" }}>
                <Text style={[styles.title, FONT.Medium]}>{review.author.nickname}</Text>
                <Text style={[FONT.Regular, { fontSize: 13, color: theme.color.grayscale.a09ca4 }]}>· {review.tags.interest[0]}</Text>
              </View>
            </View>
          </View>

          <View>
            <View style={{
              flexDirection: "row", alignItems: "center",
              marginBottom: h2p(10), marginTop: h2p(15),
              justifyContent: "space-between"
            }}>
              <ReviewIcon review={review.satisfaction} />
              <TouchableOpacity
                onPress={() => navigation.navigate("FeedDetail",
                  { id: review.id })}
                style={{
                  borderRadius: 12.5, borderWidth: 1,
                  paddingHorizontal: d2p(10), paddingVertical: h2p(5),
                  borderColor: theme.color.grayscale.e9e7ec,
                }}
              >
                <Text style={[FONT.Regular, { fontSize: 12 }]}>원문 보기</Text>
              </TouchableOpacity>
            </View>

            <ReadMore
              seeMoreText="더보기 >"
              expandOnly={true}
              seeMoreStyle={[FONT.Medium, {
                color: theme.color.grayscale.a09ca4, fontSize: 12
              }]}
              numberOfLines={3}
              onSeeMoreBlocked={() => navigation.navigate("FeedDetail",
                { id: review.id })}
              style={[{
                color: theme.color.grayscale.C_79737e,
                lineHeight: 21,
                marginTop: 0,
              }, FONT.Regular]}
            >
              {review.content}
            </ReadMore>
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
                          width: d2p(80),
                          aspectRatio: 1
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
                              d2p(80),
                            aspectRatio: 1,
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
                              marginRight: i !== 2 ? d2p(10) : 0,
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor: theme.color.grayscale.d3d0d5,
                              width: d2p(80),
                              aspectRatio: 1,
                            }} />
                            {i === 2 &&
                              <View style={{
                                position: "absolute",
                                width: d2p(80),
                                aspectRatio: 1,
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
      }

    </>
  );
};

export default ReKnew;

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    marginRight: d2p(5)
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

