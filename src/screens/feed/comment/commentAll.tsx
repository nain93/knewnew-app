import { Dimensions, FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { CommentListType } from '~/types/comment';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { bottomDotSheetState, myIdState, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import { addReviewComment, deleteReviewComment, editReviewComment, getReviewComment, likeComment } from '~/api/comment';
import { d2p, dateCommentFormat, h2p } from '~/utils';
import Loading from '~/components/loading';
import Recomment from '~/screens/feed/comment/recomment';
import FastImage from 'react-native-fast-image';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { hitslop } from '~/utils/constant';
import { getReviewDetail } from '~/api/review';
import { ReviewListType } from '~/types/review';
import { noProfile } from '~/assets/images';
import { addReport } from '~/api/report';
import { commentMore, marketIcon } from '~/assets/icons';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import TopScrollButton from '~/components/button/topScrollButton';

interface CommentAllType {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    id: number
  }>;
}

const CommentAll = ({ navigation, route }: CommentAllType) => {
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const [commentIsEdit, setCommentIsEdit] = useState<boolean>(false);
  const [modifyingIdx, setModifyingIdx] = useState(-1);
  const [editCommentId, setEditCommentId] = useState<number>(-1);
  const detailScrollRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();

  const setIsBottomDotSheet = useSetRecoilState(bottomDotSheetState);
  const [content, setContent] = useState<string>("");
  const [recommentMode, setRecommentMode] = useState(false);
  const [recommentName, setRecommentName] = useState("");
  const [commentParentId, setCommentParentId] = useState<number | null>(null);
  const [apiBlock, setApiBlock] = useState(false);
  const setIspopupOpen = useSetRecoilState(popupState);
  const [commentLoading, setCommentLoading] = useState(false);
  const [modalOpen, setModalOpen] = useRecoilState(okPopupState);
  const [numberLine, setNumberLine] = useState(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isCommentFoucs, setIsCommentFoucs] = useState(false);


  const commentListQuery = useInfiniteQuery<CommentListType[], Error>(['getInfiniteCommentList', token, route.params?.id], async ({ pageParam = 0 }) => {
    if (route.params) {
      const comments = await getReviewComment({ token, reviewId: route.params?.id, offset: pageParam, limit: 10 });
      return comments;
    }
  }, {
    getNextPageParam: (next, all) => all.flat().length ?? undefined,
    enabled: !!route.params?.id
  });

  const reviewDetailQuery = useQuery<ReviewListType, Error>(["reviewDetail", token, route.params?.id],
    async () => {
      if (route.params) {
        const detail = await getReviewDetail(token, route.params.id);
        return detail;
      }
    }, {
    enabled: !!route.params?.id,
  });

  const deleteCommentMutation = useMutation('deleteComment', (id: number) =>
    deleteReviewComment(token, id), {
    onSuccess: () => {
      queryClient.invalidateQueries('getInfiniteCommentList');
      queryClient.invalidateQueries("reviewList");
      queryClient.setQueryData<ReviewListType | undefined>(["reviewDetail", token, route.params?.id], (postData) => {
        if (postData) {
          return { ...postData, commentCount: postData.commentCount - 1 };
        }
      });
    },
    onSettled: () => setCommentLoading(false)
  });

  const addReportMutation = useMutation("addReport", ({ commentContent, commentId }: { commentContent: string, commentId: number }) =>
    addReport({ token, objectType: "review_comment", qnaType: "report", content: commentContent, reviewComment: commentId })
    , {
      onSuccess: () => {
        setIspopupOpen({ isOpen: true, content: "신고 되었습니다" });
      }
    });

  const commentLikeMutation = useMutation("likeCount", ({ commentId, isLike }: { commentId: number, isLike: boolean }) =>
    likeComment({ token, commentId, isLike }), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("getInfiniteCommentList");
    },
    onSettled: () => setApiBlock(false)
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
      queryClient.invalidateQueries('getInfiniteCommentList');
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
      queryClient.invalidateQueries('getInfiniteCommentList');
      Keyboard.dismiss();
    },
    onSettled: () => setCommentLoading(false)
  });

  function detailHeader() {
    return (
      <Text style={[FONT.SemiBold, {
        marginBottom: h2p(10),
        marginLeft: d2p(20)
      }]}>댓글
        <Text style={[FONT.Regular, { color: theme.color.grayscale.C_9F9CA3 }]}>
          {` ${reviewDetailQuery.data?.commentCount}`}
        </Text>
      </Text>
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
                    inputRef.current?.focus();
                    setCommentParentId(item.id);
                    setRecommentName(item.author.nickname);
                    setRecommentMode(true);
                    // * 답글달기 클릭하면 해당 아이템 인덱스로 스크롤
                    setTimeout(() => {
                      detailScrollRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0, viewOffset: -15 });
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

  // * 키보드 높이 컨트롤
  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", (e) => {
      if (Platform.OS === "android") {
        setKeyboardHeight(e.endCoordinates.height);
      }
      else {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });
    Keyboard.addListener("keyboardWillHide", (e) => {
      setKeyboardHeight(0);
      setCommentIsEdit(false);
    });
  }, []);

  return (
    <>
      <Header
        viewStyle={{ paddingTop: Platform.OS === "android" ? getStatusBarHeight() + h2p(20) : h2p(30) }}
        title="댓글 모두보기"
        headerLeft={<LeftArrowIcon
          viewStyle={{ paddingTop: Platform.OS === "android" ? h2p(20) : h2p(0) }}
          onBackClick={() => {
            setIsCommentFoucs(false);
            queryClient.invalidateQueries('getCommentList');
            navigation.goBack();
          }} />}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0)" }}
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
          contentContainerStyle={{ paddingBottom: h2p(100) }}
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
          refreshing={commentListQuery.isLoading}
          onRefresh={commentListQuery.refetch}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (commentListQuery.data &&
              commentListQuery.data.pages.flat().length > 9) {
              commentListQuery.fetchNextPage();
            }
          }}
        />
        <View style={{
          position: "absolute",
          bottom: keyboardHeight + h2p(20),
          width: Dimensions.get("window").width - d2p(40),
          marginHorizontal: d2p(20)
        }}>
          {recommentMode &&
            <View style={{
              backgroundColor: theme.color.white,
              paddingVertical: h2p(10),
              paddingHorizontal: d2p(20),
              flexDirection: "row",
              justifyContent: "space-between",
              borderRadius: 25,
              shadowColor: "rgba(159, 156, 163, 0.2)",
              shadowOffset: {
                width: 0,
                height: -3
              },
              shadowRadius: 6,
              shadowOpacity: 1,
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
              shadowColor: "rgba(121, 115, 126, 0.2)",
              shadowOffset: {
                width: 0,
                height: 3
              },
              shadowRadius: 5,
              shadowOpacity: 1,
            }}>
            <TextInput
              onFocus={() => setIsCommentFoucs(true)}
              onBlur={() => setIsCommentFoucs(false)}
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

        {/* 최상단으로 스크롤하는 버튼 */}
        <TopScrollButton scrollRef={detailScrollRef} />

      </KeyboardAvoidingView>
    </>
  );
};

export default CommentAll;

const styles = StyleSheet.create({
  commentImg: {
    width: d2p(30), height: d2p(30),
    borderRadius: 30,
    borderColor: theme.color.grayscale.e9e7ec, borderWidth: 1,
  },
  commentProfileLine: {
    width: d2p(30), height: d2p(30),
  },
  content: {
    color: theme.color.grayscale.C_79737e,
    marginTop: h2p(20)
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
  commentLine: {
    borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc,
    width: Dimensions.get('window').width - d2p(40),
    marginTop: h2p(14), marginBottom: h2p(10)
  },
  commentMeta: {
    fontSize: 12,
    color: theme.color.grayscale.C_79737e,
    marginBottom: h2p(10),
    marginHorizontal: d2p(20)
  },
  writer: {
    fontSize: 16,
    marginRight: d2p(5)
  },
});