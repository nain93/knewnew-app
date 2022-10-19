import { View, Pressable, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import Text from '~/components/style/CustomText';
import React, { memo, useEffect, useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import ReviewIcon from '../icon/reviewIcon';
import { blackRightArrow, bookmark, cart, colorCart, colorLike, comment, graybookmark, grayEyeIcon, like, more } from '~/assets/icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
//@ts-ignore
import Highlighter from 'react-native-highlight-words';
import { ReviewListType } from '~/types/review';
import { useMutation, useQueryClient } from 'react-query';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { bottomDotSheetState, myIdState, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import { bookmarkReview, deleteReview, likeReview } from '~/api/review';
import { FONT } from '~/styles/fonts';
import { noProfile } from '~/assets/images';
import ReKnew from '~/components/review/reKnew';
import FastImage from 'react-native-fast-image';
import { blockUser } from '~/api/user';
import ReadMore from '@fawazahmed/react-native-read-more';

interface FeedReviewProps {
  review: ReviewListType,
  isRetweet?: boolean,
  type?: "reKnewWrite" | "normal"
  filterBadge?: string,
  keyword?: string,
}

const FeedReview = ({ keyword, type = "normal", filterBadge, review }: FeedReviewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [tags, setTags] = useState<Array<string>>([]);
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();
  const [isLike, setIsLike] = useState<boolean>(review.isLike);
  const [likeCount, setLikeCount] = useState(review.likeCount);
  const [isBookmarkState, setIsBookmarkState] = useState<boolean>(review.isBookmark);
  const [bookmarkCount, setBookmarkCount] = useState(review.bookmarkCount);
  const [apiBlock, setApiBlock] = useState(false);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const setIsBottomDotSheet = useSetRecoilState(bottomDotSheetState);
  const setIspopupOpen = useSetRecoilState(popupState);
  const bookmarkMutation = useMutation("bookmark",
    ({ id, isBookmark }: { id: number, isBookmark: boolean }) => bookmarkReview(token, id, isBookmark), {
    onSuccess: async () => {
      await Promise.all(
        [
          queryClient.invalidateQueries("myProfile"),
          queryClient.invalidateQueries("reviewList"),
          queryClient.invalidateQueries("userBookmarkList"),
          queryClient.invalidateQueries("userReviewList")
        ]
      );
      setApiBlock(false);
    },
    onError: () => setApiBlock(false)
  });

  const likeReviewFeedMutation = useMutation('likeReviewFeed',
    ({ id, state }: { id: number, state: boolean }) => likeReview(token, id, state), {
    onSuccess: async () => {
      await Promise.all(
        [
          queryClient.invalidateQueries("myProfile"),
          queryClient.invalidateQueries("reviewList"),
          queryClient.invalidateQueries("userBookmarkList"),
          queryClient.invalidateQueries("userReviewList")
        ]
      );
      setApiBlock(false);
    },
    onError: () => setApiBlock(false)
  });

  const deleteMutation = useMutation("deleteReview",
    (id: number) => deleteReview(token, id));

  const blockMutation = useMutation("blockUser",
    ({ id, isBlock }: { id: number, isBlock: boolean }) => blockUser({ token, id, isBlock }), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
      queryClient.invalidateQueries("userBookmarkList");
      setIspopupOpen({ isOpen: true, content: "차단되었습니다." });
    }
  });

  const handleDeletePress = () => {
    queryClient.setQueriesData("myProfile", (profileQuery: any) => {
      return {
        ...profileQuery, reviewCount: profileQuery?.reviewCount > 0 && profileQuery?.reviewCount - 1
      };
    });
    queryClient.setQueriesData("reviewList", (data) => {
      if (data) {
        return {
          //@ts-ignore
          ...data, pages: [data.pages.flat().filter(v => v.id !== review.id).map(v => {
            if (v.parent?.id === review.id) {
              return { ...v, parent: { ...v.parent, isActive: false } };
            }
            return v;
          })]
        };
      }
    });
    queryClient.setQueriesData("userReviewList", (data) => {
      if (data) {
        //@ts-ignore
        return { ...data, pages: [data.pages.flat().filter(v => v.id !== review.id)] };
      }
    });
    queryClient.setQueriesData("userBookmarkList", (data) => {
      if (data) {
        //@ts-ignore
        return { ...data, pages: [data.pages.flat().filter(v => v.id !== review.id)] };
      }
    });
    deleteMutation.mutate(review.id);
  };

  const handleEditPress = () => {
    navigation.navigate("Write", { loading: true, isEdit: true, review, filterBadge });
  };

  useEffect(() => {
    setLikeCount(review.likeCount);
  }, [review.likeCount]);

  useEffect(() => {
    setIsLike(review.isLike);
  }, [review.isLike]);

  useEffect(() => {
    setBookmarkCount(review.bookmarkCount);
  }, [review.bookmarkCount]);

  useEffect(() => {
    setIsBookmarkState(review.isBookmark);
  }, [review.isBookmark]);

  useEffect(() => {
    setTags(review.tags?.interest);
  }, [review.tags]);


  return (
    <>
      <View style={{
        flexDirection: 'row',
        alignItems: "center",
      }}>
        <TouchableOpacity
          onPress={() => navigation.push("UserPage", { id: review.author.id })}
          style={{
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
            marginRight: d2p(10)
          }}>
          <FastImage resizeMode="cover" source={review.author?.profileImage ? { uri: review.author.profileImage } : noProfile}
            style={{ width: d2p(20), height: d2p(20) }} />
        </TouchableOpacity>

        <View style={{ width: Dimensions.get('window').width - d2p(100), flexWrap: "wrap" }}>
          <TouchableOpacity
            onPress={() => navigation.push("UserPage", { id: review.author.id })}>
            <Text style={[styles.title, FONT.SemiBold]}>{review.author?.nickname}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <ReviewIcon viewStyle={{ marginTop: h2p(15) }}
          review={review.satisfaction} />
      </View>
      {review.product &&
        <View style={{
          marginLeft: d2p(30),
          flexDirection: 'row',
          marginBottom: h2p(10)
        }}>
          <TouchableOpacity
            onPress={() => {
              if (review.product?.isVerified) {
                navigation.push("ProductDetail", { id: review.product?.id });
              }
              else {
                setModalOpen({
                  isOpen: true,
                  content: "아직 등록되지 않은 상품입니다.",
                  okButton: () => setModalOpen({ ...modalOpen, isOpen: false }),
                  isCancleButton: false
                });
              }
            }}
            style={{
              borderWidth: 1,
              borderColor: theme.color.grayscale.eae7ec,
              paddingLeft: d2p(10),
              paddingRight: review.product.isVerified ? d2p(20) : d2p(10),
              paddingVertical: h2p(10),
              borderRadius: 5,
              width: Dimensions.get("window").width - d2p(70)
            }}>
            {review.market &&
              <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
                {review.market}
              </Text>
            }
            <Text style={[FONT.Medium, {
              marginTop: h2p(5),
              color: theme.color.black
            }]}>
              {review.product.name}
            </Text>
            {review.product.isVerified &&
              <Image source={blackRightArrow}
                style={{
                  position: "absolute",
                  width: d2p(6), height: d2p(10),
                  right: d2p(10),
                  bottom: h2p(12.5),
                }} />
            }
          </TouchableOpacity>
        </View>
      }
      <Text style={[FONT.Bold, {
        marginLeft: d2p(30),
        marginTop: h2p(20),
        marginBottom: h2p(15)
      }]}>
        사놓으면 활용도 좋은템이에요!
      </Text>
      {keyword ?
        <Highlighter
          highlightStyle={[FONT.Bold, { fontSize: 15, color: theme.color.main }]}
          searchWords={[keyword]}
          textToHighlight={review.content}
          style={[FONT.Regular, {
            fontSize: 15, marginBottom: h2p(10), marginLeft: d2p(30),
            color: theme.color.grayscale.C_79737e,
          }]}
        />
        :
        <View style={{ marginLeft: d2p(30) }}>
          <ReadMore
            seeMoreText="더보기 >"
            expandOnly={true}
            seeMoreStyle={[FONT.Medium, {
              color: theme.color.grayscale.a09ca4, fontSize: 12
            }]}
            numberOfLines={5}
            onSeeMoreBlocked={() => navigation.push("FeedDetail", {
              authorId: review.author.id,
              id: review.id, badge: filterBadge,
              isLike: review.isLike, isBookmark: review.isBookmark
            })}
            style={[{
              color: theme.color.grayscale.C_79737e,
              lineHeight: 21,
              marginTop: 0,
              fontSize: 15
            }, FONT.Regular]}
          >
            {review.content}
          </ReadMore>
        </View>
      }

      {
        (() => {
          switch (review.images?.length) {
            // * 사진 없음
            case 0: {
              return null;
            }
            // * 사진 1개
            case 1: {
              return (
                <FastImage
                  source={{ uri: review.images[0]?.image, priority: FastImage.priority.high }}
                  style={[styles.imageWrap, {
                    width: type === "reKnewWrite" ?
                      d2p(80)
                      :
                      (Dimensions.get("window").width - d2p(90)) / 3
                    , aspectRatio: 1
                  }]} />
              );
            }
            // * 사진 2개
            case 2: {
              return (
                <View style={[styles.imageWrap, { borderWidth: 0, flexDirection: "row" }]}>
                  {React.Children.toArray(review.images.map((v, i) => (
                    <FastImage source={{ uri: v.image, priority: FastImage.priority.high }} style={{
                      marginRight: i === 0 ? d2p(10) : 0,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.color.grayscale.d3d0d5,
                      width:
                        type === "reKnewWrite" ?
                          d2p(80)
                          :
                          (Dimensions.get("window").width - d2p(90)) / 3,
                      aspectRatio: 1,
                    }} />
                  )))}
                </View>
              );
            }
            // * 사진 3개이상
            default:
              return (
                <View
                  style={[styles.imageWrap, { borderWidth: 0, flexDirection: "row" }]}>
                  {React.Children.toArray(review.images?.slice(0, 3).map((v, i) => (
                    <View>
                      <FastImage
                        source={{ uri: v.image, priority: FastImage.priority.high }} style={{
                          marginRight: i !== 2 ? d2p(10) : 0,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: theme.color.grayscale.d3d0d5,
                          width:
                            type === "reKnewWrite" ?
                              d2p(72.5)
                              :
                              (Dimensions.get("window").width - d2p(90)) / 3,
                          aspectRatio: 1,
                        }} />
                      {i === 2 &&
                        <View style={{
                          position: "absolute",
                          width: "100%",
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

      {type === "normal" &&
        <View style={styles.reactionContainer}>
          <View
            style={styles.reviewIcon}>
            <Image source={grayEyeIcon} style={[styles.reviewImg, {
              width: d2p(20), height: d2p(15)
            }]} />
            <Text style={[FONT.Medium, styles.reviewCount]}>{review.viewCount}</Text>
          </View>
          <Pressable
            onPress={() => {
              navigation.push("FeedDetail", {
                authorId: review.author.id,
                id: review.id, badge: filterBadge,
                isLike: review.isLike, isBookmark: review.isBookmark, toComment: true
              });
            }}
            style={styles.reviewIcon}>
            <Image source={comment} style={styles.reviewImg} />
            <Text style={[FONT.Medium, styles.reviewCount]}>{review.commentCount}</Text>
          </Pressable>
          <TouchableOpacity
            onPress={() => {
              if (!apiBlock) {
                setApiBlock(true);
                if (isLike) {
                  setIsLike(false);
                  setLikeCount(prev => prev - 1);
                }
                else {
                  setIsLike(true);
                  setLikeCount(prev => prev + 1);
                }
                likeReviewFeedMutation.mutate({ id: review.id, state: !isLike });
              }
            }}
            style={styles.reviewIcon}>
            <Image source={isLike ? colorLike : like} style={[styles.reviewImg, {
              width: d2p(18), height: d2p(17)
            }]} />
            <Text style={[FONT.Medium, styles.reviewCount]}>{likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!apiBlock) {
                setApiBlock(true);
                if (isBookmarkState) {
                  setIsBookmarkState(false);
                  setBookmarkCount(prev => prev - 1);
                }
                else {
                  setIsBookmarkState(true);
                  setBookmarkCount(prev => prev + 1);
                }
                bookmarkMutation.mutate({ id: review.id, isBookmark: !isBookmarkState });
              }
            }}
            style={styles.reviewIcon}>
            <Image source={isBookmarkState ? colorBookmark : bookmark} style={[styles.reviewImg, {
              width: d2p(14), height: d2p(18)
            }]} />
            <Text style={[FONT.Medium, styles.reviewCount]}>{bookmarkCount}</Text>
          </TouchableOpacity>
        </View>
      }
    </>
  );
};

export default memo(FeedReview);

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    marginLeft: d2p(30)
  },
  title: {
    fontSize: 14,
    marginRight: d2p(5)
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
    marginLeft: d2p(30),
    marginTop: h2p(10),
    marginRight: d2p(40),
    justifyContent: "space-between",
    flexDirection: 'row',
  },
  reviewIcon: {
    flexDirection: "row",
    alignItems: "center"
  },
  reviewImg: {
    width: d2p(16),
    height: d2p(16),
    marginRight: d2p(10)
  },
  reviewCount: {
    color: theme.color.grayscale.C_9F9CA3
  },
  imageWrap: {
    borderWidth: 1,
    marginLeft: d2p(30),
    marginTop: h2p(15),
    borderColor: theme.color.grayscale.d3d0d5,
    borderRadius: 10,
  }
});