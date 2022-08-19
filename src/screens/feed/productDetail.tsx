import { Dimensions, FlatList, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, dateNormalFormat, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { bookmark, circleQuestion, goldStarIcon, graybookmark, settingKnewnew, shareIcon, starIcon } from '~/assets/icons';
import ReviewIcon from '~/components/icon/reviewIcon';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getProductDetail, productBookmark } from '~/api/product';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { okPopupState, tokenState } from '~/recoil/atoms';
import Loading from '~/components/loading';
import { noProfile } from '~/assets/images';
import { ReviewListType, SatisfactionType } from '~/types/review';
import { AuthorType } from '~/types';
import ReadMore from '@fawazahmed/react-native-read-more';
import LinearGradient from 'react-native-linear-gradient';

interface ProductDetailProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    id: number
  }>;
}
interface ReviewsType {
  author: AuthorType,
  id: number,
  content: string,
  image?: string,
  satisfaction: SatisfactionType
}
interface ProductDetailType {
  id: number,
  brand: string,
  category: string,
  images: Array<{
    id: number,
    image: string,
    priority: number
  }>,
  name: string,
  expectedPrice: number,
  link: string,
  reviewBookmarkCount: number,
  productBookmarkCount: number,
  reviews: Array<ReviewListType>,
  reviewCount: number,
  externalRating: number,
  externalReviewCount: number,
  isBookmark: boolean,
  updated: string,
  imageSource: string
}

