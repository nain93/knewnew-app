import { Dimensions, FlatList, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import Header from '~/components/header';
import { NavigationStackProp } from 'react-navigation-stack';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p, simpleDate } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { mention, notiBookmark, notiComment, notiHeart, notiLike, notiMention, notiRecomment, notiView, reknewRenewal } from '~/assets/icons/notificationIcon';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { allReadNotification, notificationList } from '~/api/setting';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isNotiReadState, tokenState } from '~/recoil/atoms';
import { knewnewIcon } from '~/assets/icons';
import Loading from '~/components/loading';
import { NotificationListType } from '~/types/setting';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface NotiContainerProp {
  source: ImageSourcePropType,
  title: string,
  isRead: boolean
}

const NotiContainer = ({ source, title, isRead }: NotiContainerProp) => {
  return (
    <>
      <Image source={source} resizeMode="contain" style={{ width: d2p(24), height: d2p(24) }} />
      <View>
        {!isRead &&
          <View style={{
            position: "absolute",
            top: 3,
            right: -5,
            width: d2p(4), height: d2p(4), backgroundColor: theme.color.main, borderRadius: 4
          }} />
        }
        <Text style={[FONT.Regular, styles.notiText]}>
          {title}
        </Text>
      </View>
    </>
  );
};

interface NotificationProps {
  navigation: NavigationStackProp;
}

const Notification = ({ navigation }: NotificationProps) => {
  const token = useRecoilValue(tokenState);
  const setIsNotiReadState = useSetRecoilState(isNotiReadState);
  const queryClient = useQueryClient();

  const notificationQuery = useInfiniteQuery<NotificationListType[], Error>("notiList", ({ pageParam = 0 }) =>
    notificationList({ token, offset: pageParam }), {
    getNextPageParam: (next, all) => all.flat().length,
  });

  const isReadNotification = useMutation("isReadNotification", () => allReadNotification({ token }));

  useEffect(() => {
    setIsNotiReadState(true);
    AsyncStorage.setItem("isNotiReadState", JSON.stringify(true));
    return () => {
      // * 읽음처리 캐시 컨트롤
      isReadNotification.mutate();
      queryClient.setQueryData<{ pageParams: Array<any>, pages: Array<NotificationListType> } | undefined>("notiList", postData => {
        if (postData) {
          return { ...postData, pages: postData.pages.flat().map(v => ({ ...v, isRead: true })) };
        }
      });
    };
  }, []);

  const renderItem = useCallback(({ item }: { item: NotificationListType, index: number }) => {
    return (
      <Pressable
        onPress={() => {
          if (item.link.includes("review")) {
            navigation.navigate("FeedDetail", { id: item.link.split("/")[1] });
          }
          else {
            navigation.navigate("HomeStackNav");
          }
        }}
        style={{ flexDirection: "row" }}>
        <View style={{
          marginRight: d2p(10),
          width: d2p(42), height: h2p(42),
          alignItems: "center", marginVertical: h2p(20)
        }}>
          {(() => {
            switch (item.type) {
              case "review_popular": {
                return (
                  <NotiContainer source={reknewRenewal} isRead={item.isRead} title="활동" />
                );
              }
              case "review_comment": {
                return (
                  <NotiContainer source={notiComment} isRead={item.isRead} title="댓글" />
                );
              }
              case "review_comment_like": {
                return (
                  <NotiContainer source={notiHeart} isRead={item.isRead} title="좋아요" />
                );
              }
              case "review_child_comment": {
                return (
                  <NotiContainer source={notiRecomment} isRead={item.isRead} title="답글" />
                );
              }
              case "comment_mention": {
                return (
                  <NotiContainer source={notiMention} isRead={item.isRead} title="언급" />
                );
              }
              case "review_like": {
                return (
                  <NotiContainer source={notiLike} isRead={item.isRead} title="좋아요" />
                );
              }
              case "review_bookmark": {
                return (
                  <NotiContainer source={notiBookmark} isRead={item.isRead} title="담기" />
                );
              }
              case "admin_noti": {
                return (
                  <NotiContainer source={reknewRenewal} isRead={item.isRead} title="알림" />
                );
              }
              case "review_view": {
                return (
                  <NotiContainer source={notiView} isRead={item.isRead} title="활동" />
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
          paddingVertical: h2p(20),
        }}>
          {item.message.includes(":") ?
            <View style={{ flexDirection: "row", width: Dimensions.get("window").width - d2p(92), flexWrap: "wrap" }}>
              <Text style={[FONT.Regular, { lineHeight: 20 }]}>
                {item.message.split(":")[0]}
              </Text>
              <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, lineHeight: 20 }]}>
                {` : ${item.message.split(":")[1]}`}
              </Text>
            </View>
            :
            <Text style={[FONT.Regular, { lineHeight: 20 }]}>
              {item.message}
            </Text>
          }

          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4, marginTop: h2p(7) }]}>
            {simpleDate(item.created, "전")}
          </Text>
        </View>
      </Pressable>
    );
  }, []);

  if (notificationQuery.isLoading) {
    return (
      <>
        <Header
          headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} />}
          title="알림" />
        <Loading />
      </>
    );
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
        onRefresh={notificationQuery.refetch}
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