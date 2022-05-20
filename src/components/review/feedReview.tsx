import { View, Text, Pressable, StyleSheet, Dimensions, Image, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import Badge from '../badge';
import ReviewIcon from '../icon/reviewIcon';
import { cart, colorLike, comment, like, more, reKnew, tag } from '~/assets/icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
  filterBadge?: string
  type?: "reKnewWrite" | "normal"
  setSelectedIndex?: (idx: number) => void
  selectedIndex?: number
  idx?: number
  clickBoxStyle?: ViewStyle
}

const FeedReview = ({ selectedIndex, setSelectedIndex, idx = -1,
  clickBoxStyle,
  type = "normal", filterBadge, review, isRetweet = false }: FeedReviewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [isLike, setIsLike] = useState<boolean>(review.isLike);
  const [reactCount, setReactCount] = useState(review.likeCount);
  const [isCart, setIsCart] = useState<boolean>(false);
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const [badge, setBadge] = useState("");

  useEffect(() => {
    if (filterBadge) {
      setBadge(filterBadge);
    }
    else {
      setBadge(review.author.representBadge);
    }
  }, [filterBadge]);

  useFocusEffect(
    useCallback(() => {
      if (setSelectedIndex) {
        return () => setSelectedIndex(-1);
      }
    }, []));

  const likeReviewFeedMutation = useMutation('likeReviewFeed',
    ({ id, state }: { id: number, state: boolean }) => likeReview(token, id, state));
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{
          backgroundColor: 'black',
          position: "absolute",
          left: 0,
          width: d2p(40), height: d2p(40), borderRadius: 40
        }} />
        <View style={{
          flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
          marginLeft: d2p(50),
          width: Dimensions.get('window').width - d2p(120)
        }}>
          <Text style={[styles.title, FONT.Medium]}>{review.author.nickname}</Text>
          <Badge type="feed" text={review.author.representBadge} />
          <Text style={[{ fontSize: 12, marginLeft: d2p(5), color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>{review.author.household}</Text>
        </View>
        {type === "normal" &&
          <TouchableOpacity onPress={() => {
            if (setSelectedIndex) {
              if (selectedIndex === idx) {
                setSelectedIndex(-1);
              }
              else {
                setSelectedIndex(idx);
              }
            }
          }}>
            <Image
              source={more}
              resizeMode="contain"
              style={{ width: 26, height: 16 }}
            />
          </TouchableOpacity>}
      </View>
      <View style={styles.titleContainer}>
        <ReviewIcon viewStyle={{ marginTop: h2p(14) }} review={review.satisfaction} />
        {type === "normal" &&
          <Text style={[{ fontSize: 10, color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>{simpleDate(review.created, ' 전')}</Text>
        }
      </View>
      <Text style={[{ color: theme.color.black, marginBottom: h2p(10), marginLeft: d2p(50) }, FONT.Regular]}>{review.content}</Text>
      {!isRetweet &&
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: d2p(10), marginLeft: d2p(50) }}>
          <Image source={tag} style={{ width: 10, height: 10, marginRight: d2p(5) }} />
          <Text style={[{ fontSize: 12, color: theme.color.grayscale.C_79737e }, FONT.Regular]}>
            {React.Children.toArray(review?.tags?.map((v) => {
              if (v === badge) {
                return;
              }
              return <Text>#{v} </Text>;
            }))}
            <Text style={{ color: theme.color.main, fontSize: 12 }}>#{badge}</Text>
          </Text>
        </View>}
      {(!isRetweet && type === "normal") &&
        <View style={styles.sign}>
          <Text style={[styles.store, FONT.Regular]}>{review.market}</Text>
        </View>}
      {review.images.length > 0 &&
        <Image source={{ uri: review.images[0]?.image }}
          style={{
            borderWidth: 1,
            marginLeft: d2p(50),
            marginVertical: h2p(5),
            borderColor: theme.color.grayscale.e9e7ec,
            borderRadius: 10,
            width: type === "reKnewWrite" ?
              Dimensions.get("window").width - d2p(120)
              :
              Dimensions.get("window").width - d2p(90), aspectRatio: 3 / 2
          }} />
      }
      {type === "normal" &&
        <View style={styles.reactionContainer}>
          <TouchableOpacity
            onPress={() => console.log("zz")}
            style={styles.reviewIcon}>
            <Image source={cart} style={styles.reviewImg} />
            <Text style={styles.reviewCount}>{review.bookmarkCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log("zz")}
            style={styles.reviewIcon}>
            <Image source={comment} style={styles.reviewImg} />
            <Text style={styles.reviewCount}>{review.commentCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsLike(!isLike);
              likeReviewFeedMutation.mutate({ id: review.id, state: !isLike });
              if (!isLike) {
                setReactCount(prev => prev + 1);
              }
              else {
                setReactCount(prev => prev - 1);
              }
            }}
            style={styles.reviewIcon}>
            <Image source={isLike ? colorLike : like} style={styles.reviewImg} />
            <Text style={styles.reviewCount}>{reactCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ReKnew", { review })}
            style={styles.reviewIcon}>
            <Image source={reKnew} style={styles.reviewImg} />
            <Text style={styles.reviewCount}>{review.childCount}</Text>
          </TouchableOpacity>
        </View>
      }
      {
        (selectedIndex === idx && type === "normal") &&
        (
          review.author.id === myId ?
            <View style={[styles.clickBox, clickBoxStyle]}>
              <Pressable onPress={() => console.log("")}>
                <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>수정</Text>
              </Pressable>
              <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
              <Pressable onPress={() => console.log("")}>
                <Text style={[{ color: theme.color.main }, FONT.Regular]}>삭제</Text>
              </Pressable>
            </View>
            :
            <View style={[styles.clickBox, clickBoxStyle]}>
              <Pressable onPress={() => console.log("")}>
                <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>공유</Text>
              </Pressable>
              <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
              <Pressable onPress={() => console.log("")}>
                <Text style={[{ color: theme.color.main }, FONT.Regular]}>신고</Text>
              </Pressable>
            </View>
        )}
    </>
  );
};

export default FeedReview;

const styles = StyleSheet.create({

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    marginBottom: h2p(12),
    marginLeft: d2p(50),
  },
  title: {
    fontSize: 16, fontWeight: 'bold',
    marginRight: d2p(10)
  },
  sign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: h2p(10),
    bordeWidth: 1,
    borderStyle: 'dotted',
    borderColor: theme.color.grayscale.e9e7ec
  },
  store: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
    marginRight: d2p(10)
  },

  dottedLine: {
    borderWidth: 1,
    borderColor: theme.color.grayscale.e9e7ec,
    borderStyle: 'dotted',
  },
  clickBox: {
    display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
    width: d2p(70), height: d2p(70), borderRadius: 5,
    position: 'absolute', right: d2p(36), top: h2p(5),
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
  reactionContainer: {
    marginLeft: d2p(50),
    marginTop: h2p(5),
    flexDirection: 'row',
  },
  reviewIcon: {
    flexDirection: "row",
    alignItems: "center"
  },
  reviewImg: {
    width: d2p(24),
    height: d2p(24),
    marginRight: d2p(10)
  },
  reviewCount: {
    marginRight: d2p(20),
    fontSize: 12,
    color: theme.color.grayscale.C_79737e
  },
});