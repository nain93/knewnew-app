import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { ReviewListType } from '~/types/review';
import { useMutation, useQueryClient } from 'react-query';
import { deleteReview } from '~/api/review';
import Share from 'react-native-share';

interface MoreProps {
  userId: number,
  isMoreClick?: boolean,
  type: "review" | "comment",
  review: ReviewListType,
  filterBadge?: string,
  handleCloseMore: () => void,
  clickBoxStyle?: ViewStyle
}

const More = ({ handleCloseMore, userId, isMoreClick, type, review, filterBadge, clickBoxStyle }: MoreProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const myId = useRecoilValue(myIdState);
  const token = useRecoilValue(tokenState);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation("deleteReview",
    (id: number) => deleteReview(token, id), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
      queryClient.invalidateQueries("myProfile");
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

  return (
    <>
      {isMoreClick &&
        (myId === userId ?
          <View style={[styles.clickBox, clickBoxStyle]}>
            <Pressable style={styles.press} onPress={handleEditPress}>
              <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>수정</Text>
            </Pressable>
            <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
            <Pressable style={styles.press} onPress={handleDeletePress}>
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