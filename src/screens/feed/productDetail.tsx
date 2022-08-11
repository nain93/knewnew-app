import { Dimensions, FlatList, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { bookmark, circleQuestion, goldStarIcon, graybookmark, settingKnewnew, shareIcon, starIcon } from '~/assets/icons';
import ReviewIcon from '~/components/icon/reviewIcon';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { useQuery } from 'react-query';
import { getProductDetail } from '~/api/product';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';

interface ProductDetailProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    id: number
  }>;
}

interface ProductDetailType {
  id: number,
  brand: string,
  category: string,
  images: string[],
  name: string,
  expectedPrice: number,
  link: string,
  bookmarkCount: number,
  reviews: Array<any>,
  reviewCount: number,
  externalRating: number,
  externalReviewCount: number,
  isBookmark: boolean,
  updated: string
}

const ProductDetail = ({ navigation, route }: ProductDetailProps) => {
  const token = useRecoilValue(tokenState);
  const [rating, setRating] = useState<boolean[]>();

  const productDetailQuery = useQuery<ProductDetailType, Error>(["productDetail", route.params?.id], async () => {
    const detail = await getProductDetail({ token, id: 12 });
    return detail;
    // if (route.params) {
    //   const detail = await getProductDetail({ token, id: route.params?.id });
    //   return detail;
    // }
  }, {
    // enabled: !!route.params?.id
    onSuccess: (data) => {
      const rate = [];
      for (let i = 1; i <= 5; i++) {
        if (Math.floor(data.externalRating) < i) {
          rate.push(false);
        }
        else {
          rate.push(true);
        }
        setRating(rate);
      }
    }
  });

  const foodLogKey = useCallback((v) => v.id.toString(), []);
  const foodLogRenderItem = useCallback(() => {
    return (
      <View style={styles.foodLogItem}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{
            width: d2p(20), height: d2p(20),
            marginRight: d2p(10),
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec
          }} />
          <Text style={[FONT.Medium, { marginRight: d2p(5) }]}>열려라참깨</Text>
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
            · 비싸도FLEX
          </Text>
        </View>
        <ReviewIcon review="best" viewStyle={{ marginVertical: h2p(10) }} />
        <View style={{ flexDirection: "row" }}>
          <View style={{
            marginRight: d2p(5),
            width: d2p(60), height: d2p(60), borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec
          }} />
          <Text
            numberOfLines={5}
            style={[FONT.Medium, {
              lineHeight: 21,
              width: Dimensions.get("window").width - d2p(155),
              height: h2p(60),
              color: theme.color.grayscale.C_79737e
            }]}>
            닭가슴살만 먹기 질려서 이거 사봤는데, 고구마 달달하니 맛있어요
            직장인 도시락으로도 괜찮ㅁzxvㅁㅁㅁzxv...
          </Text>
          <Text style={[FONT.Medium, {
            textAlign: "right",
            color: theme.color.grayscale.a09ca4, fontSize: 12,
            position: "absolute", right: 0, bottom: 0,
            lineHeight: 21
          }]}>
            {`더보기 >`}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon />}
        title="상품 상세" />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: theme.color.grayscale.f7f7fc
        }}
      >
        <View style={styles.mainImage}>
          <View style={{
            position: "absolute",
            right: d2p(20),
            bottom: d2p(20),
            flexDirection: "row", alignItems: "center",
            width: Dimensions.get("window").width - d2p(40)
          }}>
            <Text style={[FONT.Regular, { color: theme.color.grayscale.eae7ec, marginRight: "auto" }]}>출처</Text>
            <TouchableOpacity onPress={() => console.log("상품 공유하기")}>
              <Image source={shareIcon} style={{ marginRight: d2p(10), width: d2p(26), height: d2p(26) }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log("상품 북마크")}>
              <Image source={productDetailQuery.data?.isBookmark ? graybookmark : bookmark} style={{ width: d2p(26), height: d2p(26) }} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.productContent}>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, marginBottom: h2p(5) }]}>
            {productDetailQuery.data?.brand}
          </Text>
          <Text style={[FONT.Bold, { fontSize: 18 }]}>
            {productDetailQuery.data?.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: h2p(10) }}>
            <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>
              예상가격 {productDetailQuery.data?.expectedPrice}원
            </Text>
            <Pressable onPress={() => console.log("popup")}>
              <Image source={circleQuestion} style={{ marginLeft: d2p(7), width: d2p(16), height: d2p(16) }} />
            </Pressable>
            <TouchableOpacity
              onPress={() => {
                if (productDetailQuery.data?.link) {
                  Linking.openURL(productDetailQuery.data?.link);
                }
              }}
              style={{ marginLeft: "auto", }}>
              <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>
                {`최저가로 이동하기 >`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{
          paddingHorizontal: d2p(20),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: h2p(20)
        }}>
          <Text style={[FONT.Bold, { color: theme.color.grayscale.C_443e49, fontSize: 16 }]}>
            Best 푸드로그
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("ProductList")}>
            <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>
              <Text style={[FONT.Regular, { color: theme.color.main }]}>
                {productDetailQuery.data?.reviewCount}개
              </Text>
              {` 전체 보기 >`}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: d2p(20), paddingRight: d2p(10) }}
          style={{
            marginTop: h2p(20),
            marginBottom: h2p(40)
          }}
          data={[{ id: 0, content: "11" }, { id: 1, content: "22" }, { id: 2, content: "33" }]}
          renderItem={foodLogRenderItem}
          keyExtractor={foodLogKey}
        />
        <View style={{ paddingHorizontal: d2p(20) }}>
          <View style={{
            alignItems: "center",
            flexDirection: "row"
          }}>
            <Text style={[FONT.Bold, { color: theme.color.grayscale.C_443e49, fontSize: 16 }]}>
              포털사이트 평가
            </Text>
            <Pressable onPress={() => console.log("popup")}>
              <Image source={circleQuestion} style={{ marginLeft: d2p(7), width: d2p(16), height: d2p(16) }} />
            </Pressable>
            <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4, marginLeft: "auto" }]}>
              2022-08-01 기준
            </Text>
          </View>
          <View style={{
            flexDirection: "row",
            marginTop: h2p(20),
            marginBottom: h2p(60)
          }}>
            <View style={styles.potalItem}>
              <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.grayscale.C_79737e }]}>
                평균 평점
              </Text>
              <Text style={[FONT.Bold, { fontSize: 20, marginTop: h2p(10), marginBottom: h2p(5.5) }]}>
                {productDetailQuery.data?.externalRating}
                <Text style={[FONT.Regular, { fontSize: 20 }]}>점</Text>
              </Text>
              <View style={{ flexDirection: "row", alignItems: 'center' }}>
                {React.Children.toArray(rating?.map(v => {
                  if (v) {
                    return <Image source={goldStarIcon} style={styles.goldStarIcon} />;
                  }
                  else {
                    return <Image source={starIcon} style={styles.goldStarIcon} />;
                  }
                }
                ))}
              </View>
            </View>
            <View style={styles.potalItem}>
              <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.grayscale.C_79737e }]}>
                총 리뷰 수
              </Text>
              <Text style={[FONT.Bold, { fontSize: 20, marginTop: h2p(20) }]}>
                {productDetailQuery.data?.externalReviewCount}
                <Text style={[FONT.Regular, { fontSize: 20 }]}>개</Text>
              </Text>
            </View>
          </View>
          <Image source={settingKnewnew} style={{
            alignSelf: "center",
            marginBottom: isIphoneX() ? getBottomSpace() : h2p(30),
            marginTop: "auto", width: d2p(96), height: d2p(20)
          }} />
        </View>
      </ScrollView>
    </>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  mainImage: {
    width: Dimensions.get("window").width,
    aspectRatio: 1,
    backgroundColor: theme.color.white
  },
  productContent: {
    paddingHorizontal: d2p(20),
    paddingTop: h2p(20),
    paddingBottom: h2p(40),
    backgroundColor: theme.color.white
  },
  productFoodLog: {
    paddingVertical: h2p(20)
  },
  foodLogItem: {
    width: d2p(290),
    height: h2p(145),
    padding: d2p(10),
    marginRight: d2p(10),
    backgroundColor: theme.color.white,
    borderRadius: 4
  },
  potalItem: {
    width: d2p(155), height: h2p(95),
    borderRadius: 15,
    backgroundColor: theme.color.white,
    marginRight: d2p(10),
    alignItems: "center",
    paddingVertical: h2p(10)
  },
  goldStarIcon: {
    width: d2p(12),
    height: d2p(12),
    marginRight: d2p(2.6)
  }
});