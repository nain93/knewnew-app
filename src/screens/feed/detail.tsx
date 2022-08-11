import { View, Dimensions, StyleSheet, Pressable, Image, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, Keyboard, FlatList } from 'react-native';
import Text from '~/components/style/CustomText';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import theme from '~/styles/theme';
import { d2p, dateCommentFormat, h2p, simpleDate } from '~/utils';
import ReviewIcon from '~/components/icon/reviewIcon';
import ReactionIcon from '~/components/icon/reactionIcon';
import { commentMore, marketIcon, more, reKnew, shareIcon, tag } from '~/assets/icons';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, okPopupState, popupState, refreshState, tokenState } from '~/recoil/atoms';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { bookmarkReview, getReviewDetail, likeReview, shareReview } from '~/api/review';
import FastImage from 'react-native-fast-image';
import Share from 'react-native-share';

import { ReviewListType } from '~/types/review';
import Loading from '~/components/loading';
import { FONT } from '~/styles/fonts';
import { noProfile } from '~/assets/images';
import { addReviewComment, deleteReviewComment, editReviewComment, getReviewComment, likeComment } from '~/api/comment';
import ReKnew from '~/components/review/reKnew';
import More from '~/components/more';
import { hitslop } from '~/utils/constant';
import { CacheManager, CachedImage } from '@georstat/react-native-image-cache';
import { Dirs } from 'react-native-file-access';
import {
  ImageGallery,
  ImageObject,
} from '@georstat/react-native-image-gallery';
import axios from 'axios';
import Recomment from '~/screens/feed/comment/recomment';
import { CommentListType } from '~/types/comment';
import SplashScreen from 'react-native-splash-screen';
import ImageFlatlist from '~/screens/feed/ImageFlatlist';
import { MyProfileType } from '~/types/user';
import { getMyProfile } from '~/api/user';

interface FeedDetailProps {
  navigation: NavigationStackProp
  route: NavigationRoute<{
    id: number,
    badge: string,
    isLike: boolean,
    isBookmark: boolean,
    authorId: number,
    toComment?: boolean
  }>;
}

CacheManager.config = {
  baseDir: `${Dirs.CacheDir}/images_cache/`,
  blurRadius: 15,
  sourceAnimationDuration: 1000,
  thumbnailAnimationDuration: 1000,
  cacheLimit: 0
};

