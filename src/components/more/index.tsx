import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { ReviewListType } from '~/types/review';
import { useMutation, useQueryClient } from 'react-query';
import { deleteReview } from '~/api/review';
import Share from 'react-native-share';
import { blockUser } from '~/api/user';

interface MoreProps {
  userId: number,
  isMoreClick?: boolean,
  type: "review" | "comment",
  review: ReviewListType,
  filterBadge?: string,
  handleCloseMore: () => void,
  clickBoxStyle?: ViewStyle,
  isGobacK?: () => void,
  setSelectedIndex?: (idx: number) => void
}

const More = ({ setSelectedIndex, isGobacK, handleCloseMore, userId, isMoreClick, type, review, filterBadge, clickBoxStyle }: MoreProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const myId = useRecoilValue(myIdState);
  const token = useRecoilValue(tokenState);
  const queryClient = useQueryClient();
  const setModalOpen = useSetRecoilState(okPopupState);
  const setIspopupOpen = useSetRecoilState(popupState);

  const deleteMutation = useMutation("deleteReview",
    (id: number) => deleteReview(token, id), {
    onSuccess: () => {
      if (isGobacK) {
        isGobacK();
      }
    }
  });

  const blockMutation = useMutation("blockUser",
    ({ id, isBlock }: { id: number, isBlock: boolean }) => blockUser({ token, id, isBlock }), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
      queryClient.invalidateQueries("userBookmarkList");
      setIspopupOpen({ isOpen: true, content: "차단되었습니다." });
      if (isGobacK) {
        isGobacK();
      }
    }
  });

  const closeMore = () => {
    handleCloseMore();
  };

  const handleEditPress = () => {
    if (type === "review") {
      if (review.parent) {
        navigation.navigate("Write", { loading: true, isEdit: true, type: "reknew", nickname: review.author.nickname, review, filterBadge });
      }
      else {
        navigation.navigate("Write", { loading: true, isEdit: true, review, filterBadge });
      }
    }
    if (type === "comment") {

    }
  };

  const handleDeletePress = () => {
    if (type === "review") {
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
    }
    if (type === "comment") {

    }
  };

  const handleSharePress = () => {
    Share.open({
      title: "뉴뉴",
      url: `knewnnew://FeedDetail/${review.id}`
      // url: `https://knewnnew/link/FeedDetail/${review.id}`
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        err && console.log(err);
      });
    closeMore();
  };

  const handleReportPress = () => {
    navigation.navigate("report", { review });
  };

  const handleBlockUser = () => {
    if (setSelectedIndex) {
      setSelectedIndex(-1);
    }
    blockMutation.mutate({ id: review.author.id, isBlock: true });
  };

  return (
    <>
      {isMoreClick &&
        (myId === userId ?
          <View style={[styles.clickBox, clickBoxStyle]}>
            <Pressable style={styles.press} onPress={handleEditPress}>
              <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>수정</Text>
            </Pressable>
            <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
            <Pressable style={styles.press} onPress={() => {
              if (setSelectedIndex) {
                setSelectedIndex(-1);
              }
              setModalOpen({
                isOpen: true,
                content: "글을 삭제할까요?",
                okButton: handleDeletePress
              });
            }}>
              <Text style={[{ color: theme.color.main }, FONT.Regular]}>삭제</Text>
            </Pressable>
          </View>
          :
          <View style={[styles.clickBox, clickBoxStyle]}>
            <Pressable style={styles.press} onPress={handleSharePress}>
              <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>공유</Text>
            </Pressable>
            <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
            <Pressable style={styles.press} onPress={handleReportPress}>
              <Text style={[{ color: theme.color.main }, FONT.Regular]}>신고</Text>
            </Pressable>
            <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
            <Pressable style={styles.press} onPress={handleBlockUser}>
              <Text style={[{ color: theme.color.main }, FONT.Regular]}>차단</Text>
            </Pressable>
          </View>
        )}
    </>
  );
};

export default More;

const styles = StyleSheet.create({
  clickBox: {
    justifyContent: 'space-evenly', alignItems: 'center',
    width: d2p(70),
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
    zIndex: 999,
  },
  press: {
    width: d2p(70),
    height: d2p(35),
    justifyContent: "center",
    alignItems: "center",
  }
});