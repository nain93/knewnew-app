import { View, Text, Dimensions, StyleSheet, Pressable, Image, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Keyboard, FlatList } from 'react-native';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import theme from '~/styles/theme';
import { d2p, dateCommentFormat, h2p, simpleDate } from '~/utils';
import ReviewIcon from '~/components/icon/reviewIcon';
import Badge from '~/components/badge';
import ReactionIcon from '~/components/icon/reactionIcon';
import { commentMore, more, tag } from '~/assets/icons';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, refreshState, tokenState } from '~/recoil/atoms';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { bookmarkReview, deleteReview, getReviewDetail, likeReview } from '~/api/review';

import { ReviewListType } from '~/types/review';
import Loading from '~/components/loading';
import { FONT } from '~/styles/fonts';
import { noProfile } from '~/assets/images';
import { addReviewComment, deleteReviewComment, editReviewComment, getReviewComment } from '~/api/comment';
import ReKnew from '~/components/review/reKnew';
import More from '~/components/more';
interface FeedDetailProps {
  navigation: NavigationStackProp
  route: NavigationRoute<{
    id: number,
    badge: string,
    isLike: boolean,
    isBookmark: boolean,
  }>;
}
interface CommentListType {
  id: number;
  author: {
    id: number;
    nickname: string;
    profileImage: string;
  };
  content: string;
  created: string;
  likeCount: string;
}

