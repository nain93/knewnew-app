import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { categoryData } from '~/utils/data';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import { NavigationRoute } from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import FeedReview from '~/components/review/feedReview';
import { useInfiniteQuery, useQuery } from 'react-query';
import { getReviewList } from '~/api/review';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import { ReviewListType } from '~/types/review';
import { loading } from '~/assets/gif';
import { whiteClose } from '~/assets/icons';
import { getRecommendFoodLog } from '~/api/home';
import FastImage from 'react-native-fast-image';
import TopScrollButton from '~/components/button/topScrollButton';

interface FoodLogPropType {
  navigation: NavigationStackProp;
  route: NavigationRoute
}

interface RecommendFoodType {
  id: number,
  title: string,
  contents: Array<{
    author: string,
    id: number,
    review: number,
    countMessage: string,
    comment: string,
    image: string | null
  }>
}

const FoodLog = ({ navigation, route }: FoodLogPropType) => {
  const token = useRecoilValue(tokenState);
  const [category, setCategory] = useState(categoryData);
  const [isRecommendOpen, setIsRecommendOpen] = useState(true);
  const [filterBadge, setFilterBadge] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const reviewListQuery = useInfiniteQuery<ReviewListType[], Error>(["reviewList", filterBadge], async ({ pageParam = 0 }) => {
    const queryData = await getReviewList({
      token, tag: filterBadge,
      offset: pageParam, limit: 5, sort: "0"
    });
    return queryData;
  }, {
    getPreviousPageParam: (next, all) => all.flat().length - 5,
    getNextPageParam: (next, all) => all.flat().length
  });

  const getRecommendFoodQuery = useQuery<RecommendFoodType, Error>("recommendFoodLog", () =>
    getRecommendFoodLog({ token, sort: "0" }));

  const reviewKey = useCallback((review) => String(review.id), []);
  const reviewFooter = useCallback(() => <View style={{ height: h2p(117) }} />, []);

  const footerLoading = useCallback(() =>
    <View style={{ height: h2p(117) }}>
      <Image source={loading} style={{ alignSelf: "center", width: d2p(70), height: d2p(70) }} />
    </View>, []);

  const reviewEndReached = useCallback(() => {
    if (reviewListQuery.data &&
      reviewListQuery.data.pages.flat().length > 4 &&
      reviewListQuery.hasNextPage
    ) {
      reviewListQuery.fetchNextPage();
    }
  }, [reviewListQuery]);

  const reviewHeader = useCallback(() => {
    if (isRecommendOpen) {
      return (
        <View style={{
          backgroundColor: theme.color.black,
          paddingVertical: h2p(25)
        }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: d2p(20),
          }}>
            <Text style={[FONT.SemiBold, { fontSize: 18, color: theme.color.white }]}>
              추천 컨텐츠 제목
            </Text>
            <Pressable
              onPress={() => setIsRecommendOpen(false)}
              style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center" }}>
              <Text style={[FONT.SemiBold, { fontSize: 12, color: theme.color.white }]}>
                추천 컨텐츠 닫기
              </Text>
              <Image source={whiteClose} style={{
                marginLeft: d2p(5),
                width: d2p(10), height: d2p(10)
              }} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: d2p(20) }}
          >
            {React.Children.toArray(getRecommendFoodQuery.data?.contents.map((v, i) => (
              <Pressable
                onPress={() => navigation.navigate("FeedDetail", { id: v.review })}
                style={{
                  marginRight: getRecommendFoodQuery.data.contents.length - 1 !== i ? d2p(15) : 0,
                  marginTop: h2p(20),
                  width: d2p(120), borderRadius: 4
                }}>
                {v.image &&
                  <FastImage source={{ uri: v.image }} style={{
                    borderRadius: 4,
                    width: d2p(120), height: d2p(120),
                    marginBottom: h2p(10)
                  }} />
                }
                <Text style={[FONT.Bold, {
                  fontSize: 14,
                  color: theme.color.white,
                  lineHeight: 14
                }]}>{v.author}
                  <Text style={[FONT.Regular, {
                    fontSize: 12,
                    color: theme.color.white,
                    lineHeight: 14
                  }]}>님의</Text>
                </Text>
                <Text style={[FONT.Regular, {
                  fontSize: 12,
                  color: theme.color.white,
                  lineHeight: 14
                }]}>{v.comment}</Text>
              </Pressable>
            )))}
          </ScrollView>
        </View>
      );
    }
    return null;
  }, [isRecommendOpen, getRecommendFoodQuery.isLoading]);

  const reviewRenderItem = useCallback(({ item, index }) =>
    <Pressable
      onPress={() => {
        navigation.push("FeedDetail", {
          authorId: item.author.id,
          id: item.id, badge: filterBadge,
          isLike: item.isLike, isBookmark: item.isBookmark
        });
      }}
      style={styles.review}>
      <FeedReview
        review={item}
        filterBadge={filterBadge}
      />
    </Pressable>
    , [filterBadge]);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: d2p(20),
          paddingTop: h2p(10),
          paddingBottom: h2p(15)
        }}
        style={styles.filterWrap}>
        {React.Children.toArray(category.map((v, i) => (
          <TouchableOpacity
            onPress={() => {
              if (v.title === "전체") {
                setCategory(category.map((clickValue, clickIdx) => {
                  if (clickIdx === i) {
                    return { ...clickValue, isClick: !clickValue.isClick };
                  }
                  else {
                    return { ...clickValue, isClick: false };
                  }
                }));
              }
              else {
                setCategory(category.map((clickValue, clickIdx) => {
                  if (clickIdx === 0) {
                    return { ...clickValue, isClick: false };
                  }
                  else if (clickIdx === i) {
                    return { ...clickValue, isClick: !clickValue.isClick };
                  }
                  else {
                    return clickValue;
                  }
                }));
              }
            }}
            style={[styles.tagWrap, {
              marginRight: i !== category.length - 1 ? d2p(5) : 0,
              backgroundColor: v.isClick ? theme.color.black : theme.color.white,
            }]}>
            <Text style={[FONT.Medium, {
              color: v.isClick ? theme.color.white : theme.color.black,
            }]}>{v.title}</Text>
          </TouchableOpacity>
        )))}
      </ScrollView>
      <FlatList
        ref={flatListRef}
        onEndReached={reviewEndReached}
        refreshing={reviewListQuery.isLoading}
        onRefresh={reviewListQuery.refetch}
        data={reviewListQuery.data?.pages.flat()}
        showsVerticalScrollIndicator={false}
        renderItem={reviewRenderItem}
        ListHeaderComponent={reviewHeader}
        onEndReachedThreshold={0.5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListFooterComponent={reviewListQuery.isFetchingNextPage ? footerLoading : reviewFooter}
        style={{ marginTop: 0, marginBottom: h2p(80) }}
        keyExtractor={reviewKey}
      />
      <TopScrollButton scrollRef={flatListRef} />
    </>
  );
};

export default FoodLog;

const styles = StyleSheet.create({
  review: {
    // backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    marginHorizontal: d2p(10), marginTop: h2p(10),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15),
  },
  filterWrap: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.color.grayscale.e9e7ec,
    borderBottomColor: theme.color.grayscale.e9e7ec,
    flexDirection: "row",
    marginTop: h2p(15),
  },
  tagWrap: {
    borderWidth: 1,
    borderRadius: 30,
    width: d2p(80),
    height: h2p(30),
    justifyContent: "center",
    alignItems: "center",
  }
});