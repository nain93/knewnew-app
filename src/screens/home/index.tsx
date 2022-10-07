import {
  Dimensions, Linking, Pressable,
  ScrollView, StyleSheet, Text, View
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import theme from '~/styles/theme';
import { tokenState } from '~/recoil/atoms';
import { useRecoilState } from 'recoil';
import { FONT } from '~/styles/fonts';
import { categoryData } from '~/utils/data';
import { useQuery } from 'react-query';
import FastImage from 'react-native-fast-image';
import { getBanner } from '~/api/home';
import Loading from '~/components/loading';
import BasicButton from '~/components/button/basicButton';
import { useFocusEffect } from '@react-navigation/native';
import MarketLayout from '~/components/layout/MarketLayout';
import CategoryLayout from '~/components/layout/CategoryLayout';
import { FilterType } from '~/types';
import FoodLog from '~/screens/feed/foodLog';

export interface HomeProps {
  filterScreen: FilterType,
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    scrollUp: boolean
  }>;
}

interface BannerType {
  id: number,
  image: string,
  content: string,
  isActive: boolean,
  priority: number,
  link: string
}

const Home = ({ navigation, route, filterScreen }: HomeProps) => {
  const [token, setToken] = useRecoilState(tokenState);
  const homeRef = useRef<ScrollView>(null);

  const [markets, setMarkets] = useState<string[]>([]);
  const [category, setCategory] = useState<{
    title: string,
    isClick: boolean,
  }[]>(categoryData);

  const getBannerQuery = useQuery<BannerType, Error>("banner", () => getBanner(token));
  // const getFoodLogCountQuery = useQuery<{ count: number }, Error>("foodLogCount", () => getFoodLogCount(token));
  // const getRecommendQuery = useQuery<RecommendType, Error>("recommend", () => getRecommend({ token }));
  // const getRecommendFoodQuery = useQuery<RecommendFoodType, Error>("recommendFoodLog", () =>
  //   getRecommendFoodLog({ token, sort: "0" }));
  // useQuery<MyProfileType, Error>(["myProfile", token], () => getMyProfile(token), {
  //   enabled: !!token,
  //   onSuccess: (data) => {
  //     if (data) {
  //       setMyId(data.id);
  //     }
  //   },
  //   onError: () => {
  //     setToken("");
  //     AsyncStorage.removeItem("token");
  //     //@ts-ignore
  //     navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
  //   }
  // });

  // useEffect(() => {
  //   if (getFoodLogCountQuery.data) {
  //     SplashScreen.hide();
  //   }
  // }, [getFoodLogCountQuery.data]);

  useEffect(() => {
    if (route.params?.scrollUp) {
      homeRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [route.params]);

  useFocusEffect(useCallback(() => {
    // * 화면 들어올때마다 배너 새로고침
    getBannerQuery.refetch();
  }, []));

  if (filterScreen === "찾아보기") {
    return (
      <>
        <ScrollView
          bounces={false}
          ref={homeRef}
          showsVerticalScrollIndicator={false}
          style={styles.container}
          contentContainerStyle={{ paddingBottom: h2p(143) }}
        >
          {/* 배너 */}
          {getBannerQuery.isLoading ?
            <View style={[styles.banner, { height: h2p(120) }]}>
              <Loading viewStyle={{ top: h2p(20) }} />
            </View>
            :
            <Pressable
              onPress={() => {
                if (getBannerQuery.data?.link) {
                  Linking.openURL(getBannerQuery.data?.link);
                }
              }}
              style={styles.banner}>
              <FastImage
                style={{ width: "100%", height: h2p(130) }}
                source={{ uri: getBannerQuery.data?.image }} />
            </Pressable>
          }

          {/* 상품 탐색 */}
          <View style={{
            paddingHorizontal: d2p(20),
            paddingTop: h2p(40)
          }}>
            <Text style={[FONT.Bold, { fontSize: 20 }]}>
              🔍 어떤 상품을 찾아볼까요?
            </Text>
            <Text style={[FONT.SemiBold, { fontSize: 16, marginTop: h2p(40) }]}>
              구매처
            </Text>
            <MarketLayout
              viewStyle={{ marginTop: h2p(15) }}
              markets={markets}
              setMarkets={(market: string[]) => setMarkets(market)} />
            <Text style={[FONT.SemiBold, { fontSize: 16, marginTop: h2p(40) }]}>
              카테고리
            </Text>
            <CategoryLayout
              viewStyle={{ marginTop: h2p(15), marginBottom: h2p(50) }}
              category={category}
              setCategory={(cate: {
                title: string,
                isClick: boolean,
              }[]) => setCategory(cate)}
            />
            <BasicButton
              onPress={() => {
                if (category.every(v => !v.isClick)) {
                  // * 모두보기
                  navigation.push("Feed", { foodLog: "all" });
                }
                else {
                  // * 찾아보기
                  navigation.push("Feed", { markets, foodLog: category.filter(v => v.isClick) });
                }
              }}
              text={(!category.every(v => !v.isClick) || (!markets.every(v => !v))) ? "찾아보기" : "모두보기"} textColor={theme.color.main}
              bgColor={theme.color.white}
            />
          </View>
        </ScrollView >
      </>
    );
  }

  else {
    return (
      <FoodLog navigation={navigation} route={route} />
    );
  }
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingTop: h2p(20)
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: d2p(20),
  },
  filterWrap: {
    flexDirection: "row",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: theme.color.grayscale.e9e7ec,
    width: d2p(180),
    alignSelf: "center"
  },
  filter: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(8),
    borderRadius: 50
  },
  banner: {
    width: Dimensions.get("window").width,
    borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec
  },
});