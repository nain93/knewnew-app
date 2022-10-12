import {
  Dimensions, FlatList, Image, Linking, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import Modal from "react-native-modal";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import { d2p, h2p } from '~/utils';
import { hitslop } from '~/utils/constant';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import theme from '~/styles/theme';
import { close, eyesIcon, graysearch, mainPlusIcon, whiteClose } from '~/assets/icons';
import { myIdState, tokenState } from '~/recoil/atoms';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { FONT } from '~/styles/fonts';
import {
  beerFoodlog, begunFoodlog, breadFoodlog, cafeFoodlog, cakeFoodlog, campFoodlog,
  coupangImage, dieterFoodlog, etcImage, kurlyImage, naverImage, newFoodlog, riceFoodlog, ssgImage
} from '~/assets/images/home';
import { interestTagData } from '~/utils/data';
import { eventImage, fireImg } from '~/assets/images';
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
import { isIphoneX } from 'react-native-iphone-x-helper';

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
  priority: number,
  title: string,
  contents: Array<{
    id: number,
    review: number,
    comment: string,
    image: string | null
  }>
}

const Home = ({ navigation, route }: HomeProps) => {
  const [token, setToken] = useRecoilState(tokenState);
  const setMyId = useSetRecoilState(myIdState);
  const homeRef = useRef<ScrollView>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const getBannerQuery = useQuery<BannerType, Error>("banner", () => getBanner(token));
  const getFoodLogCountQuery = useQuery<{ count: number }, Error>("foodLogCount", () => getFoodLogCount(token));
  const getRecommendQuery = useQuery<RecommendType[], Error>("recommend", () => getRecommend({ token }));
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
    if (getFoodLogCountQuery.data) {
      SplashScreen.hide();
    }
  }, [getFoodLogCountQuery.data]);

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
      <Header
        isBorder={false}
        headerLeft={<View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: Dimensions.get("window").width - d2p(40)
        }}>
          <Image source={homeLogo} style={{ width: d2p(104), height: d2p(14) }} />
          <Pressable hitSlop={hitslop} onPress={() => navigation.navigate("search")} >
            <Image source={graysearch} style={{ width: d2p(24), height: d2p(24) }} />
          </Pressable>
        </View>} />

      <ScrollView
        ref={homeRef}
        refreshControl={
          <RefreshControl
            refreshing={
              getFoodLogCountQuery.isLoading &&
              getRecommendFoodQuery.isLoading &&
              getRecommendQuery.isLoading}
            onRefresh={() => {
              getFoodLogCountQuery.refetch();
              getRecommendQuery.refetch();
              getRecommendFoodQuery.refetch();
              getBannerQuery.refetch();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* <Text style={[FONT.ExtraBold, { textAlign: "center", fontSize: 18 }]}>
            FOODLOG ROOM
          </Text>
          <Text style={[FONT.Regular, {
            textAlign: "center",
            marginTop: h2p(5),
            color: theme.color.grayscale.C_79737e
          }]}>
            관심사별 방에 모여 같이 얘기 나눠요!
          </Text>

          <View style={styles.foodlogWrap}>
            {React.Children.toArray([{ title: "모두보기", isClick: false }, ...interestTagData.interest].map((v) => {
              if (!v.title.includes("기타")) {
                return (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Feed",
                      { foodLog: v.title === "모두보기" ? "all" : v.title })}
                    style={[styles.foodlog, {
                      borderColor: v.title === "모두보기" ? theme.color.main : theme.color.grayscale.eae7ec,
                    }]}>
                    {(
                      () => {
                        switch (v.title) {
                          case "모두보기": {
                            return <Image source={eyesIcon} style={styles.foodlogImg} />;
                          }
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
                    <Text style={[FONT.Medium, {
                      color: v.title === "모두보기" ? theme.color.main : theme.color.black,
                      fontSize: 12
                    }]}>{v.title}</Text>
                  </TouchableOpacity>
                );
              }
            }))}
          </View> */}

          <View>
            {getBannerQuery.isLoading ?
              <View style={[styles.banner, { height: h2p(160) }]}>
                <Loading viewStyle={{ top: h2p(20) }} />
              </View>
              :
              <Pressable
                onPress={() => {
                  if (getBannerQuery.data?.link) {
                    if (getBannerQuery.data.link.includes("event")) {
                      setEventModalOpen(true);
                    }
                    else {
                      Linking.openURL(getBannerQuery.data?.link);
                    }
                  }
                }}
                style={styles.banner}>
                <FastImage
                  style={{ width: "100%", height: h2p(160) }}
                  source={{ uri: getBannerQuery.data?.image }} />
              </Pressable>
            }

            <View style={[styles.borderBar, {
              paddingVertical: h2p(40),
              paddingHorizontal: d2p(20)
            }]}>
              <Text style={[FONT.Medium, { fontSize: 12 }]}>
                무료 배송 금액이 남는다면?
              </Text>
              <Text style={[FONT.Bold, { fontSize: 18 }]}>
                구매처별 인생템 구경하기
              </Text>
              <View style={{
                flexDirection: "row", marginTop: h2p(30),
                width: Dimensions.get("window").width - d2p(40),
                alignSelf: "center",
                justifyContent: "space-between"
              }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Feed", { foodLog: "all" })}
                  style={styles.ImageWrap}>
                  <Image source={etcImage} style={[styles.marketImage, { marginRight: 0 }]} />
                  <Text style={[FONT.Regular, { fontSize: 12 }]}>모두보기</Text>
                </TouchableOpacity>
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
              </View>
            </View>

            {getRecommendQuery.data &&
              React.Children.toArray(getRecommendQuery.data.map(v => {
                return (
                  <>
                    <View style={{ paddingVertical: h2p(30), paddingHorizontal: d2p(15) }}>
                      <View style={[styles.title, { marginBottom: h2p(10), marginHorizontal: d2p(5) }]}>
                        <Text style={[FONT.Bold, { fontSize: 18 }]}>
                          {/* {`추천컨텐츠\n제목(어드민에서 입력)`} */}
                          {v.title}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        {
                          React.Children.toArray(v.contents.map(content => (
                            <>
                              <Pressable
                                onPress={() => navigation.navigate("FeedDetail", { id: content.review })}
                              >
                                {content.image &&
                                  <FastImage
                                    source={{ uri: content.image }}
                                    style={{
                                      borderWidth: 1,
                                      borderColor: theme.color.grayscale.eae7ec,
                                      marginVertical: h2p(10),
                                      marginHorizontal: d2p(5),
                                      width: d2p(155), aspectRatio: 1, backgroundColor: theme.color.white, borderRadius: 5
                                    }} />
                                }
                                <Text style={[FONT.Medium, {
                                  fontSize: 14,
                                  width: d2p(155),
                                  marginLeft: d2p(5)
                                }]}>
                                  {content.comment}
                                </Text>
                              </Pressable>

                              {/* <BasicButton
                              onPress={() => {
                                // todo 추천컨텐츠에 맞는 푸드로그 필터로 바꿔주기 (백에서 보내주는 데이터)
                                navigation.navigate("Feed", { foodLog: "애주가" });
                              }}
                              viewStyle={{ marginHorizontal: d2p(5), marginTop: h2p(30), marginBottom: h2p(10) }}
                              bgColor={theme.color.white}
                            text="더보기" borderColor={theme.color.main} textColor={theme.color.main} /> */}
                            </>
                          )))
                        }
                      </View>
                    </View>
                  </>
                );
              }))}


            <View style={[styles.borderBar, { paddingVertical: h2p(40) }]} >
              <View style={[styles.title, { marginHorizontal: d2p(20) }]}>
                <Text style={[FONT.Bold, { fontSize: 18 }]}>
                  {/* {`지금 뉴뉴에서\n가장 많이 담긴 푸드로그는?!`} */}
                  {getRecommendFoodQuery.data?.title}
                </Text>
              </View>
              {/* <FlatList
                horizontal
                contentContainerStyle={{ paddingHorizontal: d2p(15) }}
                style={{ marginTop: h2p(20) }}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                data={getRecommendFoodQuery.data?.contents.slice(0, 5)}
                renderItem={({ item }) => (
                  <Pressable
                    style={{ backgroundColor: theme.color.white }}
                    onPress={() => navigation.navigate("FeedDetail", { id: item.review })}>
                    {item.countMessage &&
                      <View style={{
                        width: d2p(130), height: d2p(23), backgroundColor: theme.color.white,
                        borderWidth: 1,
                        borderColor: theme.color.grayscale.e9e7ec,
                        borderRadius: 11.5,
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
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
                      width: d2p(160),
                      marginHorizontal: d2p(10),
                      backgroundColor: theme.color.white,
                      borderRadius: 10,
                    }}>
                      {item.image &&
                        <FastImage style={{
                          backgroundColor: theme.color.grayscale.f7f7fc,
                          borderRadius: 5,
                          marginTop: h2p(10),
                          width: d2p(160),
                          aspectRatio: 1,
                          borderWidth: 1,
                          borderColor: theme.color.grayscale.eae7ec,
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
                ListFooterComponent={() => (
                  <Pressable
                    // * 인기순 정렬
                    onPress={() => navigation.navigate("Feed", { sort: "1" })}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      width: d2p(100), height: h2p(237)
                    }}>
                    <Image source={mainPlusIcon} style={{ width: d2p(20), height: d2p(20), marginBottom: h2p(5) }} />
                    <Text style={[FONT.Bold, { color: theme.color.main }]}>더보기</Text>
                  </Pressable>
                )}
              /> */}

            </View >
          </View >
        </View >
      </ScrollView >

      {/* 이벤트 이미지 팝업 */}
      <Modal
        isVisible={eventModalOpen}
        style={{ alignItems: "center" }}
        hideModalContentWhileAnimating={true}
        animationIn="fadeIn"
        animationOut="fadeOut"
        onBackdropPress={() => setEventModalOpen(false)}
        backdropTransitionOutTiming={0}
        onBackButtonPress={() => setEventModalOpen(false)}
      >
        <Pressable style={{
          width: Dimensions.get("window").width - d2p(40),
          borderRadius: 10,
        }}
          onPress={() => setEventModalOpen(false)}
        >
          <Image source={whiteClose} style={{
            position: "absolute",
            right: d2p(20),
            top: h2p(15),
            zIndex: 10,
            width: d2p(20), height: d2p(20)
          }} />
          <FastImage
            source={eventImage}
            style={{
              width: Dimensions.get("window").width - d2p(60),
              alignSelf: "center",
              height: isIphoneX() ? h2p(600) : h2p(650),
              borderRadius: 10,
            }}
          />
        </Pressable>
      </Modal >
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    marginBottom: h2p(80),
    paddingTop: h2p(10)
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
    width: Dimensions.get("window").width,
    borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec
  },
  borderBar: {
    borderTopWidth: 4,
    borderTopColor: theme.color.grayscale.f7f7fc,
  },
  foodlogWrap: {
    paddingHorizontal: d2p(15),
    paddingTop: h2p(25),
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap"
  },
  foodlog: {
    width: d2p(62),
    height: d2p(62),
    borderRadius: 10,
    marginBottom: h2p(10),
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
    width: d2p(26),
    height: d2p(26),
    marginBottom: h2p(5)
  },
  title: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  }
});