const FeedDetail = ({ route, navigation }: FeedDetailProps) => {
  const [inputHeight, setInputHeight] = useState(getBottomSpace());
  const token = useRecoilValue(tokenState);
  const inputRef = useRef<TextInput>(null);
  const [scrollIdx, setScrollIdx] = React.useState(0);
  const [isMoreClick, setIsMoreClick] = useState<boolean>();
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();

  const [commentIsEdit, setCommentIsEdit] = useState<boolean>();
  const [modifyingIdx, setModifyingIdx] = useState(-1);
  const [editCommentId, setEditCommentId] = useState<number>(-1);
  const [tags, setTags] = useState<Array<string>>([]);
  const [content, setContent] = useState<string>("");
  const [commentSelectedIdx, setCommentSelectedIdx] = useState<number>(-1);
  const [like, setLike] = useState<boolean>(false);
  const [cart, setCart] = useState<boolean>(false);
  const setRefresh = useSetRecoilState(refreshState);

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
    }
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

  const addCommentMutation = useMutation('addComment', ({ rid, comment }: { rid: number, comment: string }) => addReviewComment(token, rid, comment), {
    onSuccess: () => {
      queryClient.invalidateQueries('getCommentList');
      queryClient.invalidateQueries("reviewList");
    }
  });

  const editCommentMutation = useMutation('editComment', ({ rId, cId, comment }: { rId: number, cId: number, comment: string }) => editReviewComment(token, rId, cId, comment), {
    onSuccess: () => {
      queryClient.invalidateQueries('getCommentList');
    }
  });

  const deleteCommentMutation = useMutation('deleteComment', (id: number) => deleteReviewComment(token, id), {
    onSuccess: () => {
      queryClient.invalidateQueries('getCommentList');
      queryClient.invalidateQueries("reviewList");
    }
  });

  const deleteMutation = useMutation("deleteReview", (id: number) => deleteReview(token, id), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
    }
  });

  const handleWriteComment = () => {
    if (route.params) {
      if (!commentIsEdit) {
        addCommentMutation.mutate({ rid: route.params?.id, comment: content });
      } else {
        editCommentMutation.mutate({ rId: route.params?.id, cId: editCommentId, comment: content });
        Keyboard.dismiss();
        setCommentIsEdit(false);
      }
      setContent("");
    }
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
    const copy: { [index: string]: Array<string> }
      = { ...reviewDetailQuery.data?.tags };
    setTags(
      Object.keys(copy).reduce<Array<string>>((acc, cur) => {
        acc = acc.concat(copy[cur]);
        return acc;
      }, [])
    );
  }, [reviewDetailQuery.data?.tags]);


  if (reviewDetailQuery.isLoading || reviewDetailQuery.isFetching) {
    return <Loading />;
  }

  return (
    <Fragment>
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
        title="리뷰 상세"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
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
              handleCloseMore={() => setIsMoreClick(false)}
            />
          }
          <View style={{
            paddingHorizontal: d2p(20), flexDirection: 'row', justifyContent: 'space-between'
          }}>
            <View style={{
              borderRadius: 40,
              height: d2p(40),
              width: d2p(40),
              borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec
            }}>
              <Image source={reviewDetailQuery.data?.author.profileImage ?
                { uri: reviewDetailQuery.data?.author.profileImage } : noProfile}
                style={{ width: d2p(40), height: d2p(40), borderRadius: 40 }}
              />
            </View>
            <View style={{
              width: Dimensions.get('window').width - d2p(105),
              paddingLeft: d2p(10)
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                <Text style={[styles.writer, FONT.Medium]}>{reviewDetailQuery.data?.author.nickname}</Text>
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
                style={{ width: 26, height: 16 }}
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
                <Image source={tag} style={{ width: 10, height: 10, marginRight: 5 }} />
                <Text style={[{ fontSize: 12, color: theme.color.grayscale.C_79737e }, FONT.Regular]}>
                  {React.Children.toArray(tags.map((v) => {
                    if (v === route.params?.badge) {
                      return;
                    }
                    return <Text>#{v} </Text>;
                  }))}
                  <Text style={{ color: theme.color.main, fontSize: 12 }}>#{route.params?.badge}</Text>
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
              keyExtractor={(v) => String(v.id)}
              renderItem={(image) =>
                <>
                  <Image
                    style={{
                      marginHorizontal: d2p(15),
                      borderWidth: 1,
                      borderColor: theme.color.grayscale.e9e7ec,
                      width: Dimensions.get('window').width - d2p(30),
                      height: Dimensions.get("window").height * (180 / 760), borderRadius: 18
                    }}
                    source={{ uri: image.item.image }} />
                </>
              }
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
            <View style={{
              marginHorizontal: d2p(20),
              borderTopWidth: 1, borderColor: theme.color.grayscale.eae7ec
            }}>
              <ReKnew review={{
                ...reviewDetailQuery.data.parent,
                tags: reviewDetailQuery.data.tags
              }}
              />
            </View>
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
          <Pressable onPress={() => {
            setCommentSelectedIdx(-1);
          }}>
            <FlatList
              data={commentListQuery.data}
              ListHeaderComponent={() =>
                <Text style={[styles.commentMeta, FONT.Bold]}>작성된 댓글 {commentListQuery.data?.length}개</Text>}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    paddingHorizontal: d2p(20),
                    paddingTop: h2p(10),
                    backgroundColor: (index === modifyingIdx) && commentIsEdit ? "#F7F7FC" : theme.color.white
                  }}>
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}>
                    <TouchableOpacity onPress={() => navigation.navigate("UserProfile", { id: item.author.id })}
                      style={styles.commentProfileLine}
                    >
                      <Image source={item.author.profileImage ? { uri: item.author.profileImage } : noProfile}
                        style={styles.commentImg} />
                    </TouchableOpacity>
                    <View style={{
                      flexDirection: "row", justifyContent: "space-between",
                      width: Dimensions.get("window").width - d2p(70),
                    }}>
                      <View style={{ marginLeft: d2p(10) }}>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={FONT.Medium}>{item.author.nickname}</Text>
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
                  <View style={styles.commentLine} />
                  {commentSelectedIdx === index &&
                    <View style={[styles.clickBox, { right: d2p(32) }]}>
                      <Pressable onPress={() => {
                        setContent(item.content);
                        setCommentIsEdit(true);
                        setModifyingIdx(commentSelectedIdx);
                        setEditCommentId(item.id);
                        setCommentSelectedIdx(-1);
                      }}>
                        <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>수정</Text>
                      </Pressable>
                      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
                      <Pressable onPress={() => {
                        deleteCommentMutation.mutate(item.id);
                        setCommentSelectedIdx(-1);
                      }}>
                        <Text style={[{ color: theme.color.main }, FONT.Regular]}>삭제</Text>
                      </Pressable>
                    </View>
                  }
                </View>
              )}
              keyExtractor={(item) => String(item.id)} />
          </Pressable>
        </ScrollView>
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{
            borderTopColor: theme.color.grayscale.eae7ec,
            borderTopWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: Dimensions.get("window").width,
            marginBottom: inputHeight,
            backgroundColor: theme.color.white, paddingVertical: h2p(14), paddingHorizontal: d2p(20)
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
            onSubmitEditing={handleWriteComment}
            onChangeText={(e) => setContent(e)}
            placeholder="댓글을 남겨보세요." placeholderTextColor={theme.color.grayscale.d3d0d5} />
          <Pressable onPress={handleWriteComment}>
            <Text style={[{ color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>{!commentIsEdit ? "작성" : "수정"}</Text>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Fragment >
  );
};

export default FeedDetail;

const styles = StyleSheet.create({
  writer: {
    fontSize: 16, fontWeight: 'bold',
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
    fontSize: 12, fontWeight: 'bold',
    color: theme.color.grayscale.C_79737e,
  },
  commentImg: {
    width: d2p(30), height: d2p(30),
    borderRadius: 30,
  },
  commentProfileLine: {
    borderRadius: 30, borderColor: theme.color.grayscale.e9e7ec, borderWidth: 1,
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
    marginLeft: d2p(40)
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