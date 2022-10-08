import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import ReactionLayout from '~/components/layout/ReactionLayout';
import { marketList, reactList } from '~/utils/constant';
import { SatisfactionType, WriteReviewType } from '~/types/review';
import { d2p, h2p } from '~/utils';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import SelectLayout from '~/components/layout/SelectLayout';
import { InterestTagType } from '~/types';
import { categoryData, interestTagData } from '~/utils/data';
import { colorCart, foodImage, grayCart, marketImage, priceImage, rightArrow } from '~/assets/icons';
import CustomBottomSheet from '~/components/popup/CustomBottomSheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import CloseIcon from '~/components/icon/closeIcon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CheckBoxButton from '~/components/button/checkBoxButton';
import CategoryLayout from '~/components/layout/CategoryLayout';

interface BeforeWriteProp {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    stateReset: boolean
  }>;
}

const BeforeWrite = ({ navigation, route }: BeforeWriteProp) => {
  const marketRefRBSheet = useRef<RBSheet>(null);
  const [foodTag, setFoodTag] = useState("");
  const [clickedReact, setClickReact] = useState<Array<{
    title: SatisfactionType,
    isClick: boolean
  }>>(reactList.map(v => {
    return { title: v, isClick: false };
  }));
  const [category, setCategory] = useState<{
    title: string,
    isClick: boolean,
  }[]>(categoryData.slice(1, categoryData.length));
  const [writeData, setWriteData] = useState<WriteReviewType>({
    images: [],
    content: "",
    satisfaction: "",
    market: undefined,
    parent: undefined,
    tags: []
  });
  const [interestTag, setInterestTag] = useState<InterestTagType[]>(interestTagData);
  const [toggleCheckBox, setToggleCheckBox] = useState<boolean>(false);
  const [etcInputOpen, setEtcInputOpen] = useState(false);
  const [etcMarket, setEtcMarket] = useState("");
  const etcInputRef = useRef<TextInput>(null);
  const bottomScrollRef = useRef<ScrollView>(null);
  const foodTagRef = useRef<TextInput>(null);

  useEffect(() => {
    if (route.params?.stateReset) {
      //* 최초 진입시 상태 초기화
      setWriteData({
        ...writeData,
        market: undefined
      });
      setInterestTag(interestTagData);
      setClickReact(reactList.map(v => {
        return { title: v, isClick: false };
      }));
      setCategory(categoryData.slice(1, categoryData.length));
    }
  }, [route.params]);

  useEffect(() => {
    if (!interestTag[interestTag.length - 1].isClick) {
      setFoodTag("");
    }
  }, [interestTag]);

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon
          onBackClick={() => navigation.goBack()}
        />} title="푸드로그 작성하기"
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={{ flexDirection: "row" }}>
            {React.Children.toArray(["", "", "", "", ""].map(v => (
              <View style={{
                width: (Dimensions.get("window").width - d2p(60)) / 5,
                aspectRatio: 1,
                marginRight: d2p(5),
                borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec
              }} />
            )))}
          </View>
          <Text style={[FONT.SemiBold, styles.title]}>
            상품 정보
          </Text>
          <View style={{ marginTop: h2p(5) }}>
            <View style={[styles.inputWrap, { paddingHorizontal: d2p(10) }]}>
              <Image source={foodImage} style={{ width: d2p(16), height: d2p(15) }} />
              <TextInput
                style={[FONT.Regular, styles.textInput]}
                placeholder="상품명을 입력해주세요." placeholderTextColor={theme.color.grayscale.C_9F9CA3} />
            </View>
            <View style={[styles.inputWrap, { paddingHorizontal: d2p(11.5) }]}>
              <Image source={marketImage} style={{ width: d2p(13), height: d2p(12) }} />
              <TextInput
                style={[FONT.Regular, styles.textInput]}
                placeholder="구매처를 선택해주세요." placeholderTextColor={theme.color.grayscale.C_9F9CA3} />
            </View>
            <View style={[styles.inputWrap, { paddingHorizontal: d2p(12) }]}>
              <Image source={priceImage} style={{ width: d2p(12), height: d2p(10.5) }} />
              <TextInput
                keyboardType="number-pad"
                style={[FONT.Regular, styles.textInput]}
                placeholder="구매하신 금액을 숫자만 입력해주세요." placeholderTextColor={theme.color.grayscale.C_9F9CA3} />
            </View>
            <View style={{ marginTop: h2p(10), flexDirection: "row", marginLeft: "auto" }}>
              <CheckBoxButton toggleCheckBox={toggleCheckBox}
                setToggleCheckBox={(check: boolean) => setToggleCheckBox(check)} />
              <Text style={[FONT.Regular, { marginLeft: d2p(5), color: theme.color.grayscale.C_9F9CA3 }]}>
                할인가에 샀어요.
              </Text>
            </View>
          </View>
          <Text style={[FONT.SemiBold, styles.title]}>
            카테고리
          </Text>
          <CategoryLayout
            category={category}
            setCategory={(cate) => setCategory(cate)} />
          <Text style={[FONT.SemiBold, styles.title]}>
            종합 평가
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View style={{
              position: "absolute",
              top: "50%",
              borderTopWidth: 1,
              width: Dimensions.get("window").width - d2p(40)
            }} />
            <View style={styles.reaction} />
            <View style={styles.reaction} />
            <View style={styles.reaction} />
            <View style={styles.reaction} />
          </View>
          <View style={[styles.title, {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: h2p(15)
          }]}>
            <Text style={[FONT.SemiBold, { fontSize: 16 }]}>
              푸드로그
            </Text>
            <Text style={[FONT.Regular, {
              fontSize: 12,
              color: theme.color.grayscale.d2d0d5,
              marginLeft: d2p(10)
            }]}>(0/500자)</Text>
          </View>
          <View style={{
            width: Dimensions.get("window").width - d2p(20),
            height: h2p(200),
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec,
            paddingVertical: h2p(12),
            paddingHorizontal: d2p(10)
          }}>
            <TextInput
              style={{

              }}
              placeholder={
                `솔직한 후기를 남겨주세요.1. 좋았던 점은 어떤게 있나요?2. 아쉬운 점이 있다면요?3. 추천 조합이나 먹팁이 있다면 같이 알려주세요!`
              } />
          </View>
        </View>
      </KeyboardAwareScrollView>

    </>
  );
};

export default BeforeWrite;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(20)
  },
  title: {
    marginTop: h2p(40),
    fontSize: 16,
    marginBottom: h2p(20)
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.color.grayscale.e9e7ec,
    borderRadius: 5,
    marginTop: h2p(15)
  },
  textInput: {
    color: theme.color.black,
    fontSize: 16,
    marginLeft: d2p(10),
    width: Dimensions.get("window").width - d2p(86),
    paddingVertical: h2p(12)
  },
  reaction: {
    width: (Dimensions.get("window").width - d2p(139)) / 4,
    aspectRatio: 1,
    borderRadius: (Dimensions.get("window").width - d2p(139)) / 4,
    borderWidth: 1, borderColor: theme.color.black,
    marginRight: d2p(33),
    backgroundColor: "white"
  }
});