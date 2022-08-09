import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { circleQuestion, goldStarIcon, settingKnewnew } from '~/assets/icons';
import ReviewIcon from '~/components/icon/reviewIcon';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';

interface ProductDetailProps {
  navigation: NavigationStackProp;
  route: NavigationRoute;
}

const ProductDetail = ({ navigation }: ProductDetailProps) => {

  const foodLogKey = useCallback((v) => v.id.toString(), []);
  const foodLogRenderItem = useCallback(() => {
    return (
      <View style={styles.foodLogItem}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{
            width: d2p(20), height: d2p(20),
            marginRight: d2p(10),
            borderRadius: 20, backgroundColor: "green"
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
            width: d2p(60), height: d2p(60), borderRadius: 4, backgroundColor: "blue"
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
        <View style={styles.mainImage} />
        <View style={styles.productContent}>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, marginBottom: h2p(5) }]}>
            스위트베네
          </Text>
          <Text style={[FONT.Bold, { fontSize: 18 }]}>
            탄단지 고구마를 품은 닭가슴살
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: h2p(10) }}>
            <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>
              예상가격 3,500원
            </Text>
            <Pressable onPress={() => console.log("popup")}>
              <Image source={circleQuestion} style={{ marginLeft: d2p(7), width: d2p(16), height: d2p(16) }} />
            </Pressable>
            <TouchableOpacity
              onPress={() => console.log("최저가 이동")}
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
                2,155개
              </Text>
              {` 전체 보기 >`}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: d2p(20) }}
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
                4
                <Text style={[FONT.Regular, { fontSize: 20 }]}>점</Text>
              </Text>
              <View style={{ flexDirection: "row", alignItems: 'center' }}>
                <Image source={goldStarIcon} style={{ width: d2p(12), height: d2p(12), marginRight: d2p(2.6) }} />
                <Image source={goldStarIcon} style={{ width: d2p(12), height: d2p(12), marginRight: d2p(2.6) }} />
                <Image source={goldStarIcon} style={{ width: d2p(12), height: d2p(12), marginRight: d2p(2.6) }} />
                <Image source={goldStarIcon} style={{ width: d2p(12), height: d2p(12), marginRight: d2p(2.6) }} />
                <Image source={goldStarIcon} style={{ width: d2p(12), height: d2p(12), marginRight: d2p(2.6) }} />
              </View>
            </View>
            <View style={styles.potalItem}>
              <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.grayscale.C_79737e }]}>
                총 리뷰 수
              </Text>
              <Text style={[FONT.Bold, { fontSize: 20, marginTop: h2p(20) }]}>
                34,404
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
    width: Dimensions.get("window").width, aspectRatio: 1,
    backgroundColor: "green"
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
  }
});