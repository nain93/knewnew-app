import { View, Text, Pressable, StyleSheet, Dimensions, Image, TouchableOpacity, ViewStyle } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import Badge from '../badge';
import ReviewIcon from '../icon/reviewIcon';
import { cart, colorCart, colorLike, comment, like, more, reKnew, tag } from '~/assets/icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
//@ts-ignore
import Highlighter from 'react-native-highlight-words';
import { ReviewListType, ReviewParentType } from '~/types/review';
import { useMutation, useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import { bookmarkReview, likeReview } from '~/api/review';
import { FONT } from '~/styles/fonts';
import { noProfile } from '~/assets/images';
import { MyPrfoileType } from '~/types/user';
import { getMyProfile } from '~/api/user';
import ReKnew from '~/components/review/reKnew';
import More from '~/components/more';
import Loading from '~/components/loading';

interface FeedReviewProps {
  review: ReviewListType,
  isRetweet?: boolean,
  type?: "reKnewWrite" | "normal"
  setSelectedIndex?: (idx: number) => void
  selectedIndex?: number
  idx?: number
  clickBoxStyle?: ViewStyle
  filterBadge?: string,
  keyword?: string,
}

const FeedReview = ({ selectedIndex, setSelectedIndex, idx = -1,
  clickBoxStyle, keyword,
  type = "normal", filterBadge, review }: FeedReviewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [isLike, setIsLike] = useState<boolean>(review.isLike);
  const [reactCount, setReactCount] = useState(review.likeCount);
  const [isBookmarkState, setIsBookmarkState] = useState<boolean>(review.isBookmark);
  const [bookmarkCount, setBookmarkCount] = useState(review.bookmarkCount);
  const [tags, setTags] = useState<Array<string>>([]);
  const token = useRecoilValue(tokenState);

  const boomarkMutation = useMutation("bookmark",
    ({ id, isBookmark }: { id: number, isBookmark: boolean }) => bookmarkReview(token, id, isBookmark));

  const likeReviewFeedMutation = useMutation('likeReviewFeed',
    ({ id, state }: { id: number, state: boolean }) => likeReview(token, id, state));

  const getMyProfileQuery = useQuery<MyPrfoileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token
  });

  useFocusEffect(
    useCallback(() => {
      if (setSelectedIndex)
        return () => setSelectedIndex(-1);
    }, []));

  useEffect(() => {
    const copy: { [index: string]: Array<string> }
      = { ...review.tags };
    setTags(
      Object.keys(copy).reduce<Array<string>>((acc, cur) => {
        acc = acc.concat(copy[cur]);
        return acc;
      }, [])
    );
  }, [review]);

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: h2p(20) }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Mypage", { id: review.author.id })}
          style={{
            position: "absolute",
            left: 0,
            borderRadius: 40,
            borderColor: theme.color.grayscale.e9e7ec,
            borderWidth: 1,
          }}>
          <Image source={review.author.profileImage ? { uri: review.author.profileImage } : noProfile}
            style={{
              width: d2p(40), height: d2p(40),
              borderRadius: 40
            }} />
        </TouchableOpacity>
        <View style={{
          flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
          marginLeft: d2p(50),
          width: Dimensions.get('window').width - d2p(120)
        }}>
          <Text style={[styles.title, FONT.Medium]}>{review.author.nickname}</Text>
          <Badge type="feed" text={review.author.representBadge} />
          <Text style={[{ fontSize: 12, marginLeft: d2p(5), color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>{review.author.household}</Text>
          {review.isEdit &&
            <Text style={[FONT.Regular,
            { fontSize: 12, color: theme.color.grayscale.d3d0d5, marginLeft: d2p(5) }]}>
              수정됨</Text>
          }
        </View>
        {type === "normal" &&
          <TouchableOpacity onPress={() => {
            if (setSelectedIndex)
              if (selectedIndex === idx) {
                setSelectedIndex(-1);
              }
              else {
                setSelectedIndex(idx);
              }
          }}>
            <Image
              source={more}
              resizeMode="contain"
              style={{ width: d2p(26), height: d2p(16) }}
            />
          </TouchableOpacity>}
      </View>
      <View style={styles.titleContainer}>
        <ReviewIcon viewStyle={{ marginTop: h2p(15), marginBottom: h2p(10) }} review={review.satisfaction} />
        {type === "normal" &&
          <Text style={[{ fontSize: 10, color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>{simpleDate(review.created, ' 전')}</Text>
        }
      </View>
      {keyword ?
        <Highlighter
          highlightStyle={[FONT.Bold, { color: theme.color.main }]}
          searchWords={[keyword]}
          textToHighlight={review.content}
          style={[FONT.Regular, { marginBottom: h2p(10), marginLeft: d2p(50) }]}
        />
        :
        <Text style={[{ color: theme.color.black, marginBottom: h2p(10), marginLeft: d2p(50) }, FONT.Regular]}>
          {review.content}</Text>
      }
      {!review.parent &&
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: d2p(10), marginLeft: d2p(50) }}>
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
        </View>}
      {review.market &&
        <View style={styles.sign}>
          <Text style={[styles.store, FONT.Regular]}>{review.market}</Text>
        </View>}
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
                    width: type === "reKnewWrite" ?
                      Dimensions.get("window").width - d2p(120)
                      :
                      Dimensions.get("window").width - d2p(90), aspectRatio: 3 / 2
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
                        type === "reKnewWrite" ?
                          Dimensions.get("window").width - d2p(245)
                          :
                          Dimensions.get("window").width - d2p(230), aspectRatio: 3 / 2,
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
                          type === "reKnewWrite" ?
                            Dimensions.get("window").width - d2p(283.5)
                            :
                            Dimensions.get("window").width - d2p(276), aspectRatio: 3 / 2,
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
      {type === "normal" &&
        <View style={styles.reactionContainer}>
          <TouchableOpacity
            onPress={() => {
              setIsBookmarkState(!isBookmarkState);
              boomarkMutation.mutate({ id: review.id, isBookmark: !isBookmarkState });
              if (!isBookmarkState) {
                setBookmarkCount(prev => prev + 1);
              }
              else {
                setBookmarkCount(prev => prev - 1);
              }
            }}
            style={styles.reviewIcon}>
            <Image source={isBookmarkState ? colorCart : cart} style={styles.reviewImg} />
            <Text style={styles.reviewCount}>{bookmarkCount}</Text>
          </TouchableOpacity>
          <Pressable
            style={styles.reviewIcon}>
            <Image source={comment} style={styles.reviewImg} />
            <Text style={styles.reviewCount}>{review.commentCount}</Text>
          </Pressable>
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
          {/* 인용글에서는 리트윗 아이콘 삭제 */}
          {!review.parent &&
            <TouchableOpacity
              onPress={() => navigation.navigate("Write",
                { loading: false, isEdit: false, type: "reKnewWrite", review, nickname: getMyProfileQuery.data?.nickname, filterBadge })}
              style={styles.reviewIcon}>
              <Image source={reKnew} style={styles.reviewImg} />
              <Text style={styles.reviewCount}>{review.childCount}</Text>
            </TouchableOpacity>
          }
        </View>
      }
      {review.parent &&
        <ReKnew review={{ ...review.parent, tags: review.tags }} filterBadge={filterBadge ? filterBadge : ""} />
      }
      {
        type === "normal" &&
        <More
          setSelectedIndex={(seIdx: number) => setSelectedIndex && setSelectedIndex(seIdx)}
          clickBoxStyle={clickBoxStyle}
          review={review}
          filterBadge={filterBadge}
          userId={review.author.id}
          isMoreClick={selectedIndex === idx}
          type="review"
          handleCloseMore={() => {
            if (setSelectedIndex) {
              setSelectedIndex(-1);
            }
          }}
        />
      }
    </>
  );
};

export default FeedReview;

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
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
  reactionContainer: {
    marginLeft: d2p(50),
    marginTop: h2p(5),
    marginRight: d2p(40),
    justifyContent: "space-between",
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
    fontSize: 12,
    color: theme.color.grayscale.C_79737e
  },
  imageWrap: {
    borderWidth: 1,
    marginLeft: d2p(50),
    marginBottom: h2p(5),
    marginTop: h2p(10),
    borderColor: theme.color.grayscale.d3d0d5,
    borderRadius: 10,
  }
});