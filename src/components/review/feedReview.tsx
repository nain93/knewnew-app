import { View, Pressable, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import Text from '~/components/style/CustomText';
import React, { memo, useEffect, useState } from 'react';
import theme from '~/styles/theme';
import { d2p, h2p, simpleDate } from '~/utils';
import ReviewIcon from '../icon/reviewIcon';
import { bookmark, cart, colorCart, colorLike, comment, graybookmark, grayEyeIcon, like, more } from '~/assets/icons';
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
import ReadMore from '@fawazahmed/react-native-read-more';
import { blockUser } from '~/api/user';

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
    if (review.parent) {
      navigation.navigate("Write", {
        loading: true, isEdit: true, type: "reknew",
        nickname: review.author.nickname, review, filterBadge
      });
    }
    else {
      navigation.navigate("Write", { loading: true, isEdit: true, review, filterBadge });
    }
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
        alignItems: "center"
      }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Mypage", { id: review.author.id })}
          style={{
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
            marginRight: d2p(10)
          }}>
          <FastImage resizeMode="cover" source={review.author?.profileImage ? { uri: review.author.profileImage } : noProfile}
            style={{ width: d2p(20), height: d2p(20) }} />
        </TouchableOpacity>

        <View style={{ width: Dimensions.get('window').width - d2p(80) }}>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
            <TouchableOpacity onPress={() => navigation.navigate("Mypage", { id: review.author.id })}>
              <Text style={[styles.title, FONT.Medium]}>{review.author?.nickname}</Text>
            </TouchableOpacity>
            {/* todo 뱃지 추가 */}
            <Text style={[FONT.Regular, { fontSize: 13, color: theme.color.grayscale.a09ca4 }]}>
              · {review.author?.tags?.foodStyle}
            </Text>
          </View>
        </View>

        {
          type === "normal" &&
          <TouchableOpacity
            style={{ position: "absolute", right: 0, top: 0 }}
            onPress={() => {
              if (review.author.id === myId) {
                setIsBottomDotSheet({
                  isOpen: true,
                  topTitle: "푸드로그 수정",
                  topPress: () => handleEditPress(),
                  middleTitle: "푸드로그 삭제",
                  middlePress: () => {
                    setModalOpen({
                      isOpen: true,
                      content: "글을 삭제할까요?",
                      okButton: handleDeletePress
                    });
                  },
                  middleTextStyle: { color: theme.color.main },
                  bottomTitle: "취소하기"
                });
              }
              else {
                setIsBottomDotSheet({
                  isOpen: true,
                  topTitle: "푸드로그 신고",
                  topPress: () => navigation.navigate("report", { review }),
                  middleTitle: "푸드로그 차단",
                  middlePress: () => {
                    setModalOpen({
                      isOpen: true,
                      content: "차단 하시겠습니까?",
                      okButton: () => blockMutation.mutate({ id: review.author.id, isBlock: true })
                    });
                  },
                  middleTextStyle: { color: theme.color.main },
                  bottomTitle: "취소하기"
                });
              }
            }}>
            <Image
              source={more}
              resizeMode="contain"
              style={{ width: d2p(26), height: d2p(16) }}
            />
          </TouchableOpacity>
        }
        <View style={{
          right: 0, top: h2p(15),
          position: "absolute",
        }}>
          {review.isEdit &&
            <Text style={[FONT.Regular,
            {
              fontSize: 12, color: theme.color.grayscale.d3d0d5,
              textAlign: "right",
              marginTop: h2p(5)
            }]}>
              수정됨
            </Text>
          }
        </View>
      </View>

      <View style={styles.titleContainer}>
        <ReviewIcon viewStyle={{ marginTop: h2p(15), marginBottom: h2p(15) }} review={review.satisfaction} />
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
                navigation.navigate("ProductDetail", { id: review.product?.id });
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
              backgroundColor: "rgba(234,231,236,0.4)",
              paddingHorizontal: d2p(5),
              paddingVertical: h2p(4),
              borderRadius: 4
            }}>
            <Text style={[FONT.Medium, {
              color: review.product.isVerified ? "#5193f6" : theme.color.grayscale.C_79737e,
            }]}>
              {`${review.product.name} >`}
            </Text>
          </TouchableOpacity>
        </View>
      }
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
            onSeeMoreBlocked={() => navigation.navigate("FeedDetail", {
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
                      d2p(90), aspectRatio: 1
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
                          d2p(90),
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
                          marginRight: i !== 2 ? d2p(5) : 0,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: theme.color.grayscale.d3d0d5,
                          width:
                            type === "reKnewWrite" ?
                              d2p(72.5)
                              :
                              d2p(90),
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
      {review.parent &&
        <ReKnew review={{ ...review.parent }} filterBadge={filterBadge ? filterBadge : ""} />
      }
      {type === "normal" &&
        <View style={styles.reactionContainer}>
          {/* 인용글에서는 리트윗 아이콘 삭제 */}
          {/* {!review.parent &&
            <TouchableOpacity
              onPress={() => navigation.navigate("Write",
                { loading: false, isEdit: false, type: "reKnewWrite", review, nickname: getMyProfileQuery.data?.nickname, filterBadge })}
              style={styles.reviewIcon}>
              <Image source={reKnew} style={styles.reviewImg} />
              <Text style={[FONT.Regular, styles.reviewCount]}>{review.childCount}</Text>
            </TouchableOpacity>
          } */}
          <View
            style={styles.reviewIcon}>
            <Image source={grayEyeIcon} style={styles.reviewImg} />
            <Text style={[FONT.Regular, styles.reviewCount]}>{review.viewCount}</Text>
          </View>
          <Pressable
            onPress={() => {
              navigation.navigate("FeedDetail", {
                authorId: review.author.id,
                id: review.id, badge: filterBadge,
                isLike: review.isLike, isBookmark: review.isBookmark, toComment: true
              });
            }}
            style={styles.reviewIcon}>
            <Image source={comment} style={styles.reviewImg} />
            <Text style={[FONT.Regular, styles.reviewCount]}>{review.commentCount}</Text>
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
            <Image source={isLike ? colorLike : like} style={styles.reviewImg} />
            <Text style={[FONT.Regular, styles.reviewCount]}>{likeCount}</Text>
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
            <Image source={isBookmarkState ? graybookmark : bookmark} style={styles.reviewImg} />
            <Text style={[FONT.Regular, styles.reviewCount]}>{bookmarkCount}</Text>
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
    marginLeft: d2p(30),
    marginTop: h2p(15),
    borderColor: theme.color.grayscale.d3d0d5,
    borderRadius: 10,
  }
});