const FeedDetail = ({ route, navigation }: FeedDetailProps) => {
  const [inputHeight, setInputHeight] = useState(getBottomSpace());
  const token = useRecoilValue(tokenState);
  const inputRef = useRef<TextInput>(null);
  const [isMoreClick, setIsMoreClick] = useState<boolean>();
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();

  const [commentIsEdit, setCommentIsEdit] = useState<boolean>(false);
  const [modifyingIdx, setModifyingIdx] = useState(-1);
  const [editCommentId, setEditCommentId] = useState<number>(-1);
  const [tags, setTags] = useState<Array<string>>([]);
  const [content, setContent] = useState<string>("");
  const [commentSelectedIdx, setCommentSelectedIdx] = useState<number>(-1);
  const [like, setLike] = useState<boolean>(false);
  const [cart, setCart] = useState<boolean>(false);
  const [numberLine, setNumberLine] = useState(1);

  const [recommentMode, setRecommentMode] = useState(false);
  const [recommentName, setRecommentName] = useState("");
  const [commentParentId, setCommentParentId] = useState<number | null>(null);
  const [apiBlock, setApiBlock] = useState(false);
  const [commentLayoutHeight, setCommentLayoutHeight] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);

  const setRefresh = useSetRecoilState(refreshState);
  const setModalOpen = useSetRecoilState(okPopupState);
  const setIspopupOpen = useSetRecoilState(popupState);

  const detailScrollRef = useRef<FlatList>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const openGallery = (idx: number) => {
    setIsOpen(true);
    setInitialIndex(idx);
  };
  const closeGallery = () => setIsOpen(false);
  const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token,
  });

  const reviewDetailQuery = useQuery<ReviewListType, Error>(["reviewDetail", token, route.params?.id],
    async () => {
      if (route.params) {
        const detail = await getReviewDetail(token, route.params.id);
        return detail;
      }
    }, {
    enabled: !!route.params?.id,
    onSuccess: (data) => {
      if (data) {
        setLike(data.isLike);
        setCart(data.isBookmark);
      }
    },
    onSettled: () => SplashScreen.hide(),
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        //@ts-ignore
        if (error.response.data.detail === "Not found.") {
          setIspopupOpen({ isOpen: true, content: "이미 삭제된 리뷰입니다." });
          navigation.goBack();
        }
      }
    },
  });

  const likeReviewMutation = useMutation('likeReview',
    ({ id, state }: { id: number, state: boolean }) => likeReview(token, id, state), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
      setRefresh(true);
    }
  });

  const boomarkMutation = useMutation("bookmark",
    ({ id, state }: { id: number, state: boolean }) => bookmarkReview(token, id, state), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
      setRefresh(true);
    }
  });

  const shareMutation = useMutation("share", ({ id }: { id: number }) => shareReview({ token, id }), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
      setRefresh(true);
    }
  });


  const commentListQuery = useInfiniteQuery<CommentListType[], Error>(['getCommentList', token, route.params?.id], async ({ pageParam = 0 }) => {
    if (route.params) {
      const comments = await getReviewComment({ token, reviewId: route.params?.id, offset: pageParam, limit: 10 });
      return comments;
    }
  }, {
    getNextPageParam: (next, all) => all.flat().length ?? undefined,
    enabled: !!route.params?.id
  });

  const addCommentMutation = useMutation('addComment', async ({ reviewId, comment, parentId }: { reviewId: number, comment: string, parentId?: number }) => {
    if (recommentMode) {
      const addComments = addReviewComment({ token, reviewId, content: comment, parentId });
      return addComments;
    }
    else {
      const addComments = addReviewComment({ token, reviewId, content: comment });
      return addComments;
    }
  }, {
    onSuccess: () => {
      if (recommentMode) {
        setRecommentMode(false);
        setRecommentName("");
        setCommentParentId(null);
      }
      queryClient.invalidateQueries('getCommentList');
      queryClient.invalidateQueries("reviewList");
      queryClient.setQueryData<ReviewListType | undefined>(["reviewDetail", token, route.params?.id], (postData) => {
        if (postData) {
          return { ...postData, commentCount: postData.commentCount + 1 };
        }
      });
      Keyboard.dismiss();
    },
    onSettled: () => setCommentLoading(false)
  });

  const editCommentMutation = useMutation('editComment', async ({ reviewId, commentId, comment }: { reviewId: number, commentId: number, comment: string }) =>
    editReviewComment({ token, reviewId, commentId, content: comment }), {
    onSuccess: () => {
      setCommentIsEdit(false);
      queryClient.invalidateQueries('getCommentList');
      Keyboard.dismiss();
    },
    onSettled: () => setCommentLoading(false)
  });

  const deleteCommentMutation = useMutation('deleteComment', (id: number) =>
    deleteReviewComment(token, id), {
    onSuccess: () => {
      queryClient.invalidateQueries('getCommentList');
      queryClient.invalidateQueries("reviewList");
      queryClient.setQueryData<ReviewListType | undefined>(["reviewDetail", token, route.params?.id], (postData) => {
        if (postData) {
          return { ...postData, commentCount: postData.commentCount - 1 };
        }
      });
    },
    onSettled: () => setCommentLoading(false)
  });

  const commentLikeMutation = useMutation("likeCount", ({ commentId, isLike }: { commentId: number, isLike: boolean }) =>
    likeComment({ token, commentId, isLike }), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("getCommentList");
    },
    onSettled: () => setApiBlock(false)
  });

  const handleWriteComment = () => {
    if (content === "") {
      return;
    }

    setCommentLoading(true);
    if (route.params) {
      if (commentIsEdit) {
        editCommentMutation.mutate({ reviewId: route.params?.id, commentId: editCommentId, comment: content });
      } else {
        if (recommentMode && commentParentId) {
          addCommentMutation.mutate({ reviewId: route.params?.id, comment: content, parentId: commentParentId });
        }
        else {
          addCommentMutation.mutate({ reviewId: route.params?.id, comment: content });
        }
      }
    }
    setContent("");
  };

  const renderCustomImage = (image: ImageObject, currentIndex: number) => {
    return (
      <Pressable
        onPress={closeGallery}
        style={{
          alignItems: 'center',
          borderRadius: 11,
          height: '100%',
          justifyContent: 'center',
          paddingHorizontal: d2p(24),
          width: '100%',
        }}>
        <CachedImage
          resizeMode="cover"
          source={image.url}
          style={{
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec,
            overflow: 'hidden',
            aspectRatio: 1,
            width: Dimensions.get("window").width - d2p(30),
          }}
          thumbnailSource={image.thumbUrl}
        />
      </Pressable>
    );
  };

  const renderHeaderComponent = () => {
    return (
      <View
        style={{
          paddingHorizontal: d2p(20),
          marginTop: isIphoneX() ? getStatusBarHeight() : 0,
          paddingVertical: h2p(20),
        }}>
        <LeftArrowIcon
          onBackClick={closeGallery}
          imageStyle={{ width: d2p(11), height: d2p(25), tintColor: theme.color.white }}
        />
      </View>
    );
  };


  // * 키보드 높이 컨트롤
  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", (e) => {
      setInputHeight(0);
    });
    Keyboard.addListener("keyboardWillHide", (e) => {
      setInputHeight(getBottomSpace());
      setCommentIsEdit(false);
    });
  }, []);

  useEffect(() => {
    if (!commentIsEdit) {
      setContent('');
    }
  }, [commentIsEdit]);

  useEffect(() => {
    if (reviewDetailQuery.data?.tags.interest) {
      setTags(reviewDetailQuery?.data.tags.interest);
    }
  }, [reviewDetailQuery.data]);

  // * 댓글위치로 스크롤
  useEffect(() => {
    if (route.params?.toComment) {
      detailScrollRef.current?.scrollToOffset({ offset: commentLayoutHeight, animated: true });
    }
  }, [route.params, commentLayoutHeight]);

  function detailHeader() {
    return (
      <View onLayout={(event) => {
        const layout = event.nativeEvent.layout;
        setCommentLayoutHeight(layout.height - 20);
      }}>
        {reviewDetailQuery.data &&
          <More
            review={reviewDetailQuery.data}
            userId={reviewDetailQuery.data?.author.id}
            isMoreClick={isMoreClick}
            type="review"
            isGobacK={() => navigation.goBack()}
            handleCloseMore={() => setIsMoreClick(false)}
          />
        }
        <View
          style={{
            paddingHorizontal: d2p(20), flexDirection: 'row', justifyContent: 'space-between',
            alignItems: "center"
          }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Mypage", { id: reviewDetailQuery.data?.author.id })}
            style={{
              borderRadius: 40,
              height: d2p(40),
              width: d2p(40),
              overflow: "hidden",
              borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec
            }}>
            <FastImage
              resizeMode="cover"
              source={reviewDetailQuery.data?.author.profileImage ?
                { uri: reviewDetailQuery.data?.author.profileImage } : noProfile}
              style={{
                width: d2p(40), height: d2p(40)
              }}
            />
          </TouchableOpacity>

          <View style={{
            width: Dimensions.get('window').width - d2p(115),
            paddingLeft: d2p(10)
          }}>
            <View style={{ alignItems: "center", flexWrap: "wrap" }}>
              <TouchableOpacity onPress={() => navigation.navigate("Mypage", { id: reviewDetailQuery.data?.author.id })}>
                <Text style={[styles.writer, FONT.Medium]}>
                  {reviewDetailQuery.data?.author.nickname}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[FONT.Regular, { marginTop: h2p(5), fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
              {reviewDetailQuery.data?.author.tags.foodStyle}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", }}>
            <TouchableOpacity onPress={() => setIsMoreClick((isClick) => !isClick)}>
              <Image
                source={more}
                resizeMode="contain"
                style={{ width: d2p(26), height: d2p(16) }}
              />
            </TouchableOpacity>
            <Text style={[{
              marginTop: h2p(10),
              fontSize: 10, color: theme.color.grayscale.a09ca4
            }, FONT.Regular]}>
              {(reviewDetailQuery.data) && simpleDate(reviewDetailQuery.data?.created, ' 전')}
            </Text>
          </View>
        </View>

        <View style={{
          paddingTop: h2p(20), paddingHorizontal: d2p(20),
          flexDirection: "row", justifyContent: "space-between",
          alignItems: "center"
        }}>
          {reviewDetailQuery.data &&
            <ReviewIcon review={reviewDetailQuery.data?.satisfaction} />}
          {reviewDetailQuery.data?.market &&
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={marketIcon} style={{ width: d2p(16), height: d2p(16), marginRight: d2p(5) }} />
              <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
                {reviewDetailQuery.data?.market}
              </Text>
            </View>
          }
        </View>
        {reviewDetailQuery.data?.product &&
          <View style={{
            marginLeft: d2p(20),
            marginTop: h2p(20),
            flexDirection: 'row',
          }}>
            <TouchableOpacity
              onPress={() => {
                // navigation.navigate("ProductDetail")
                navigation.navigate("ProductDetailReady");
              }}
              style={{
                backgroundColor: "rgba(234,231,236,0.4)",
                paddingHorizontal: d2p(5),
                paddingVertical: h2p(4),
                borderRadius: 4
              }}>
              <Text style={[FONT.Medium, { color: theme.color.grayscale.C_79737e, }]}>
                {`${reviewDetailQuery.data?.product.name} >`}
              </Text>
            </TouchableOpacity>
          </View>
        }
        <Text style={[styles.content,
        { marginHorizontal: d2p(20), lineHeight: 21 }, FONT.Regular]}>
          {reviewDetailQuery.data?.content}
        </Text>

        {/* 이미지 스크롤 ui */}
        {reviewDetailQuery.data?.images &&
          <ImageFlatlist
            onPress={(openIdx: number) => openGallery(openIdx)}
            data={reviewDetailQuery.data?.images}
          />
        }
        {!reviewDetailQuery.data?.parent &&
          <>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              width: Dimensions.get("window").width - d2p(90),
              flexWrap: "wrap",
              marginHorizontal: d2p(20),
              marginTop: h2p(10)
            }}>
              <Image source={tag} style={{ width: d2p(10), height: d2p(10), marginRight: d2p(5) }} />
              {React.Children.toArray(tags.map((v) => {
                if (v === route.params?.badge) {
                  return;
                }
                return <Text style={[FONT.Regular, { color: theme.color.grayscale.C_79737e, fontSize: 12 }]}>
                  #{v} </Text>;
              }))}
              {
                route.params?.badge ?
                  <Text style={[FONT.Regular, { color: theme.color.main, fontSize: 12 }]}>#{route.params?.badge}</Text>
                  :
                  null
              }
            </View>
          </>
        }

        {reviewDetailQuery.data?.parent &&
          <>
            <View style={{
              marginTop: h2p(20),
              marginLeft: d2p(20),
              marginRight: d2p(20),
              borderWidth: 1,
              borderColor: theme.color.grayscale.eae7ec,
              borderRadius: 10,
              paddingHorizontal: d2p(15),
            }}>
              <ReKnew
                type="detail"
                review={{ ...reviewDetailQuery.data.parent }}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate("FeedDetail",
                  { id: reviewDetailQuery.data.parent?.id })}
                style={{
                  marginTop: h2p(15),
                  marginBottom: h2p(10),
                  marginLeft: d2p(25),
                  width: d2p(155), height: h2p(40),
                  borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
                  justifyContent: "center", alignItems: "center", borderRadius: 5
                }}>
                <Text style={[FONT.Medium, { fontSize: 12, color: theme.color.grayscale.C_443e49 }]}>
                  원문으로</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        <View style={[styles.reactionContainer, { paddingTop: reviewDetailQuery.data?.parent ? 0 : h2p(10) }]}>
          {/* 인용글에서는 리트윗 아이콘 삭제 */}
          {!reviewDetailQuery.data?.parent &&
            <TouchableOpacity
              onPress={() => navigation.navigate("Write",
                {
                  loading: false, isEdit: false, type: "reKnewWrite", review: reviewDetailQuery.data,
                  nickname: getMyProfileQuery.data?.nickname
                })}
              style={{
                flexDirection: "row",
                alignItems: "center"
              }}>
              <Image source={reKnew} style={{
                width: d2p(24),
                height: d2p(24),
                marginRight: d2p(10)
              }} />
              <Text style={[FONT.Regular, {
                fontSize: 12,
                color: theme.color.grayscale.C_79737e
              }]}>{reviewDetailQuery.data?.childCount}</Text>
            </TouchableOpacity>
          }

          <ReactionIcon name="like" count={reviewDetailQuery.data?.likeCount} state={like}
            isState={(isState: boolean) => setLike(isState)} mutation={likeReviewMutation} id={route.params?.id} />
          <ReactionIcon name="cart" state={cart} count={reviewDetailQuery.data?.bookmarkCount}
            mutation={boomarkMutation}
            id={route.params?.id}
            isState={(isState: boolean) => setCart(isState)} />
          <TouchableOpacity
            onPress={() => {
              Share.open({
                title: "뉴뉴",
                url: `knewnnew://FeedDetail/${reviewDetailQuery.data?.id}`
                // url: `https://knewnnew.co.kr/FeedDetail/${review.id}`
              })
                .then((res) => {
                  if (reviewDetailQuery.data?.id) {
                    shareMutation.mutate({ id: reviewDetailQuery.data.id });
                  }
                })
                .catch((err) => {
                  err && console.log(err);
                });
            }}
            style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={shareIcon} style={{ width: d2p(26), height: d2p(26) }} />
            <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.grayscale.C_79737e, marginLeft: d2p(9) }]}>
              {reviewDetailQuery.data?.shareCount}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.commentMeta, FONT.Bold]}>작성된 댓글 {reviewDetailQuery.data?.commentCount}개</Text>
      </View>
    );
  }

  const detailRenderItem = useCallback(({ item, index }) => {
    return (
      <Pressable
        onPress={() => setCommentSelectedIdx(-1)}>
        <>
          <View
            style={{
              paddingHorizontal: d2p(20),
              paddingTop: h2p(10),
              paddingBottom: h2p(14.5),
              backgroundColor: (index === modifyingIdx) && commentIsEdit ? theme.color.grayscale.f7f7fc : theme.color.white
            }}>
            {item.isActive ?
              <>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}>
                  <TouchableOpacity onPress={() => navigation.navigate("Mypage", { id: item.author.id })}
                    style={styles.commentProfileLine}>
                    <FastImage source={item.author.profileImage ? { uri: item.author.profileImage } : noProfile}
                      style={styles.commentImg} />
                  </TouchableOpacity>
                  <View style={{
                    flexDirection: "row", justifyContent: "space-between",
                    width: Dimensions.get("window").width - d2p(70),
                  }}>
                    <View style={{ marginLeft: d2p(10) }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity
                          style={{ flexDirection: "row" }}
                          onPress={() => navigation.navigate("Mypage", { id: item.author.id })}>
                          <Text style={[FONT.Medium, { fontSize: 14 }]}>{item.author.nickname}</Text>
                          {item.author.id === reviewDetailQuery.data?.author.id &&
                            <View style={{
                              width: d2p(38),
                              justifyContent: "center", alignItems: "center",
                              marginLeft: d2p(5),
                              backgroundColor: theme.color.white,
                              borderRadius: 4, borderWidth: 1, borderColor: theme.color.grayscale.d2d0d5
                            }}>
                              <Text style={[FONT.Medium, { fontSize: 10, color: theme.color.grayscale.C_79737e }]}>
                                작성자</Text>
                            </View>
                          }
                        </TouchableOpacity>
                        <Text style={[styles.commentDate, FONT.Regular]}>{dateCommentFormat(item.created)}</Text>
                      </View>
                    </View>
                    {myId === item.author.id &&
                      <TouchableOpacity onPress={() => {
                        if (commentSelectedIdx === index) {
                          setCommentSelectedIdx(-1);
                        } else {
                          setCommentSelectedIdx(index);
                        }
                      }}>
                        <Image
                          source={commentMore}
                          resizeMode="contain"
                          style={{ width: d2p(12), height: d2p(16) }}
                        />
                      </TouchableOpacity>
                    }
                  </View>
                </View>
                <Text style={[styles.commentContent, FONT.Regular]}>{item.content}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginLeft: d2p(40), marginTop: h2p(10) }}>
                  <TouchableOpacity
                    hitSlop={hitslop}
                    onPress={() => {
                      inputRef.current?.focus();
                      setCommentParentId(item.id);
                      setRecommentName(item.author.nickname);
                      setRecommentMode(true);
                      // * 답글달기 클릭하면 해당 아이템 인덱스로 스크롤
                      if (Platform.OS === "ios") {
                        setTimeout(() => {
                          detailScrollRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0, viewOffset: -15 });
                        }, 200);
                      }
                    }}>
                    <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.C_79737e }]}>답글달기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: d2p(20) }}
                    hitSlop={hitslop}
                    onPress={() => {
                      setApiBlock(true);
                      if (!apiBlock) {
                        commentLikeMutation.mutate({ commentId: item.id, isLike: !item.isLike });
                      }
                    }}>
                    <Text style={[(item.isLike ? FONT.Bold : FONT.Regular), {
                      fontSize: 12, color: item.isLike ? theme.color.grayscale.C_443e49 : theme.color.grayscale.C_79737e
                    }]}>좋아요 {item.likeCount > 0 && item.likeCount}</Text>
                  </TouchableOpacity>
                </View>
              </> :
              <Text style={[FONT.Regular, { fontSize: 15, color: theme.color.grayscale.C_79737e }]}>
                삭제된 댓글입니다.
              </Text>
            }
            {commentSelectedIdx === index &&
              <View style={[styles.clickBox, { right: d2p(32) }]}>
                <Pressable
                  style={{
                    justifyContent: "center", alignItems: "center", width: d2p(70), height: d2p(35)
                  }}
                  onPress={() => {
                    setContent(item.content);
                    setCommentIsEdit(true);
                    setModifyingIdx(commentSelectedIdx);
                    setEditCommentId(item.id);
                    setCommentSelectedIdx(-1);
                  }}>
                  <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>수정</Text>
                </Pressable>
                <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
                <Pressable
                  style={{ justifyContent: "center", alignItems: "center", width: d2p(70), height: d2p(35) }}
                  onPress={() => {
                    setModalOpen({
                      isOpen: true,
                      content: "댓글을 삭제할까요?",
                      okButton: () => {
                        setCommentLoading(true);
                        deleteCommentMutation.mutate(item.id);
                      }
                    });
                    setCommentSelectedIdx(-1);
                  }}>
                  <Text style={[{ color: theme.color.main }, FONT.Regular]}>삭제</Text>
                </Pressable>
              </View>
            }
          </View>
          {/* 대댓글 ui */}
          {item.child ?
            <Recomment
              reviewId={reviewDetailQuery.data?.author.id}
              modifyingIdx={modifyingIdx}
              commentIsEdit={commentIsEdit}
              setModifyingIdx={(mdIdx: number) => setModifyingIdx(mdIdx)}
              setContent={(reContent: string) => setContent(reContent)}
              setCommentIsEdit={(isEdit: boolean) => setCommentIsEdit(isEdit)}
              setEditCommentId={(editId: number) => setEditCommentId(editId)}
              setCommentSelectedIdx={(selectIdx: number) => setCommentSelectedIdx(selectIdx)}
              child={item.child} authorName={item.author.nickname} />
            :
            <View style={styles.commentLine} />
          }
        </>
      </Pressable>
    );
  }, [navigation, commentSelectedIdx,
    reviewDetailQuery.data?.author.id,
    commentIsEdit, commentLikeMutation]);


  if (reviewDetailQuery.isLoading || reviewDetailQuery.isFetching) {
    return (
      <>
        <Header
          isBorder={true}
          headerLeft={<LeftArrowIcon onBackClick={() => {
            if (route.path) {
              //@ts-ignore
              navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
            }
            else {
              navigation.navigate("Feed");
            }
          }}
            imageStyle={{ width: d2p(11), height: d2p(25) }} />}
          title="게시글 상세"
        />
        <Loading />
      </>
    );
  }

  return (
    <Fragment>
      {/* 이미지 확대 */}
      <ImageGallery
        initialIndex={initialIndex}
        close={closeGallery}
        images={reviewDetailQuery.data?.images.map(v => ({ id: v.id, url: v.image, thumbUrl: v.image })) || []}
        isOpen={isOpen}
        setIsOpen={(open: boolean) => setIsOpen(open)}
        renderCustomImage={renderCustomImage}
        renderHeaderComponent={renderHeaderComponent}
        resizeMode="contain"
        thumbSize={84}
      />
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => {
          if (route.path) {
            // * 공유하기로 들어와서 뒤로가기 눌렀을 경우 home으로 reset
            //@ts-ignore
            navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
          }
          else {
            navigation.goBack();
            // navigation.navigate("Feed");
          }
        }}
          imageStyle={{ width: d2p(11), height: d2p(25) }} />}
        title="게시글 상세"
      />
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -285}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {commentLoading &&
          <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.2)"
          }}>
            <Loading />
          </View>
        }
        <FlatList
          ref={detailScrollRef}
          contentContainerStyle={{ paddingBottom: h2p(30) }}
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: h2p(20), flex: 1 }}
          data={commentListQuery.data?.pages.flat()}
          ListHeaderComponent={detailHeader()}
          ListEmptyComponent={() => {
            if (commentListQuery.isLoading) {
              return (
                <Loading viewStyle={{ top: h2p(0), position: "relative" }} />
              );
            }
            return null;
          }}
          renderItem={detailRenderItem}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (commentListQuery.data &&
              commentListQuery.data.pages.flat().length > 9) {
              commentListQuery.fetchNextPage();
            }
          }}
        />
        {recommentMode &&
          <View style={{
            backgroundColor: theme.color.grayscale.f7f7fc,
            paddingVertical: h2p(10),
            paddingHorizontal: d2p(20),
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={[FONT.SemiBold, { fontSize: 13, color: theme.color.grayscale.a09ca4 }]}>
                {recommentName}
              </Text>
              <Text style={[FONT.Regular, { fontSize: 13, color: theme.color.grayscale.a09ca4 }]}>
                님에게 답글을 남기는 중
              </Text>
            </View>
            <TouchableOpacity onPress={() => setRecommentMode(false)}>
              <Text style={[FONT.Bold, { fontSize: 13, color: theme.color.grayscale.a09ca4 }]}>취소</Text>
            </TouchableOpacity>
          </View>
        }
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{
            borderTopColor: theme.color.grayscale.eae7ec,
            borderTopWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: Dimensions.get("window").width,
            height: numberLine < 4 ? d2p(50 + (numberLine - 1) * 25) : d2p(115),
            marginBottom: inputHeight,
            paddingVertical: h2p(13.5), paddingHorizontal: d2p(20),
            backgroundColor: theme.color.white
          }}>
          <TextInput
            autoCapitalize="none"
            ref={inputRef}
            style={[{
              color: theme.color.black,
              includeFontPadding: false,
              paddingTop: 0,
              paddingBottom: 0,
              width: Dimensions.get("window").width - d2p(84),
            }, FONT.Regular]}
            value={content}
            multiline
            numberOfLines={Platform.OS === "android" ? numberLine : 4}
            onContentSizeChange={e => setNumberLine(Math.round(e.nativeEvent.contentSize.height / 20))}
            maxLength={201}
            onChangeText={(e) => {
              if (e.length > 200) {
                setContent(e.slice(0, e.length - 1));
              }
              else {
                setContent(e);
              }
            }}
            placeholder="댓글을 남겨보세요." placeholderTextColor={theme.color.grayscale.d3d0d5} />
          <Pressable hitSlop={hitslop} onPress={handleWriteComment} style={{ alignSelf: "center" }}>
            <Text style={[{ color: content ? theme.color.main : theme.color.grayscale.a09ca4 }, FONT.Regular]}>{!commentIsEdit ? "작성" : "수정"}</Text>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Fragment >
  );
};

