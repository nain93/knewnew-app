import {
  Animated,
  Dimensions, Easing, FlatList, Image, Linking, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import { d2p, h2p } from '~/utils';
import { hitslop } from '~/utils/constant';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import theme from '~/styles/theme';
import { eyesIcon, graysearch, mainPlusIcon } from '~/assets/icons';
import { myIdState, tokenState } from '~/recoil/atoms';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { FONT } from '~/styles/fonts';
import {
  beerFoodlog, begunFoodlog, breadFoodlog, cafeFoodlog, cakeFoodlog, campFoodlog,
  coupangImage, dieterFoodlog, etcImage, kurlyImage, naverImage, newFoodlog, riceFoodlog, ssgImage
} from '~/assets/images/home';
import { categoryData, interestTagData } from '~/utils/data';
import { fireImg } from '~/assets/images';
import { useQuery } from 'react-query';
import { getMyProfile } from '~/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyProfileType } from '~/types/user';
import FastImage from 'react-native-fast-image';
import { getBanner, getFoodLogCount, getRecommend, getRecommendFoodLog } from '~/api/home';
import Loading from '~/components/loading';
import SplashScreen from 'react-native-splash-screen';
import { homeLogo } from '~/assets/logo';
import BasicButton from '~/components/button/basicButton';
import { useFocusEffect } from '@react-navigation/native';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import MarketLayout from '~/components/layout/MarketLayout';
import CategoryLayout from '~/components/layout/CategoryLayout';

export interface HomeProps {
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

interface RecommendType {
  id: number,
  subtitle: string,
  title: string,
  contents: Array<{
    id: number,
    review: number,
    comment: string,
    image: string | null
  }>
}

const Home = ({ navigation, route }: HomeProps) => {
  const [filterScreen, setFilterScreen] = useState<"푸드로그" | "찾아보기">("찾아보기");
  const moveAnim = useRef(new Animated.Value(90)).current;
  const [token, setToken] = useRecoilState(tokenState);
  const setMyId = useSetRecoilState(myIdState);
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

  const moveOn = () => {
    Animated.timing(moveAnim, {
      toValue: d2p(90),
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  const moveOff = async () => {
    Animated.timing(moveAnim, {
      toValue: d2p(0),
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  useEffect(() => {
    if (route.params?.scrollUp) {
      homeRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [route.params]);

  useFocusEffect(useCallback(() => {
    // * 화면 들어올때마다 배너 새로고침
    getBannerQuery.refetch();
  }, []));

  return (
    <>
      <View
        style={{ height: getStatusBarHeight() }}
      />
      <ScrollView
        // ref={homeRef}
        // refreshControl={
        //   <RefreshControl
        //     refreshing={
        //       getFoodLogCountQuery.isLoading &&
        //       getRecommendFoodQuery.isLoading &&
        //       getRecommendQuery.isLoading}
        //     onRefresh={() => {
        //       getFoodLogCountQuery.refetch();
        //       getRecommendQuery.refetch();
        //       getRecommendFoodQuery.refetch();
        //       getBannerQuery.refetch();
        //     }}
        //   />
        // }
        showsVerticalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: h2p(143) }}
      >
        {/* 헤더 */}
        <View style={styles.filterWrap}>
          <Animated.View style={[styles.filter, {
            position: "absolute",
            width: d2p(90),
            height: "100%",
            borderWidth: filterScreen === "푸드로그" ? 1 : 0,
            transform: [{ translateX: moveAnim }],
            borderColor: filterScreen === "푸드로그" ? theme.color.main : theme.color.grayscale.e9e7ec,
          }]} />
          <Pressable
            onPress={() => {
              setFilterScreen("푸드로그");
              moveOff();
            }}
            style={styles.filter}>
            <Text style={[
              filterScreen === "푸드로그" ? FONT.Bold : FONT.Medium
              , {
                color: filterScreen === "푸드로그" ? theme.color.main : theme.color.grayscale.d2d0d5
              }]}>
              푸드로그
            </Text>
          </Pressable>

          <Animated.View style={[styles.filter, {
            position: "absolute",
            width: d2p(90),
            height: "100%",
            borderWidth: filterScreen === "찾아보기" ? 1 : 0,
            transform: [{ translateX: moveAnim }],
            borderColor: filterScreen === "찾아보기" ? theme.color.main : theme.color.grayscale.e9e7ec,
          }]} />
          <Pressable
            onPress={() => {
              setFilterScreen("찾아보기");
              moveOn();
            }}
            style={styles.filter}>
            <Text style={[
              filterScreen === "찾아보기" ? FONT.Bold : FONT.Medium, {
                marginLeft: d2p(10),
                color: filterScreen === "찾아보기" ? theme.color.main : theme.color.grayscale.d2d0d5
              }]}>
              찾아보기
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => navigation.navigate("search")}
          style={{
            marginLeft: "auto",
            position: "absolute", right: d2p(15)
          }}
          hitSlop={hitslop}>
          <Image source={graysearch} style={{ width: d2p(30), height: d2p(30) }} />
        </Pressable>

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
            viewStyle={{ marginTop: h2p(15), marginBottom: h2p(60) }}
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

              }
              else {
                // * 찾아보기
              }
            }}
            text={category.every(v => !v.isClick) ? "모두보기" : "찾아보기"} textColor={theme.color.main}
            bgColor={theme.color.white}
          />
        </View>
      </ScrollView >
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingTop: h2p(23)
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
    marginTop: h2p(20),
    borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec
  },
});