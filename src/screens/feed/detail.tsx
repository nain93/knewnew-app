import { View, Dimensions, StyleSheet, Pressable, Image, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, Keyboard, FlatList, StatusBar } from 'react-native';
import Text from '~/components/style/CustomText';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import theme from '~/styles/theme';
import { d2p, dateCommentFormat, h2p, simpleDate } from '~/utils';
import { blackComment, blackHeart, blackLeftArrow, blackMoreIcon, blackRightArrow, blackShare, colorBookmark, colorLike, commentMore, heart, lightHomeIcon, linkIcon, mainBookmark, marketIcon, more, reKnew, rightArrow, shareIcon, tag, tagHome, userIcon, whiteLeftArrow, whiteMoreIcon } from '~/assets/icons';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { bottomDotSheetState, myIdState, okPopupState, popupState, refreshState, tokenState } from '~/recoil/atoms';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import FastImage from 'react-native-fast-image';
import Share from 'react-native-share';

import { bookmarkReview, deleteReview, getReviewDetail, likeReview, shareReview } from '~/api/review';
import { ReviewListType } from '~/types/review';
import Loading from '~/components/loading';
import { FONT } from '~/styles/fonts';
import { noProfile } from '~/assets/images';
import { addReviewComment, deleteReviewComment, editReviewComment, getReviewComment, likeComment } from '~/api/comment';
import { hitslop } from '~/utils/constant';
import { CacheManager, CachedImage } from '@georstat/react-native-image-cache';
import { Dirs } from 'react-native-file-access';
import axios from 'axios';
import Recomment from '~/screens/feed/comment/recomment';
import { CommentListType } from '~/types/comment';
import SplashScreen from 'react-native-splash-screen';
import ImageFlatlist from '~/screens/feed/ImageFlatlist';
import { MyProfileType } from '~/types/user';
import { blockUser, getMyProfile } from '~/api/user';
import { addReport } from '~/api/report';
import ReviewIcon from '~/components/icon/reviewIcon';
import TopScrollButton from '~/components/button/topScrollButton';

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
  const token = useRecoilValue(tokenState);
  const inputRef = useRef<TextInput>(null);
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();

  const [commentIsEdit, setCommentIsEdit] = useState<boolean>(false);
  const [modifyingIdx, setModifyingIdx] = useState(-1);
  const [editCommentId, setEditCommentId] = useState<number>(-1);
  const [content, setContent] = useState<string>("");
  const [like, setLike] = useState<boolean>(false);
  const [cart, setCart] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState(0);
  const [numberLine, setNumberLine] = useState(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isCommentFoucs, setIsCommentFoucs] = useState(false);

  const [recommentMode, setRecommentMode] = useState(false);
  const [recommentName, setRecommentName] = useState("");
  const [commentParentId, setCommentParentId] = useState<number | null>(null);
  const [apiBlock, setApiBlock] = useState(false);
  const [commentLayoutHeight, setCommentLayoutHeight] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);

  const setRefresh = useSetRecoilState(refreshState);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const setIspopupOpen = useSetRecoilState(popupState);
  const setIsBottomDotSheet = useSetRecoilState(bottomDotSheetState);

  const detailScrollRef = useRef<FlatList>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
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
        setLikeCount(data.likeCount);
        setLike(data.isLike);
        setCart(data.isBookmark);
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        //@ts-ignore
        if (error.response.data.detail === "Not found.") {
          setIspopupOpen({ isOpen: true, content: "이미 삭제된 리뷰입니다." });
          navigation.goBack();
        }
      }
    },
    onSettled: () => {
      if (route.path) {
        // * 딥링크 타고 들어왔을경우 SplashScreen hide
        SplashScreen.hide();
      }
    }
  });

  const likeReviewMutation = useMutation('likeReview',
    ({ id, state }: { id: number, state: boolean }) => likeReview(token, id, state), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
      setRefresh(true);
    }
  });

  const bookmarkMutation = useMutation("bookmark",
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


  const commentListQuery = useQuery<CommentListType[], Error>(['getCommentList', token, route.params?.id], async () => {
    if (route.params) {
      const comments = await getReviewComment({ token, reviewId: route.params?.id, offset: 0, limit: 3 });
      return comments;
    }
  }, {
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
      navigation.navigate("CommentAll", { id: route.params?.id });
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

  const addReportMutation = useMutation("addReport", ({ commentContent, commentId }: { commentContent: string, commentId: number }) =>
    addReport({ token, objectType: "review_comment", qnaType: "report", content: commentContent, reviewComment: commentId })
    , {
      onSuccess: () => {
        setIspopupOpen({ isOpen: true, content: "신고 되었습니다" });
      }
    }
  );

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
          ...data, pages: [data.pages.flat().filter(v => v.id !== reviewDetailQuery.data.id).map(v => {
            if (v.parent?.id === reviewDetailQuery.data?.id) {
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
        return { ...data, pages: [data.pages.flat().filter(v => v.id !== reviewDetailQuery.data.id)] };
      }
    });
    queryClient.setQueriesData("userBookmarkList", (data) => {
      if (data) {
        //@ts-ignore
        return { ...data, pages: [data.pages.flat().filter(v => v.id !== reviewDetailQuery.data.id)] };
      }
    });
    if (reviewDetailQuery.data) {
      deleteMutation.mutate(reviewDetailQuery.data?.id);
    }
  };

  const handleEditPress = () => {
    if (reviewDetailQuery.data?.parent) {
      navigation.navigate("Write", {
        loading: true, isEdit: true, type: "reknew",
        nickname: reviewDetailQuery.data?.author.nickname, review: reviewDetailQuery.data
      });
    }
    else {
      navigation.navigate("Write", { loading: true, isEdit: true, review: reviewDetailQuery.data });
    }
  };

  // * 딥링크 생성
  async function buildLink(reviewId?: number) {
    try {
      if (__DEV__) {
        const link = await dynamicLinks().buildShortLink({
          link: `https://dlink.knewnew.co.kr/link?id=${reviewId}`,
          domainUriPrefix: 'https://dlink.knewnew.co.kr',
          android: {
            packageName: "com.mealing.knewnnew"
          },
          ios: {
            appStoreId: "1626766280",
            bundleId: "com.mealing.knewnnew"
          }
        }, dynamicLinks.ShortLinkType.DEFAULT
        );
        return link;
      }
      else {
        const link = await dynamicLinks().buildShortLink({
          link: `https://link.knewnew.co.kr/link?id=${reviewId}`,
          domainUriPrefix: 'https://link.knewnew.co.kr',
          android: {
            packageName: "com.mealing.knewnnew"
          },
          ios: {
            appStoreId: "1626766280",
            bundleId: "com.mealing.knewnnew"
          }
        }, dynamicLinks.ShortLinkType.DEFAULT
        );
        return link;
      }
    }

    catch (error) {
      console.log(error, 'error');
    }
  }


  const statusBarState = () => {
    if (scrollPosition >= Dimensions.get("window").width / 2) {
      return true;
    }
    return false;
  };

  // * 키보드 높이 컨트롤
  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // if (Platform.OS === "android") {
      //   setKeyboardHeight(e.endCoordinates.height);
      // }
      // else {
      //   setKeyboardHeight(0);
      // }
    });
    Keyboard.addListener("keyboardWillHide", (e) => {
      setKeyboardHeight(0);
      setCommentIsEdit(false);
    });
  }, []);

  useEffect(() => {
    if (!commentIsEdit) {
      setContent('');
    }
  }, [commentIsEdit]);

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
        {/* 이미지 스크롤 ui */}
        {reviewDetailQuery.data?.images &&
          <ImageFlatlist
            onPress={(openIdx: number) => openGallery(openIdx)}
            review={reviewDetailQuery.data}
          />}
        <View
          style={{
            paddingHorizontal: d2p(20), flexDirection: 'row',
            alignItems: "center",
            marginBottom: h2p(30),
            paddingVertical: h2p(16),
            borderBottomWidth: 1,
            borderBottomColor: theme.color.grayscale.f7f7fc
          }}>
          <TouchableOpacity
            onPress={() => { navigation.push("UserPage", { id: reviewDetailQuery.data?.author.id }); }}
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

          <View style={{ marginLeft: d2p(10) }}>
            <View style={{ alignItems: "center", flexWrap: "wrap" }}>
              <TouchableOpacity
                onPress={() => navigation.push("UserPage", { id: reviewDetailQuery.data?.author.id })}
                style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.writer, FONT.Medium]}>
                  {reviewDetailQuery.data?.author.nickname}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[FONT.Regular, {
              fontSize: 12,
              color: theme.color.grayscale.C_9F9CA3,
              marginTop: h2p(5)
            }]}>
              팔로워 60
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => console.log("구독하기")}
            style={{
              backgroundColor: theme.color.grayscale.f7f7fc,
              marginLeft: "auto",
              paddingHorizontal: d2p(12),
              paddingVertical: h2p(8),
              borderRadius: 2
            }}>
            <Text style={[FONT.Medium, { fontSize: 12 }]}>구독하기</Text>
          </TouchableOpacity>
        </View>
        {
          reviewDetailQuery.data?.satisfaction &&
          <ReviewIcon
            viewStyle={{ marginLeft: d2p(20) }}
            review={reviewDetailQuery.data?.satisfaction} />
        }
        <Text style={[FONT.Bold, {
          marginLeft: d2p(20),
          marginVertical: h2p(20),
        }]}>
          사놓으면 활용도 좋은템이에요!
        </Text>

        <Text style={[styles.content,
        { marginHorizontal: d2p(20), lineHeight: 21 }, FONT.Regular]}>
          {reviewDetailQuery.data?.content}
        </Text>

        <Text style={[{
          marginTop: h2p(20),
          marginLeft: d2p(20),
          marginBottom: h2p(30),
          fontSize: 12, color: theme.color.grayscale.d2d0d5
        }, FONT.Regular]}>
          {(reviewDetailQuery.data) && simpleDate(reviewDetailQuery.data?.created, ' 전')}
        </Text>

        <View style={{ paddingHorizontal: d2p(20), backgroundColor: theme.color.grayscale.f7f7fc }}>
          <Text style={[FONT.SemiBold, { flexWrap: "wrap", marginTop: h2p(30) }]}>
            {reviewDetailQuery.data?.author.nickname}님의 구매정보
          </Text>
          <View style={{
            backgroundColor: theme.color.white,
            flexDirection: "row", alignItems: "center",
            width: Dimensions.get("window").width - d2p(40),
            paddingHorizontal: d2p(10),
            paddingVertical: h2p(10),
            marginTop: h2p(10),
            borderRadius: 5,
            borderColor: theme.color.grayscale.e9e7ec,
            borderWidth: 1
          }}>
            <View style={{
              width: d2p(60), height: d2p(60),
              borderColor: theme.color.grayscale.e9e7ec,
              borderWidth: 1,
              borderRadius: 2,
              marginRight: d2p(10)
            }} />
            <View style={{ width: Dimensions.get("window").width - d2p(164) }}>
              <Text style={FONT.Medium}>
                {reviewDetailQuery.data?.product?.name}
              </Text>
              <Text style={[FONT.Regular, {
                marginTop: h2p(10),
                fontSize: 12, color: theme.color.grayscale.C_9F9CA3
              }]}>
                마켓컬리・15,800원
              </Text>
            </View>
            <Image source={blackRightArrow} style={{
              marginLeft: "auto",
              width: d2p(7), height: d2p(12),
              marginRight: d2p(8)
            }} />
          </View>
          <View style={{
            backgroundColor: theme.color.white,
            flexDirection: "row", alignItems: "center",
            width: Dimensions.get("window").width - d2p(40),
            paddingVertical: h2p(12),
            justifyContent: "center",
            borderRadius: 5,
            marginBottom: h2p(24),
            marginTop: h2p(10),
            borderWidth: 1
          }}>
            <Image source={linkIcon} style={{ width: d2p(15), height: d2p(7.5), marginRight: d2p(6.5) }} />
            <Text style={FONT.Medium}>구매링크 바로가기</Text>
          </View>
        </View>

        <Text style={[FONT.SemiBold, {
          marginTop: h2p(30),
          marginBottom: h2p(10),
          marginLeft: d2p(20)
        }]}>댓글
          <Text style={[FONT.Regular, { color: theme.color.grayscale.C_9F9CA3 }]}>
            {` ${reviewDetailQuery.data?.commentCount}`}
          </Text>
        </Text>
      </View>
    );
  }

  const detailRenderItem = useCallback(({ item, index }: { item: CommentListType, index: number }) => {
    return (
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
                <TouchableOpacity onPress={() => navigation.push("UserPage", { id: item.author.id })}
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
                        onPress={() => navigation.push("UserPage", { id: item.author.id })}>
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
                  <TouchableOpacity onPress={() => {
                    // * 내 댓글
                    if (item.author.id === myId) {
                      setIsBottomDotSheet({
                        isOpen: true,
                        topTitle: "댓글 수정",
                        topPress: () => {
                          setContent(item.content);
                          setCommentIsEdit(true);
                          setEditCommentId(item.id);
                          setModifyingIdx(index);
                        },
                        middleTitle: "댓글 삭제",
                        middlePress: () => {
                          setModalOpen({
                            isOpen: true,
                            content: "댓글을 삭제할까요?",
                            okButton: () => {
                              setCommentLoading(true);
                              deleteCommentMutation.mutate(item.id);
                            }
                          });
                        },
                        middleTextStyle: { color: theme.color.main },
                        bottomTitle: "취소하기"
                      });
                    }
                    // * 다른유저 댓글
                    else {
                      setIsBottomDotSheet({
                        isOpen: true,
                        topTitle: "댓글 신고",
                        topPress: () => addReportMutation.mutate({ commentContent: item.content, commentId: item.id }),
                        topTextStyle: { color: theme.color.main },
                        bottomTitle: "취소하기"
                      });
                    }
                  }}>
                    <Image
                      source={commentMore}
                      resizeMode="contain"
                      style={{ width: d2p(12), height: d2p(16) }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.commentContent, FONT.Regular]}>{item.content}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: d2p(40), marginTop: h2p(10) }}>
                <TouchableOpacity
                  hitSlop={hitslop}
                  onPress={() => {
                    setIsCommentFoucs(true);
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 100);
                    setCommentParentId(item.id);
                    setRecommentName(item.author.nickname);
                    setRecommentMode(true);
                    // * 답글달기 클릭하면 해당 아이템 인덱스로 스크롤
                    setTimeout(() => {
                      detailScrollRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0, viewOffset: 80 });
                    }, 200);
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
            child={item.child} authorName={item.author.nickname}
            setCommentLoading={(isLoading: boolean) => setCommentLoading(isLoading)}
          />
          :
          <View style={styles.commentLine} />
        }
      </>
    );
  }, [navigation,
    reviewDetailQuery.data?.author.id,
    commentIsEdit, commentLikeMutation]);

  const detailFooter = useCallback(() => (
    <>
      <TouchableOpacity
        onPress={() => navigation.push("CommentAll",
          { id: route.params?.id })}
        style={{
          backgroundColor: theme.color.grayscale.f7f7fc,
          flexDirection: "row",
          width: Dimensions.get("window").width - d2p(40),
          paddingVertical: h2p(18),
          marginHorizontal: d2p(20),
          borderRadius: 5,
          justifyContent: "center",
          alignItems: "center",
          marginTop: h2p(5),
        }}>
        <Text style={FONT.Regular}>
          {reviewDetailQuery.data?.commentCount}개의 댓글 모두보기
        </Text>
        <Image source={blackRightArrow} style={{
          marginLeft: d2p(8),
          width: d2p(5.5), height: d2p(9)
        }} />
      </TouchableOpacity>
      {!isCommentFoucs &&
        <>
          <View style={{
            marginTop: h2p(20),
            width: Dimensions.get("window").width - d2p(40),
            marginHorizontal: d2p(20)
          }}>
            <Pressable
              onPress={() => {
                setIsCommentFoucs(true);
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 100);
              }}
              style={{
                borderColor: isCommentFoucs ? theme.color.main : theme.color.grayscale.d3d0d5,
                borderWidth: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                height: numberLine < 4 ? d2p(45 + (numberLine - 1) * 25) : d2p(115),
                paddingVertical: h2p(13.5), paddingHorizontal: d2p(20),
                backgroundColor: theme.color.white,
                borderRadius: 25,
              }}>
              <View
                style={{ width: Dimensions.get("window").width - d2p(104) }}>
                <Text style={[FONT.Regular, { color: theme.color.grayscale.d3d0d5 }]}>댓글을 남겨보세요.</Text>
              </View>
              <View style={{ alignSelf: "center" }}>
                <Text style={[{ color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>
                  작성</Text>
              </View>
            </Pressable>
          </View>
        </>
      }
    </>
  ), [reviewDetailQuery.data?.commentCount, isCommentFoucs]);

  if (reviewDetailQuery.isLoading || reviewDetailQuery.isFetching) {
    return (
      <>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <Loading />
      </>
    );
  }

  return (
    <Fragment>
      <StatusBar translucent={true} backgroundColor="transparent"
        barStyle={statusBarState() ? "dark-content" : "light-content"} />
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          width: Dimensions.get("window").width,
          paddingHorizontal: d2p(30),
          top: 0,
          paddingTop: getStatusBarHeight() + h2p(20),
          paddingBottom: h2p(15),
          flexDirection: "row", justifyContent: "space-between",
          backgroundColor: statusBarState() ? theme.color.white : "transparent",
          zIndex: 10
        }}>
        <Pressable
          hitSlop={hitslop}
          onPress={() => {
            if (route.path) {
              // * 공유하기로 들어와서 뒤로가기 눌렀을 경우 home으로 reset
              //@ts-ignore
              navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
            }
            else {
              navigation.goBack();
            }
          }}>
          <Image source={statusBarState() ? blackLeftArrow : whiteLeftArrow} style={{ width: d2p(8), height: d2p(16) }} />
        </Pressable>

        <Pressable
          hitSlop={hitslop}
          onPress={() => {
            if (reviewDetailQuery.data?.author.id === myId) {
              setIsBottomDotSheet({
                isOpen: true,
                topTitle: "푸드로그 수정",
                topPress: () => handleEditPress(),
                middleTitle: "푸드로그 삭제",
                middlePress: () => {
                  setModalOpen({
                    isOpen: true,
                    content: "글을 삭제할까요?",
                    okButton: () => {
                      handleDeletePress();
                      navigation.goBack();
                    }
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
                topPress: () => navigation.navigate("report", { review: reviewDetailQuery.data }),
                middleTitle: "유저 차단",
                middlePress: () => {
                  setModalOpen({
                    isOpen: true,
                    content: "차단 하시겠습니까?",
                    okButton: () => {
                      if (reviewDetailQuery.data) {
                        blockMutation.mutate({ id: reviewDetailQuery.data?.author.id, isBlock: true });
                        navigation.goBack();
                      }
                    }
                  });
                },
                middleTextStyle: { color: theme.color.main },
                bottomTitle: "취소하기"
              });
            }
          }}>
          <Image source={statusBarState() ? blackMoreIcon : whiteMoreIcon} style={{ width: d2p(4), height: d2p(18) }} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0)" }}>
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
          bounces={false}
          onScroll={e => setScrollPosition(e.nativeEvent.contentOffset.y)}
          ref={detailScrollRef}
          contentContainerStyle={{ paddingBottom: h2p(120) }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          data={commentListQuery.data}
          ListHeaderComponent={detailHeader()}
          ListFooterComponent={detailFooter}
          ListEmptyComponent={() => {
            if (commentListQuery.isLoading) {
              return (
                <Loading viewStyle={{ top: h2p(0), position: "relative" }} />
              );
            }
            return null;
          }}
          renderItem={detailRenderItem}
        />

        {/* 최상단으로 스크롤하는 버튼 */}
        <TopScrollButton scrollRef={detailScrollRef} />

        {/* 댓글 인풋 */}
        {isCommentFoucs ?
          <View style={{
            width: Dimensions.get("window").width - d2p(40),
            marginHorizontal: d2p(20),
            position: "absolute",
            bottom: 0,
          }}>
            {recommentMode &&
              <View style={{
                backgroundColor: theme.color.white,
                paddingVertical: h2p(10),
                paddingHorizontal: d2p(20),
                flexDirection: "row",
                justifyContent: "space-between",
                borderRadius: 25,
                marginBottom: h2p(2)
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
                borderColor: isCommentFoucs ? theme.color.main : theme.color.grayscale.d3d0d5,
                borderWidth: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                height: numberLine < 4 ? d2p(45 + (numberLine - 1) * 25) : d2p(115),
                paddingVertical: h2p(13.5), paddingHorizontal: d2p(20),
                backgroundColor: theme.color.white,
                borderRadius: 25,
                marginBottom: keyboardHeight + h2p(20),
              }}>
              <TextInput
                onBlur={() => {
                  setIsCommentFoucs(false);
                  setRecommentMode(false);
                }}
                autoCapitalize="none"
                ref={inputRef}
                style={[{
                  color: theme.color.black,
                  includeFontPadding: false,
                  paddingTop: 0,
                  paddingBottom: 0,
                  width: Dimensions.get("window").width - d2p(104),
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
                placeholder="댓글을 남겨보세요." placeholderTextColor={theme.color.grayscale.C_9F9CA3} />
              <Pressable hitSlop={hitslop} onPress={handleWriteComment} style={{ alignSelf: "center" }}>
                <Text style={[{ color: content ? theme.color.main : theme.color.grayscale.a09ca4 }, FONT.Regular]}>
                  {!commentIsEdit ? "작성" : "수정"}</Text>
              </Pressable>
            </Pressable>
          </View>
          :
          <View style={styles.reactionContainer}>
            <TouchableOpacity
              onPress={() => {
                if (route.params?.id) {
                  if (!like) {
                    setLikeCount(prev => prev + 1);
                  }
                  else {
                    setLikeCount(prev => prev - 1);
                  }
                  setLike(!like);
                  likeReviewMutation.mutate({ id: route.params?.id, state: !like });
                }
              }}
              style={{
                borderWidth: 1,
                borderRadius: 18,
                flexDirection: "row",
                alignItems: "center",
                width: d2p(64),
                height: d2p(36),
                justifyContent: "center",
                marginRight: d2p(5)
              }}
            >
              <Image source={like ? colorLike : blackHeart} style={{
                marginRight: d2p(6),
                width: d2p(16), height: d2p(15)
              }} />
              <Text>{likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => detailScrollRef.current?.scrollToOffset({ offset: commentLayoutHeight, animated: true })}
              style={{
                borderWidth: 1,
                borderRadius: 18,
                flexDirection: "row",
                alignItems: "center",
                width: d2p(64),
                height: d2p(36),
                justifyContent: "center",
                marginRight: d2p(5)
              }}
            >
              <Image source={blackComment} style={{
                marginRight: d2p(6),
                width: d2p(16.2), height: d2p(16.2)
              }} />
              <Text>{reviewDetailQuery.data?.commentCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const getUrl = await buildLink(reviewDetailQuery.data?.id);
                Share.open({
                  title: "뉴뉴",
                  url: getUrl
                  // url: `knewnnew://FeedDetail/${reviewDetailQuery.data?.id}`
                })
                  .then(() => {
                    if (reviewDetailQuery.data?.id) {
                      shareMutation.mutate({ id: reviewDetailQuery.data.id });
                    }
                  })
                  .catch((err) => {
                    err && console.log(err);
                  });
              }}
              style={{
                borderRadius: 18,
                width: d2p(44),
                height: d2p(36),
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.color.grayscale.e9e7ec
              }}
            >
              <Image source={blackShare} style={{
                marginRight: d2p(6),
                width: d2p(16), height: d2p(18)
              }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (route.params?.id) {
                  setCart(!cart);
                  bookmarkMutation.mutate({ id: route.params?.id, state: !cart });
                }
              }}
              style={{
                borderRadius: 18,
                width: d2p(120),
                height: d2p(36),
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                borderWidth: 1,
                borderColor: theme.color.main,
                marginLeft: "auto"
              }}
            >
              <Image source={cart ? mainBookmark : colorBookmark} style={{
                marginRight: d2p(7.8),
                width: d2p(11.7), height: d2p(14.4)
              }} />
              <Text style={[FONT.SemiBold, { color: theme.color.main }]}>
                담아가기
              </Text>
            </TouchableOpacity>
          </View>
        }
      </KeyboardAvoidingView>
    </Fragment >
  );
};

export default FeedDetail;

const styles = StyleSheet.create({
  writer: {
    fontSize: 16,
    marginRight: d2p(5)
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
    position: "absolute",
    width: Dimensions.get("window").width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: h2p(15),
    paddingBottom: getBottomSpace() + h2p(15),
    bottom: 0,
    paddingHorizontal: d2p(20),
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    elevation: (Platform.OS === 'android') ? 3 : 0,
  },
  content: {
    color: theme.color.grayscale.C_79737e,
  },
  commentLine: {
    borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc,
    width: Dimensions.get('window').width - d2p(40),
    marginTop: h2p(14), marginBottom: h2p(10)
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