export default FeedDetail;

const styles = StyleSheet.create({
  writer: {
    fontSize: 16,
    marginRight: d2p(10)
  },
  sign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: h2p(10),
  },
  store: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
    marginRight: d2p(20)
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-evenly',
    paddingBottom: h2p(10.5),
    marginTop: h2p(5),
    borderBottomWidth: 1,
    borderBottomColor: theme.color.grayscale.eae7ec
  },
  content: {
    color: theme.color.grayscale.C_79737e,
    marginBottom: h2p(10), paddingTop: h2p(10)
  },
  commentLine: {
    borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc,
    width: Dimensions.get('window').width - d2p(40),
    marginTop: h2p(14), marginBottom: h2p(10)
  },
  commentMeta: {
    marginTop: h2p(20),
    paddingBottom: h2p(10),
    marginLeft: d2p(20),
    fontSize: 12,
    color: theme.color.grayscale.C_79737e,
  },
  commentImg: {
    width: d2p(30), height: d2p(30),
    borderRadius: 30,
    borderColor: theme.color.grayscale.e9e7ec, borderWidth: 1,

  },
  commentProfileLine: {
    width: d2p(30), height: d2p(30),
  },
  commentContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    position: 'relative', top: 6,
    marginLeft: d2p(38),
  },
  commentDate: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
    marginLeft: d2p(10)
  },
  commentContent: {
    color: theme.color.grayscale.C_443e49,
    marginLeft: d2p(40),
    fontSize: 15
  },
  clickBox: {
    width: d2p(70),
    height: d2p(70),
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 5,
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
    zIndex: 10,
  },
});