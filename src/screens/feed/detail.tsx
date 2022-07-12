import { View, Text, Dimensions, StyleSheet, Pressable, Image, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Keyboard, FlatList } from 'react-native';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import theme from '~/styles/theme';
import { d2p, dateCommentFormat, h2p, simpleDate } from '~/utils';
import ReviewIcon from '~/components/icon/reviewIcon';
import Badge from '~/components/badge';
import ReactionIcon from '~/components/icon/reactionIcon';
import { commentMore, more, tag } from '~/assets/icons';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, okPopupState, popupState, refreshState, tokenState } from '~/recoil/atoms';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { bookmarkReview, getReviewDetail, likeReview } from '~/api/review';
import FastImage from 'react-native-fast-image';

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
  const [scrollIdx, setScrollIdx] = React.useState(0);
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

  const setRefresh = useSetRecoilState(refreshState);
  const setModalOpen = useSetRecoilState(okPopupState);
  const setIspopupOpen = useSetRecoilState(popupState);

  const detailScrollRef = useRef<ScrollView>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const openGallery = (idx: number) => {
    setIsOpen(true);
    setInitialIndex(idx);
  };
  const closeGallery = () => setIsOpen(false);

  const reviewDetailQuery = useQuery<ReviewListType, Error>(["reviewDetail", token, route.params?.id],
    async () => {
      if (route.params) {
        const detail = await getReviewDetail(token, route.params.id);
        return detail;
      }
    }, {
    enabled: !!route.params?.id,
    onSuccess: (data) => {
      setLike(data.isLike);
      setCart(data.isBookmark);
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
    onSettled: () => SplashScreen.hide()
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


  const commentListQuery = useQuery<CommentListType[], Error>(['getCommentList', token, route.params?.id], async () => {
    if (route.params) {
      const comments = await getReviewComment(token, route.params?.id);
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
      Keyboard.dismiss();
    }
  });

  const editCommentMutation = useMutation('editComment', async ({ reviewId, commentId, comment }: { reviewId: number, commentId: number, comment: string }) =>
    editReviewComment({ token, reviewId, commentId, content: comment }), {
    onSuccess: () => {
      setCommentIsEdit(false);
      queryClient.invalidateQueries('getCommentList');
      Keyboard.dismiss();
    }
  });

  const deleteCommentMutation = useMutation('deleteComment', (id: number) =>
    deleteReviewComment(token, id), {
    onSuccess: () => {
      queryClient.invalidateQueries('getCommentList');
      queryClient.invalidateQueries("reviewList");
    }
  });

  const commentLikeMutation = useMutation("likeCount", ({ commentId, isLike }: { commentId: number, isLike: boolean }) =>
    likeComment({ token, commentId, isLike }), {
    onSuccess: () => {
      queryClient.invalidateQueries("getCommentList");
    }
  });

  const handleWriteComment = () => {
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

  const imageKey = useCallback((v) => String(v.id), []);

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

  const imageRenderItem = useCallback((image) =>
    <Pressable
      onPress={() => openGallery(image.index)}
      style={{
        aspectRatio: 1.7,
        height: h2p(180),
        borderRadius: 18,
        marginHorizontal: d2p(15),
        borderWidth: 1,
        borderColor: theme.color.grayscale.e9e7ec,
        width: Dimensions.get('window').width - d2p(30),
      }}
    >
      <FastImage
        style={{
          width: Dimensions.get('window').width - d2p(30),
          height: "100%",
          borderRadius: 18
        }}
        source={{ uri: image.item.image }} />
    </Pressable>
    , []);

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
    const copy: { [index: string]: Array<string> }
      = { ...reviewDetailQuery.data?.tags };
    setTags(
      Object.keys(copy).reduce<Array<string>>((acc, cur) => {
        acc = acc.concat(copy[cur]);
        return acc;
      }, [])
    );
  }, [reviewDetailQuery.data?.tags]);

  // * 댓글위치로 스크롤
  useEffect(() => {
    if (route.params?.toComment) {
      detailScrollRef.current?.scrollToEnd();
    }
  }, [route.params, reviewDetailQuery.isFetching]);

  if (reviewDetailQuery.isLoading || reviewDetailQuery.isFetching) {
    return <Loading />;
  }

  return (
    <Fragment>
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
            //@ts-ignore
            navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
          }
          else {
            navigation.goBack();
          }
        }}
          imageStyle={{ width: d2p(11), height: d2p(25) }} />}
        title="게시글 상세"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={detailScrollRef}
          contentContainerStyle={{ paddingBottom: h2p(30) }}
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: h2p(20), flex: 1 }}
        >
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
          <View style={{
            paddingHorizontal: d2p(20), flexDirection: 'row', justifyContent: 'space-between'
          }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Mypage", { id: route.params?.authorId })}
              style={{
                borderRadius: 40,
                height: d2p(40),
                width: d2p(40),
                overflow: "hidden"
              }}>
              <Image source={reviewDetailQuery.data?.author.profileImage ?
                { uri: reviewDetailQuery.data?.author.profileImage } : noProfile}
                style={{
                  width: d2p(40), height: d2p(40), borderRadius: 40,
                  borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec
                }}
              />
            </TouchableOpacity>
            <View style={{
              width: Dimensions.get('window').width - d2p(105),
              paddingLeft: d2p(10)
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                <TouchableOpacity onPress={() => navigation.navigate("Mypage", { id: route.params?.authorId })}>
                  <Text style={[styles.writer, FONT.Medium]}>{reviewDetailQuery.data?.author.nickname}</Text>
                </TouchableOpacity>
                {reviewDetailQuery.data?.author.representBadge &&
                  <Badge type="feed" text={reviewDetailQuery.data?.author.representBadge} />}
                <Text style={{ fontSize: 12, marginLeft: d2p(5), color: theme.color.grayscale.a09ca4 }}>{reviewDetailQuery.data?.author.household}</Text>
              </View>
              <View style={{ marginTop: h2p(5) }}>
                <Text style={[{ fontSize: 12, color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>
                  {(reviewDetailQuery.data) && simpleDate(reviewDetailQuery.data?.created, ' 전')}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => setIsMoreClick(!isMoreClick)}>
              <Image
                source={more}
                resizeMode="contain"
                style={{ width: d2p(26), height: d2p(16) }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ paddingTop: h2p(20), paddingHorizontal: d2p(20) }}>
            {reviewDetailQuery.data &&
              <ReviewIcon review={reviewDetailQuery.data?.satisfaction} />}
            <Text style={[styles.content, FONT.Regular]}>{reviewDetailQuery.data?.content}</Text>
          </View>
          {!reviewDetailQuery.data?.parent &&
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: d2p(20) }}>
                <Image source={tag} style={{ width: d2p(10), height: d2p(10), marginRight: d2p(5) }} />
                <Text style={[{ fontSize: 12, color: theme.color.grayscale.C_79737e }, FONT.Regular]}>
                  {React.Children.toArray(tags.map((v) => {
                    if (v === route.params?.badge) {
                      return;
                    }
                    return <Text>#{v} </Text>;
                  }))}
                  {route.params?.badge &&
                    <Text style={{ color: theme.color.main, fontSize: 12 }}>#{route.params?.badge}</Text>
                  }
                </Text>
              </View>
              <View style={styles.sign}>
                <Text style={[styles.store, FONT.Regular]}>{reviewDetailQuery.data?.market}</Text>
              </View>
            </>
          }
          <View>
            <FlatList
              data={reviewDetailQuery.data?.images}
              horizontal
              pagingEnabled
              onScroll={e =>
                setScrollIdx(Math.min(
                  reviewDetailQuery.data?.images.length ?? 0,
                  Math.max(0, Math.round(e.nativeEvent.contentOffset.x / (Dimensions.get("window").width - d2p(30))))))}
              showsHorizontalScrollIndicator={false}
              keyExtractor={imageKey}
              renderItem={imageRenderItem}
            />
            {(reviewDetailQuery.data?.images.length || 0) > 1 &&
              <View style={{
                marginHorizontal: d2p(15),
                position: "absolute", backgroundColor: theme.color.white.concat("bb"),
                borderRadius: 5,
                paddingHorizontal: d2p(5),
                paddingVertical: h2p(2),
                right: d2p(10), bottom: d2p(10),
                borderWidth: 1,
                borderColor: theme.color.grayscale.e9e7ec
              }}>
                <Text>{scrollIdx + 1} / {reviewDetailQuery.data?.images.length}</Text>
              </View>
            }
          </View>
          {reviewDetailQuery.data?.parent &&
            <>
              <View style={{
                marginHorizontal: d2p(20)
              }}>
                <ReKnew
                  type="detail"
                  review={{
                    ...reviewDetailQuery.data.parent,
                    tags: reviewDetailQuery.data.tags
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("FeedDetail",
                  { id: reviewDetailQuery.data.parent?.id })}
                style={{
                  marginTop: h2p(15),
                  marginBottom: h2p(10),
                  marginLeft: d2p(45),
                  width: d2p(155), height: h2p(40),
                  borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
                  justifyContent: "center", alignItems: "center", borderRadius: 5
                }}>
                <Text style={[FONT.Medium, { fontSize: 12, color: theme.color.grayscale.C_443e49 }]}>
                  원문으로</Text>
              </TouchableOpacity>
            </>
          }
          <View style={[styles.reactionContainer, { paddingTop: reviewDetailQuery.data?.parent ? 0 : h2p(10) }]}>
            <ReactionIcon name="cart" state={cart} count={reviewDetailQuery.data?.bookmarkCount}
              mutation={boomarkMutation}
              id={route.params?.id}
              isState={(isState: boolean) => setCart(isState)} />
            <View style={{ borderLeftWidth: 1, borderLeftColor: theme.color.grayscale.eae7ec, height: h2p(26) }} />
            <ReactionIcon name="like" count={reviewDetailQuery.data?.likeCount} state={like}
              isState={(isState: boolean) => setLike(isState)} mutation={likeReviewMutation} id={route.params?.id} />
          </View>
          <Text style={[styles.commentMeta, FONT.Bold]}>작성된 댓글 {commentListQuery.data?.length}개</Text>
          {commentListQuery.isLoading ?
            <Loading viewStyle={{ top: h2p(0), position: "relative" }} />
            :
            <>
              <Pressable onPress={() => setCommentSelectedIdx(-1)}>
                {React.Children.toArray(commentListQuery.data?.map((item, index) => {
                  return (
                    <>
                      <View
                        style={{
                          paddingHorizontal: d2p(20),
                          paddingTop: h2p(10),
                          paddingBottom: h2p(14.5),
                          backgroundColor: (index === modifyingIdx) && commentIsEdit ? theme.color.grayscale.f7f7fc : theme.color.white
                        }}>
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
                                  <Text style={FONT.Medium}>{item.author.nickname}</Text>
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
                        {/* 대댓글 */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: d2p(40), marginTop: h2p(10) }}>
                          <TouchableOpacity onPress={() => {
                            setCommentParentId(item.id);
                            setRecommentName(item.author.nickname);
                            setRecommentMode(true);
                          }}>
                            <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.C_79737e }]}>답글 달기</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => commentLikeMutation.mutate({ commentId: item.id, isLike: !item.isLike })}>
                            <Text style={[FONT.Bold, {
                              marginLeft: d2p(10),
                              fontSize: 12, color: item.isLike ? theme.color.grayscale.C_443e49 : theme.color.grayscale.C_79737e
                            }]}>좋아요 {item.likeCount > 0 && item.likeCount}</Text>
                          </TouchableOpacity>
                        </View>
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
                                  okButton: () => deleteCommentMutation.mutate(item.id)
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
                  );
                }))}
              </Pressable>
            </>
          }
        </ScrollView>
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
    color: theme.color.black,
    marginBottom: h2p(10), paddingTop: h2p(15)
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