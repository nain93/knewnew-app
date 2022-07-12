import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import theme from '~/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { d2p, dateCommentFormat, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import FastImage from 'react-native-fast-image';
import { myIdState, okPopupState, tokenState } from '~/recoil/atoms';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { commentMore, recommentIcon } from '~/assets/icons';
import { noProfile } from '~/assets/images';
import { RecommentType } from '~/types/comment';
import { useMutation, useQueryClient } from 'react-query';
import { deleteReviewComment, likeComment } from '~/api/comment';

interface RecommentProps {
  authorName: string
  setContent: (reContent: string) => void
  setCommentIsEdit: (isEdit: boolean) => void
  setEditCommentId: (editId: number) => void
  setCommentSelectedIdx: (selectIdx: number) => void
  setModifyingIdx: (mdIdx: number) => void;
  commentIsEdit: boolean
  modifyingIdx: number
  reviewId: number
}

const Recomment = ({ child, authorName,
  setContent,
  commentIsEdit,
  setCommentIsEdit,
  setEditCommentId,
  setCommentSelectedIdx,
  setModifyingIdx,
  modifyingIdx,
  reviewId
}: RecommentProps & RecommentType) => {
  const navigation = useNavigation<StackNavigationProp>();
  const setModalOpen = useSetRecoilState(okPopupState);
  const myId = useRecoilValue(myIdState);
  const token = useRecoilValue(tokenState);
  const queryClient = useQueryClient();
  const [recommentSelectedIdx, setRecommentSelectedIdx] = useState(-1);
  const [reModifyingIdx, setReModifyingIdx] = useState(-1);
  const [apiBlock, setApiBlock] = useState(false);

  const deleteCommentMutation = useMutation('deleteComment', (id: number) =>
    deleteReviewComment(token, id), {
    onSuccess: () => {
      queryClient.invalidateQueries('getCommentList');
      queryClient.invalidateQueries("reviewList");
    }
  });

  const commentLikeMutation = useMutation("likeCount", ({ commentId, isLike }: { commentId: number, isLike: boolean }) =>
    likeComment({ token, commentId, isLike }), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("getCommentList");
      setApiBlock(false);
    }
  });

  useEffect(() => {
    if (modifyingIdx !== -1) {
      setReModifyingIdx(-1);
    }
  }, [setModifyingIdx]);
  // console.log(child, 'child');
  return (
    <>
      {
        React.Children.toArray(child.map((item, index) => (
          <View style={{ backgroundColor: (index === reModifyingIdx) && commentIsEdit ? theme.color.grayscale.f7f7fc : theme.color.white }}>
            <View style={[styles.container, { marginTop: h2p(1) }]}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
              }}>
                <Image source={recommentIcon} style={{ width: d2p(8), height: d2p(8), marginRight: d2p(9), marginBottom: h2p(6) }} />
                <TouchableOpacity onPress={() => navigation.navigate("Mypage", { id: item.author.id })}
                  style={styles.commentProfileLine}>
                  <FastImage source={item.author.profileImage ? { uri: item.author.profileImage } : noProfile}
                    style={styles.commentImg} />
                </TouchableOpacity>
                <View style={{
                  flexDirection: "row", justifyContent: "space-between",
                  width: Dimensions.get("window").width - d2p(107),
                  marginLeft: d2p(10)
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={{ flexDirection: "row" }}
                      onPress={() => navigation.navigate("Mypage", { id: item.author.id })}>
                      <Text style={FONT.Medium}>{item.author.nickname}</Text>
                      {item.author.id === reviewId &&
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
                    <Text style={[
                      { marginLeft: item.author.id === myId ? d2p(5) : d2p(10) },
                      styles.commentDate, FONT.Regular]}>{dateCommentFormat(item.created)}</Text>
                  </View>
                  {myId === item.author.id &&
                    <TouchableOpacity onPress={() => {
                      setCommentSelectedIdx(-1);
                      if (recommentSelectedIdx === index) {
                        setRecommentSelectedIdx(-1);
                      } else {
                        setRecommentSelectedIdx(index);
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
              <View style={styles.commentContent}>
                <Text style={[FONT.Regular, { fontSize: 15, color: theme.color.main }]}>@{authorName} </Text>
                <Text style={[{
                  color: theme.color.grayscale.C_443e49, fontSize: 15
                }, FONT.Regular]}>{item.content}</Text>
              </View>
              <TouchableOpacity
                style={{ marginLeft: d2p(49), marginTop: h2p(10) }}
                onPress={() => {
                  setApiBlock(true);
                  if (!apiBlock) {
                    commentLikeMutation.mutate({ commentId: item.id, isLike: !item.isLike });
                  }
                }}>
                <Text style={[FONT.Bold, {
                  fontSize: 12, color: item.isLike ? theme.color.grayscale.C_443e49 : theme.color.grayscale.C_79737e,
                }]}>좋아요 {item.likeCount > 0 && item.likeCount}</Text>
              </TouchableOpacity>
              {recommentSelectedIdx === index &&
                <View style={styles.clickBox}>
                  <Pressable
                    style={{
                      justifyContent: "center", alignItems: "center", width: d2p(70), height: d2p(35)
                    }}
                    onPress={() => {
                      setContent(item.content);
                      setCommentIsEdit(true);
                      setModifyingIdx(-1);
                      setReModifyingIdx(recommentSelectedIdx);
                      setEditCommentId(item.id);
                      setRecommentSelectedIdx(-1);
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
                      setRecommentSelectedIdx(-1);
                    }}>
                    <Text style={[{ color: theme.color.main }, FONT.Regular]}>삭제</Text>
                  </Pressable>
                </View>
              }
            </View>
          </View>
        )))
      }
    </>
  );
};

export default Recomment;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(247,247,252,0.5)",
    padding: d2p(10),
    marginHorizontal: d2p(20),
  },
  commentImg: {
    width: d2p(22), height: d2p(22),
    borderRadius: 22,
    borderColor: theme.color.grayscale.e9e7ec, borderWidth: 1,

  },
  commentProfileLine: {
    width: d2p(22), height: d2p(22),
  },
  commentDate: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
  },
  commentContent: {
    marginLeft: d2p(49),
    flexDirection: "row",
    flexWrap: "wrap"
  },
  clickBox: {
    width: d2p(70),
    height: d2p(70),
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 5,
    position: 'absolute', right: d2p(26), top: h2p(5),
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