const ProductDetail = ({ navigation, route }: ProductDetailProps) => {
  const queryClient = useQueryClient();
  const token = useRecoilValue(tokenState);
  const [rating, setRating] = useState<boolean[]>();
  const [priceInfoOpen, setPriceInfoOpen] = useState(false);
  const [isBookmark, setIsBookmark] = useState(false);
  const [apiBlock, setApiBlock] = useState(false);
  const setModalOpen = useSetRecoilState(okPopupState);

  const productDetailQuery = useQuery<ProductDetailType, Error>(["productDetail", route.params?.id], async () => {
    if (route.params) {
      const detail = await getProductDetail({ token, id: route.params?.id });
      return detail;
    }
  }, {
    enabled: !!route.params?.id,
    onSuccess: (data) => {
      setIsBookmark(data.isBookmark);
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
    },
    onError: (error) => {
      setModalOpen({
        isOpen: true,
        content: "아직 등록되지 않은 상품입니다.",
        okButton: () => navigation.goBack(),
        isBackdrop: false,
        isCancleButton: false
      });
    }
  });

  const productBookmarkMutation = useMutation(["productBookmark", route.params?.id], async (isBookmarkProp: boolean) => {
    if (route.params) {
      const bookmarkData = await productBookmark({ token, id: route.params.id, isBookmark: isBookmarkProp });
      return bookmarkData;
    }
  }, {
    onSuccess: async () => {
      queryClient.invalidateQueries("productDetail");
      queryClient.invalidateQueries("userProductBookmark");
    },
    onSettled: () => setApiBlock(false)
  });

  const foodLogKey = useCallback((v) => v.id.toString(), []);
  const foodLogRenderItem = useCallback(({ item }: { item: ReviewsType }) => {
    return (
      <Pressable
        onPress={() => navigation.navigate("FeedDetail", {
          authorId: item.author.id,
          id: item.id,
        })}
        style={styles.foodLogItem}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={item.author.profileImage ? { uri: item.author.profileImage } : noProfile}
            style={{
              width: d2p(20), height: d2p(20),
              marginRight: d2p(10),
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.color.grayscale.e9e7ec
            }} />
          <Text style={[FONT.Medium, { marginRight: d2p(5) }]}>{item.author.nickname}</Text>
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4 }]}>
            · {item.author.tags.foodStyle}
          </Text>
        </View>
        <ReviewIcon review={item.satisfaction} viewStyle={{ marginVertical: h2p(10) }} />
        <View style={{ flexDirection: "row" }}>
          {item.image &&
            <Image
              source={{ uri: item.image }}
              style={{
                marginRight: d2p(5),
                width: d2p(60), height: d2p(60),
                borderRadius: 4,
                borderWidth: 1,
                borderColor: theme.color.grayscale.e9e7ec,
              }} />
          }
          <ReadMore
            seeMoreText="더보기 >"
            expandOnly={true}
            seeMoreStyle={[FONT.Medium, {
              color: theme.color.grayscale.a09ca4, fontSize: 12
            }]}
            numberOfLines={5}
            onSeeMoreBlocked={() => navigation.navigate("FeedDetail", {
              authorId: item.author.id,
              id: item.id,
            })}
            style={[{
              color: theme.color.grayscale.C_79737e,
              lineHeight: 21,
              marginTop: 0,
              marginLeft: item.image ? 0 : d2p(5)
            }, FONT.Medium]}
          >
            {item.content}
          </ReadMore>
        </View>
      </Pressable>
    );
  }, []);

  if (productDetailQuery.isLoading) {
    return (
      <>
        <Header
          headerLeft={<LeftArrowIcon />}
          title="상품 상세" />
        <Loading />
      </>
    );
  }

  if (!productDetailQuery.data) {
    return null;
  }

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
        }}>
        <View style={[styles.mainImage, {}]}>
          <FlatList
            horizontal
            data={productDetailQuery.data?.images}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item.image }} style={{
                width: Dimensions.get("window").width,
                aspectRatio: 1
              }} />
            )}
          />
          <View
            style={{
              position: "absolute",
              bottom: d2p(0),
              flexDirection: "row", alignItems: "center",
              width: Dimensions.get("window").width,
              paddingHorizontal: d2p(20),
              paddingVertical: h2p(5),
              backgroundColor: "rgba(0,0,0,0.4)"
            }}>
            <Text style={[FONT.Regular, { color: theme.color.grayscale.eae7ec, marginRight: "auto" }]}>
              출처 {productDetailQuery.data?.imageSource}
            </Text>
            {/* 상품 공유 기능후 주석 해제 */}
            {/* <TouchableOpacity onPress={() => console.log("상품 공유하기")}>
              <Image source={shareIcon} style={{ marginRight: d2p(10), width: d2p(26), height: d2p(26) }} />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => {
              if (!apiBlock) {
                setIsBookmark(!isBookmark);
                setApiBlock(true);
                productBookmarkMutation.mutate(!isBookmark);
              }
            }}>
              <Image source={isBookmark ? graybookmark : bookmark} style={{ width: d2p(26), height: d2p(26) }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.productContent}>
          <Text style={[FONT.Bold, { color: theme.color.grayscale.a09ca4, marginBottom: h2p(5) }]}>
            {productDetailQuery.data?.brand}
          </Text>
          <Text style={[FONT.Bold, { fontSize: 18 }]}>
            {productDetailQuery.data?.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: h2p(10) }}>
            <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>
              예상가격 {productDetailQuery.data?.expectedPrice}원
            </Text>
            <Pressable onPress={() => setPriceInfoOpen(true)}
              style={{ marginLeft: d2p(7), }}>
              <Image source={circleQuestion} style={{ width: d2p(16), height: d2p(16) }} />
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
          {productDetailQuery.data?.reviewCount > 0 &&
            <TouchableOpacity onPress={() => navigation.navigate("ProductList", { product: productDetailQuery.data?.name })}>
              <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>
                <Text style={[FONT.Regular, { color: theme.color.main }]}>
                  {productDetailQuery.data?.reviewCount}개
                </Text>
                {` 전체 보기 >`}
              </Text>
            </TouchableOpacity>}
        </View>

        {/* ? 팝업 */}
        {/* {priceInfoOpen &&
          <QuestionPopup isPopupOpen={priceInfoOpen} setIsPopupOpen={(priceInfo: boolean) => setPriceInfoOpen(priceInfo)}>
            <>
              <Image
                source={popupBackground2}
                style={{
                  position: "absolute",
                  top: h2p(-80),
                  left: 0,
                  width: Dimensions.get("window").width - d2p(20),
                  height: h2p(130),
                }} />
              <View style={{
                position: "absolute", top: h2p(-50), left: d2p(20),
                width: Dimensions.get("window").width - d2p(60),
                height: h2p(80)
              }}>
                <Text style={[FONT.Regular, { fontSize: 13, color: theme.color.white }]}>
                  예상가격은 해당 상품을 판매 중인 판매처에서 책정된 가격의 평균 가격입니다.
                </Text>
                <Text style={[FONT.Regular, {
                  fontSize: 13, color: theme.color.white,
                  marginTop: h2p(20)
                }]}>
                  판매처의 상황 및 이벤트 등에 의하여 변경될 수 있습니다.
                </Text>
              </View>
            </>
          </QuestionPopup>
        } */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: d2p(20), paddingRight: d2p(10) }}
          style={{
            marginTop: h2p(20),
            marginBottom: h2p(40)
          }}
          data={productDetailQuery.data?.reviews}
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
              {productDetailQuery.data && dateNormalFormat(productDetailQuery.data?.updated)} 기준
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
    backgroundColor: theme.color.white,
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