import { Dimensions, FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import { d2p, h2p } from '~/utils';
import mainLogo from '~/assets/logo';
import { hitslop } from '~/utils/constant';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import theme from '~/styles/theme';
import { noticeIcon } from '~/assets/icons';
import { isNotiReadState, myIdState, tokenState } from '~/recoil/atoms';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { FONT } from '~/styles/fonts';
import {
  beerFoodlog, begunFoodlog, breadFoodlog, cafeFoodlog, cakeFoodlog, campFoodlog,
  coupangImage, dieterFoodlog, etcImage, kurlyImage, naverImage, newFoodlog, riceFoodlog, ssgImage
} from '~/assets/images/home';
import { interestTagData } from '~/utils/data';
import { fireImg } from '~/assets/images';
import { useQuery } from 'react-query';
import { getMyProfile } from '~/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyProfileType } from '~/types/user';
import FastImage from 'react-native-fast-image';
import { getBanner, getFoodLogCount, getRecommendFoodLog } from '~/api/home';
import Loading from '~/components/loading';
import { loading } from '~/assets/gif';

export interface HomeProps {
  navigation: NavigationStackProp;
  route: NavigationRoute;
}

interface BannerType {
  id: number,
  image: string,
  content: string,
  isActive: boolean,
  priority: number
}

interface RecommendFoodType {
  id: number,
  title: string,
  contents: Array<{
    author: string,
    id: number,
    reviewId: number,
    countMessage: string,
    likeCount: number,
    comment: string,
    image: string | null
  }>
}

const Home = ({ navigation }: HomeProps) => {
  const bannerListRef = useRef<FlatList>(null);
  const [token, setToken] = useRecoilState(tokenState);
  const setMyId = useSetRecoilState(myIdState);
  const isNotiRead = useRecoilValue(isNotiReadState);
  const [scrollIdx, setScrollIdx] = useState(0);

  const getBannerQuery = useQuery<BannerType[], Error>("banner", () => getBanner(token));
  const getFoodLogCountQuery = useQuery<{ count: number }, Error>("foodLogCount", () => getFoodLogCount(token));
  const getRecommendFoodQuery = useQuery<RecommendFoodType, Error>("recommendFoodLog", () =>
    getRecommendFoodLog({ token, sort: "0" }));

  useQuery<MyProfileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token,
    onSuccess: (data) => {
      if (data) {
        setMyId(data.id);
      }
    },
    onError: () => {
      setToken("");
      AsyncStorage.removeItem("token");
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  });

  useEffect(() => {
    // * 배너 자동 스크롤
    const totalIndex = getBannerQuery.data?.length || 0;
    let index = 0;
    if (getBannerQuery.data && getBannerQuery.data?.length > 0) {
      setInterval(() => {
        index++;
        if (index < totalIndex) {
          bannerListRef.current?.scrollToIndex({ animated: true, index: index });
        }
        else {
          index = 0;
          bannerListRef.current?.scrollToIndex({ animated: true, index });
        }
      }, 3000);
    }
  }, [getBannerQuery.data?.length]);

  return (
    <>
      <Header
        bgColor={theme.color.grayscale.f7f7fc}
        isBorder={false}
        headerLeft={<View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: Dimensions.get("window").width - d2p(40)
        }}>
          <Image source={mainLogo} resizeMode="contain" style={{ width: d2p(96), height: d2p(20) }} />
          <Pressable hitSlop={hitslop} onPress={() => navigation.navigate("notification")} >
            {!isNotiRead &&
              <View style={{
                position: "absolute",
                top: 0,
                right: 0,
                borderRadius: 4,
                width: d2p(4), height: d2p(4), backgroundColor: theme.color.main
              }} />
            }
            <Image source={noticeIcon} style={{ width: d2p(24), height: d2p(24) }} />
          </Pressable>
        </View>} />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={[FONT.Bold, { fontSize: 12, marginTop: h2p(10), marginLeft: d2p(20) }]}>
            구매처별 푸드로그 바로 보기
          </Text>
          <View style={{
            flexDirection: "row", marginTop: h2p(10),
            width: Dimensions.get("window").width - d2p(40),
            alignSelf: "center",
            justifyContent: "space-between"
          }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Feed", { market: "네이버 쇼핑" })}
              style={styles.ImageWrap}>
              <Image source={naverImage} style={styles.marketImage} />
              <Text style={[FONT.Regular, { fontSize: 12 }]}>네이버 쇼핑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Feed", { market: "마켓컬리" })}
              style={styles.ImageWrap}>
              <Image source={kurlyImage} style={styles.marketImage} />
              <Text style={[FONT.Regular, { fontSize: 12 }]}>마켓컬리</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Feed", { market: "SSG" })}
              style={styles.ImageWrap}>
              <Image source={ssgImage} style={styles.marketImage} />
              <Text style={[FONT.Regular, { fontSize: 12 }]}>SSG</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Feed", { market: "쿠팡" })}
              style={styles.ImageWrap}>
              <Image source={coupangImage} style={styles.marketImage} />
              <Text style={[FONT.Regular, { fontSize: 12 }]}>쿠팡</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Feed", { market: "기타" })}
              style={styles.ImageWrap}>
              <Image source={etcImage} style={[styles.marketImage, { marginRight: 0 }]} />
              <Text style={[FONT.Regular, { fontSize: 12 }]}>기타</Text>
            </TouchableOpacity>
          </View>
          <View>
            {getBannerQuery.isLoading ?
              <View style={styles.banner}>
                <Loading viewStyle={{ top: 0 }} />
              </View>
              :
              <>
                <FlatList
                  ref={bannerListRef}
                  horizontal
                  pagingEnabled
                  bounces={false}
                  onScroll={e => {
                    setScrollIdx(Math.min(
                      getBannerQuery.data?.length ?? 0,
                      Math.max(0, Math.round(e.nativeEvent.contentOffset.x / (Dimensions.get("window").width - d2p(20))))));
                  }}
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  data={getBannerQuery.data}
                  renderItem={({ item }) => (
                    <View style={styles.banner}>
                      <Image
                        style={{
                          width: "100%", height: h2p(80),
                          borderRadius: 10,
                        }}
                        source={{ uri: item.image }} />
                    </View>
                  )}
                />
                {(getBannerQuery.data?.length || 0) > 1 &&
                  <View style={{
                    position: "absolute", bottom: h2p(10),
                    flexDirection: "row",
                    alignSelf: "center"
                  }}>
                    {React.Children.toArray(getBannerQuery.data?.map((_, i) => {
                      if (i === scrollIdx) {
                        return (
                          <View style={{
                            width: d2p(6), height: d2p(6),
                            borderRadius: 6,
                            backgroundColor: theme.color.main,
                            marginRight: d2p(10)
                          }} />
                        );
                      }
                      return (
                        <View style={{
                          width: d2p(6), height: d2p(6),
                          borderRadius: 6,
                          backgroundColor: theme.color.white,
                          marginRight: d2p(10)
                        }} />
                      );
                    }))}
                  </View>
                }
              </>
            }
          </View>

          <View style={[styles.foodlogWrap, styles.borderBar]}>
            {React.Children.toArray(interestTagData.interest.map((v) => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Feed", { foodLog: v.title })}
                style={styles.foodlog}>
                {(
                  () => {
                    switch (v.title) {
                      case "빵식가": {
                        return <Image source={breadFoodlog} style={styles.foodlogImg} />;
                      }
                      case "애주가": {
                        return <Image source={beerFoodlog} style={styles.foodlogImg} />;
                      }
                      case "디저트러버": {
                        return <Image source={cakeFoodlog} style={styles.foodlogImg} />;
                      }
                      case "캠퍼": {
                        return <Image source={campFoodlog} style={styles.foodlogImg} />;
                      }
                      case "오늘한끼": {
                        return <Image source={riceFoodlog} style={styles.foodlogImg} />;
                      }
                      case "다이어터": {
                        return <Image source={dieterFoodlog} style={styles.foodlogImg} />;
                      }
                      case "비건": {
                        return <Image source={begunFoodlog} style={styles.foodlogImg} />;
                      }
                      case "홈카페": {
                        return <Image source={cafeFoodlog} style={styles.foodlogImg} />;
                      }
                      case "신상탐험대": {
                        return <Image source={newFoodlog} style={styles.foodlogImg} />;
                      }
                      default:
                        return null;
                    }
                  }
                )()}
                <Text style={FONT.Medium}>{v.title}</Text>
              </TouchableOpacity>
            )))}
            <TouchableOpacity
              onPress={() => navigation.navigate("Feed", { foodLog: "all" })}
              style={{
                borderColor: theme.color.grayscale.ff5d5d,
                borderWidth: 1,
                borderRadius: 20,
                paddingVertical: h2p(10),
                alignItems: "center",
                width: Dimensions.get("window").width - d2p(40),
                shadowColor: "rgba(0, 0, 0, 0.16)",
                backgroundColor: theme.color.white,
                shadowOffset: {
                  width: 0,
                  height: 3
                },
                shadowRadius: 6,
                shadowOpacity: 1,
              }}>
              <Text style={FONT.Bold}>실시간
                <Text style={{ color: theme.color.main }}> {getFoodLogCountQuery.data?.count}개</Text>
                의 모든 푸드로그 보기!</Text>
            </TouchableOpacity>
          </View>

          {/* 추천컨텐츠 개발후 주석해제 */}
          {/* <View style={[styles.borderBar, { paddingVertical: h2p(30), paddingHorizontal: d2p(15) }]}>
            <View style={[styles.title, { marginBottom: h2p(10), marginHorizontal: d2p(5) }]}>
              <Text style={[FONT.Bold, { fontSize: 18 }]}>
                {`추천컨텐츠\n제목(어드민에서 입력)`}
              </Text>
              <Text style={[FONT.Regular, {
                fontSize: 12,
                color: theme.color.grayscale.C_443e49
              }]}>
                추천컨텐츠 테마에 대한 설명
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity>
                <View style={{
                  marginVertical: h2p(10),
                  marginHorizontal: d2p(5),
                  width: d2p(155), aspectRatio: 1, backgroundColor: theme.color.white, borderRadius: 5
                }} />
                <Text style={[FONT.Medium, { fontSize: 12, width: d2p(155) }]}>
                  컨텐츠에 대한 간략한 설명 (어드민 입력)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <View style={{
                  marginVertical: h2p(10),
                  marginHorizontal: d2p(5),
                  width: d2p(155), aspectRatio: 1, backgroundColor: theme.color.white, borderRadius: 5
                }} />
                <Text style={[FONT.Medium, { fontSize: 12, width: d2p(155) }]}>
                  컨텐츠에 대한 간략한 설명 (어드민 입력)
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}

          <View style={[styles.borderBar, { paddingVertical: h2p(30) }]}>
            <View style={[styles.title, { marginHorizontal: d2p(20) }]}>
              <Text style={[FONT.Bold, { fontSize: 18 }]}>
                {/* {`지금 뉴뉴에서\n가장 많이 담긴 푸드로그는?!`} */}
                {getRecommendFoodQuery.data?.title}
              </Text>
              {/* 더보기 잠시 주석처리 */}
              {/* <TouchableOpacity
                hitSlop={hitslop}
                onPress={() => navigation.navigate("Feed", { sort: "2" })}>
                <Text style={[FONT.Medium, {
                  color: theme.color.grayscale.a09ca4, fontSize: 12
                }]}>{`더보기 >`}
                </Text>
              </TouchableOpacity> */}
            </View>

            <FlatList
              horizontal
              contentContainerStyle={{ paddingHorizontal: d2p(15) }}
              style={{ marginTop: h2p(30) }}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              data={getRecommendFoodQuery.data?.contents.slice(0, 5)}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => navigation.navigate("FeedDetail", { id: item.reviewId })}
                  style={{ paddingTop: h2p(11.5) }}>
                  {item.countMessage &&
                    <View style={{
                      width: d2p(130), height: d2p(23), backgroundColor: theme.color.white,
                      borderWidth: 1,
                      borderColor: theme.color.grayscale.e9e7ec,
                      borderRadius: 11.5,
                      justifyContent: "center",
                      alignItems: "center",
                      position: "absolute",
                      alignSelf: "center",
                      top: 0,
                      zIndex: 10,
                      flexDirection: "row"
                    }}>
                      <Image source={fireImg} style={{ width: d2p(15), height: d2p(15) }} />
                      <Text style={[FONT.Medium, { fontSize: 13 }]}><Text style={{ color: theme.color.main }}>
                        {`${item.countMessage.split("명")[0]}명`}
                      </Text>
                        {`${item.countMessage.split("명")[1]}`}
                      </Text>
                    </View>
                  }
                  <View style={{
                    width: d2p(180),
                    marginHorizontal: d2p(5),
                    backgroundColor: theme.color.white,
                    borderRadius: 10,
                    paddingHorizontal: d2p(12),
                    paddingVertical: d2p(10),
                  }}>
                    {item.image &&
                      <FastImage style={{
                        backgroundColor: theme.color.grayscale.f7f7fc,
                        borderRadius: 5,
                        marginVertical: h2p(10),
                        width: "100%",
                        aspectRatio: 1
                      }}
                        source={{ uri: item.image }}
                      />}
                    <Text style={[FONT.Regular, { lineHeight: 20 }]}>
                      <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
                        {item.author}
                      </Text><Text style={[FONT.Regular, { fontSize: 12 }]}>{`님의\n`}</Text>
                      {item.comment}
                    </Text>
                  </View>
                </Pressable>
              )}
            />

          </View>
        </View>
      </ScrollView >
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.color.grayscale.f7f7fc,
    marginBottom: h2p(80)
  },
  marketImage: {
    width: d2p(52),
    height: d2p(52),
    marginBottom: h2p(6)
  },
  ImageWrap: {
    alignItems: "center",
    marginRight: d2p(15),
  },
  banner: {
    width: Dimensions.get("window").width - d2p(20),
    height: h2p(80),
    marginTop: h2p(20),
    borderRadius: 10,
    marginHorizontal: d2p(10),
    borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec
  },
  borderBar: {
    borderTopWidth: 4,
    borderTopColor: theme.color.grayscale.eae7ec,
  },
  foodlogWrap: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(25),
    marginTop: h2p(15),
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    backgroundColor: theme.color.white
  },
  foodlog: {
    width: d2p(90),
    height: d2p(90),
    borderRadius: 20,
    marginBottom: h2p(25),
    backgroundColor: theme.color.white,
    shadowColor: "rgba(160, 156, 164, 0.2)",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: (Platform.OS === 'android') ? 4 : 0,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eae7ec",
    justifyContent: "center",
    alignItems: "center"
  },
  foodlogImg: {
    width: d2p(36),
    height: d2p(36),
    marginBottom: h2p(8)
  },
  title: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  }
});