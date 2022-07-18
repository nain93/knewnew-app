import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import React, { useCallback } from 'react';
import Header from '~/components/header';
import { NavigationStackProp } from 'react-navigation-stack';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p, simpleDate } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { cart, comment, likeComment, mention, reComment } from '~/assets/icons/notificationIcon';
import { useInfiniteQuery } from 'react-query';
import { notificationList } from '~/api/setting';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import { knewnewIcon } from '~/assets/icons';
import Loading from '~/components/loading';

interface NotificationProps {
  navigation: NavigationStackProp;
}

interface NotificationListType {
  id: number,
  image: string | null,
  isRead: boolean,
  link: string,
  message: string,
  title: string,
  type: "review_comment" | "review_comment_like" | "review_child_comment" | "review_bookmark" |
  "review_like" | "review_popular" | "review_recommend" | "review_view" | "follow" | "review_mention" |
  "comment_mention" | "admin_noti" | "general"
}


const Notification = ({ navigation }: NotificationProps) => {
  const token = useRecoilValue(tokenState);

  const notificationQuery = useInfiniteQuery<NotificationListType[], Error>("notiList", () => notificationList({ token }), {
    getNextPageParam: (next, all) => all.flat().length,
  });

  const renderItem = useCallback(({ item }: { item: NotificationListType, index: number }) => {
    return (
      <View style={{ flexDirection: "row" }}>
        <View style={{
          marginRight: d2p(10),
          width: d2p(42), height: h2p(42),
          alignItems: "center", marginVertical: h2p(20)
        }}>
          {(() => {
            switch (item.type) {
              case "review_popular": {
                return (
                  <>
                    <Image source={knewnewIcon} style={{ width: d2p(18), height: d2p(18) }} />
                    <Text style={[FONT.Regular, styles.notiText]}>
                      활동
                    </Text>
                  </>
                );
              }
              case "review_comment": {
                return (
                  <>
                    <Image source={comment} style={{ width: d2p(18), height: d2p(18) }} />
                    <Text style={[FONT.Regular, styles.notiText]}>
                      댓글
                    </Text>
                  </>
                );
              }
              case "review_recommend": {
                return (
                  <>
                    <Image source={reComment} style={{ width: d2p(18), height: d2p(18) }} />
                    <Text style={[FONT.Regular, styles.notiText]}>
                      답글
                    </Text>
                  </>
                );
              }
              case "comment_mention": {
                return (
                  <>
                    <Image source={mention} style={{ width: d2p(18), height: d2p(18) }} />
                    <Text style={[FONT.Regular, styles.notiText]}>
                      언급
                    </Text>
                  </>
                );
              }
              case "review_like": {
                return (
                  <>
                    <Image source={likeComment} style={{ width: d2p(18), height: d2p(18) }} />
                    <Text style={[FONT.Regular, styles.notiText]}>
                      좋아요
                    </Text>
                  </>
                );
              }
              case "review_bookmark": {
                return (
                  <>
                    <Image source={cart} style={{ width: d2p(18), height: d2p(18) }} />
                    <Text style={[FONT.Regular, styles.notiText]}>
                      담기
                    </Text>
                  </>
                );
              }
              default: {
                return null;
              }
            }
          })()}
        </View>
        <View style={{
          width: Dimensions.get("window").width - d2p(92),
          borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc,
          paddingVertical: h2p(20)
        }}>
          <Text style={[FONT.Regular, { lineHeight: 20 }]}>{item.message}</Text>
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4, marginTop: h2p(7) }]}>
            {/* {simpleDate()} */}
            2022.06.28
          </Text>
        </View>
      </View>
    );
  }, []);

  if (notificationQuery.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} />}
        title="알림" />
      <FlatList
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        refreshing={notificationQuery.isLoading}
        onRefresh={() => notificationQuery.refetch()}
        onEndReached={() => {
          if (notificationQuery.data &&
            notificationQuery.data.pages.flat().length > 19) {
            notificationQuery.fetchNextPage();
          }
        }}
        data={notificationQuery.data?.pages.flat()}
        renderItem={renderItem}
        keyExtractor={v => v.id.toString()}
      />
    </>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: d2p(20)
  },
  notiText: {
    fontSize: 12,
    color: theme.color.grayscale.C_79737e,
    marginTop: h2p(5)
  }
});