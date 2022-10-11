import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import ReactionLayout from '~/components/layout/ReactionLayout';
import { hitslop, marketList, reactList } from '~/utils/constant';
import { SatisfactionType, WriteReviewType } from '~/types/review';
import { d2p, h2p, inputPriceFormat } from '~/utils';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import SelectLayout from '~/components/layout/SelectLayout';
import { InterestTagType } from '~/types';
import { categoryData, interestTagData } from '~/utils/data';
import { close, colorCart, foodImage, grayCart, grayDownIcon, grayLinkIcon, linkIcon, marketImage, priceImage, rightArrow } from '~/assets/icons';
import CustomBottomSheet from '~/components/popup/CustomBottomSheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import CloseIcon from '~/components/icon/closeIcon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CheckBoxButton from '~/components/button/checkBoxButton';
import CategoryLayout from '~/components/layout/CategoryLayout';
import { getBottomSpace } from 'react-native-iphone-x-helper';

interface BeforeWriteProp {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    stateReset: boolean
  }>;
}

const BeforeWrite = ({ navigation, route }: BeforeWriteProp) => {
  const marketRefRBSheet = useRef<RBSheet>(null);
  const buyLinkRefRBSheet = useRef<RBSheet>(null);

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
    tags: [],
    price: ""
  });
  const [toggleCheckBox, setToggleCheckBox] = useState<boolean>(false);
  const [urlCheckBox, setUrlCheckBox] = useState<boolean>(false);
  const [etcInputOpen, setEtcInputOpen] = useState(false);
  const [etcMarket, setEtcMarket] = useState("");
  const etcInputRef = useRef<TextInput>(null);
  const bottomScrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputFocus, setInputFocus] = useState(false);

  useEffect(() => {
    // * 구매링크 오픈
    buyLinkRefRBSheet.current?.open();

    if (route.params?.stateReset) {
      //* 최초 진입시 상태 초기화
      setWriteData({
        ...writeData,
        market: undefined,
        price: "",
        content: ""
      });
      setClickReact(reactList.map(v => {
        return { title: v, isClick: false };
      }));
      setCategory(categoryData.slice(1, categoryData.length));
    }
  }, [route.params]);

  useEffect(() => {
    if (etcMarket) {
      setWriteData({ ...writeData, market: "" });
    }
  }, [etcMarket]);

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon
          onBackClick={() => navigation.goBack()}
        />} title="푸드로그 작성하기"
      />
      <KeyboardAwareScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}>
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
        <Text style={[FONT.SemiBold, styles.title, { marginBottom: 0 }]}>
          상품 정보
        </Text>
        <View style={{ marginTop: h2p(5) }}>
          <View style={[styles.inputWrap, { paddingHorizontal: d2p(10) }]}>
            <Image source={foodImage} style={{ width: d2p(16), height: d2p(15) }} />
            <TextInput
              style={[FONT.Regular, styles.textInput]}
              placeholder="상품명을 입력해주세요." placeholderTextColor={theme.color.grayscale.C_9F9CA3} />
          </View>
          <TouchableOpacity
            onPress={() => marketRefRBSheet.current?.open()}
            style={[styles.inputWrap, { paddingHorizontal: d2p(11.5) }]}>
            <Image source={marketImage} style={{ width: d2p(13), height: d2p(12) }} />
            <Text style={[FONT.Regular, {
              marginVertical: h2p(12),
              marginLeft: d2p(10),
              fontSize: 16,
              color: writeData.market ? theme.color.black : theme.color.grayscale.C_9F9CA3
            }]}>
              {writeData.market ? writeData.market : "구매처를 선택해주세요."}
            </Text>
            <Image source={grayDownIcon} style={{ marginLeft: "auto", width: d2p(14), height: d2p(8) }} />
          </TouchableOpacity>
          <View style={[styles.inputWrap, { paddingHorizontal: d2p(12) }]}>
            <Image source={priceImage} style={{ width: d2p(12), height: d2p(10.5) }} />
            <TextInput
              value={writeData.price}
              onChangeText={(e) => {
                setWriteData({
                  ...writeData,
                  price: inputPriceFormat(e)
                });
              }}
              keyboardType="number-pad"
              style={[FONT.Regular, styles.textInput]}
              placeholder="구매하신 금액을 숫자만 입력해주세요." placeholderTextColor={theme.color.grayscale.C_9F9CA3} />
          </View>
          <View style={{ marginTop: h2p(10), flexDirection: "row", alignItems: "center", marginLeft: "auto" }}>
            <CheckBoxButton toggleCheckBox={toggleCheckBox}
              setToggleCheckBox={(check: boolean) => setToggleCheckBox(check)} />
            <Text style={[FONT.Regular, { marginLeft: d2p(10), color: theme.color.grayscale.C_9F9CA3 }]}>
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

        <ReactionLayout
          multiSelect={false}
          clickedReact={clickedReact}
          setClickReact={(react: {
            title: SatisfactionType,
            isClick: boolean
          }[]) => setClickReact(react)} />

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
            color: writeData.content.length === 500 ? theme.color.main : theme.color.grayscale.d2d0d5,
            marginLeft: d2p(10),
          }]}>({writeData.content.length}/500자)</Text>
        </View>
        <Pressable
          onPress={() => {
            setInputFocus(true);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }}
          style={{
            width: Dimensions.get("window").width - d2p(40),
            borderRadius: 5,
            height: h2p(200),
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec,
            paddingVertical: h2p(12),
            paddingHorizontal: d2p(10),
          }}>
          {inputFocus ?
            <TextInput
              ref={inputRef}
              value={writeData.content}
              onBlur={() => setInputFocus(false)}
              maxLength={501}
              onChangeText={(e) => {
                if (e.length > 500) {
                  setWriteData({ ...writeData, content: e.slice(0, e.length - 1) });
                }
                else {
                  setWriteData({ ...writeData, content: e });
                }
              }}
              multiline
              style={{
                height: h2p(200),
                paddingTop: 0,
                includeFontPadding: false
              }}
            />
            :
            <Text style={[FONT.Regular, {
              fontSize: 16, color: theme.color.grayscale.C_9F9CA3
            }]}>
              {`솔직한 후기를 남겨주세요.
              
1. 좋았던 점은 어떤게 있나요?\n2. 아쉬운 점이 있다면요?\n3. 추천 조합이나 먹팁이 있다면 같이 알려주세요!`}
            </Text>
          }
        </Pressable>

        <View style={{
          marginTop: h2p(30),
          marginBottom: h2p(20),
          flexDirection: "row", alignItems: "center"
        }}>
          <Text style={[FONT.SemiBold, { fontSize: 16 }]}>
            한 줄 로그
          </Text>
          <Text style={[FONT.Regular, {
            fontSize: 12,
            color: theme.color.grayscale.d2d0d5,
            marginLeft: d2p(10)
          }]}>선택</Text>
        </View>
        <TextInput
          style={[FONT.Regular, {
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec,
            paddingHorizontal: d2p(10),
            paddingVertical: h2p(12),
            width: Dimensions.get("window").width - d2p(40),
            marginBottom: h2p(60),
            fontSize: 16
          }]}
          placeholder="오늘의 푸드로그를 한 줄로 정리하자면?" placeholderTextColor={theme.color.grayscale.C_9F9CA3} />
        <View style={{ marginBottom: getBottomSpace() + h2p(60) }}>
          <BasicButton
            onPress={() => console.log("complete")}
            text="작성 완료" bgColor={theme.color.main} textColor={theme.color.white} />
        </View>
      </KeyboardAwareScrollView>

      {/* 구매처 선택 바텀시트 */}
      <CustomBottomSheet
        sheetRef={marketRefRBSheet}
        height={Dimensions.get("window").height - h2p(340)}
      >
        <>
          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            paddingHorizontal: d2p(10), paddingBottom: h2p(38)
          }}>
            <CloseIcon onPress={() => marketRefRBSheet.current?.close()}
              imageStyle={{ width: d2p(15), height: h2p(15) }} />
            <Text style={[{ fontSize: 16, marginRight: d2p(15) }, FONT.Bold]}>구매처 선택</Text>
            <View />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="always"
            ref={bottomScrollRef}
            showsVerticalScrollIndicator={false}>
            {React.Children.toArray(marketList.map((market) =>
              <TouchableOpacity
                onPress={() => {
                  if (market === "기타 (직접 입력)") {
                    setEtcInputOpen(true);
                    setTimeout(() => {
                      etcInputRef.current?.focus();
                      bottomScrollRef.current?.scrollToEnd();
                    }, 100);
                    return;
                  }
                  else {
                    setEtcMarket("");
                    setEtcInputOpen(false);
                  }
                  setWriteData({ ...writeData, market });
                  marketRefRBSheet.current?.close();
                }}
                style={{
                  paddingVertical: h2p(12),
                  borderBottomWidth: market === "기타 (직접 입력)" ? 0 : 1,
                  borderBottomColor: theme.color.grayscale.f7f7fc
                }}>

                <Text style={[FONT.Regular, {
                  fontSize: 16,
                  color: (market === writeData.market || etcMarket && market === "기타 (직접 입력)")
                    ? theme.color.main : theme.color.black
                }]}>{market}</Text>
              </TouchableOpacity>
            ))}
            {etcInputOpen &&
              <>
                <View style={{ justifyContent: "center" }}>
                  <View
                    style={[styles.inputWrap, { marginTop: 0, paddingHorizontal: d2p(11.5) }]}>
                    <Image source={marketImage} style={{ width: d2p(13), height: d2p(12) }} />
                    <TextInput
                      maxLength={16}
                      value={etcMarket}
                      ref={etcInputRef}
                      autoCapitalize="none"
                      onChangeText={(e) => {
                        if (e.length > 15) {
                          setEtcMarket(e.slice(0, e.length - 1));
                        }
                        else {
                          setEtcMarket(e);
                        }
                      }}
                      style={[FONT.Regular, styles.textInput]}
                      placeholder="구매처를 입력해주세요." placeholderTextColor={theme.color.grayscale.C_9F9CA3}
                    />
                    <Text style={[FONT.Regular, {
                      position: "absolute",
                      right: d2p(10),
                      color: etcMarket.length === 15 ? theme.color.main : theme.color.grayscale.a09ca4,
                    }]} >{etcMarket.length}/15</Text>
                  </View>
                </View>
                <BasicButton
                  onPress={() => {
                    setWriteData({ ...writeData, market: etcMarket });
                    marketRefRBSheet.current?.close();
                  }}
                  viewStyle={{ marginVertical: h2p(20) }}
                  text="선택 완료" bgColor={theme.color.main} textColor={theme.color.white} />
              </>
            }
          </ScrollView>
        </>
      </CustomBottomSheet>

      {/* 구매링크 바텀시트 */}
      <CustomBottomSheet
        sheetRef={buyLinkRefRBSheet}
        height={Dimensions.get("window").height - h2p(385) + getBottomSpace()}
      >
        <View style={{
          paddingVertical: h2p(5)
        }}>
          <Pressable hitSlop={hitslop} onPress={() => buyLinkRefRBSheet.current?.close()}>
            <Image source={close} style={{ width: d2p(14), height: d2p(14) }} />
          </Pressable>
          <Text style={[FONT.SemiBold, { fontSize: 24, marginTop: h2p(35), marginBottom: h2p(15) }]}>
            {`구매링크를 입력하시면\n뉴뉴가 상품 정보를 가져올게요!`}
          </Text>
          <Text style={FONT.Regular}>
            {`URL을 몰라도 작성할 수 있지만,\nURL 붙여넣기시 좀 더 편리하게 작성할 수 있어요🥰`}
          </Text>
          <View style={{
            width: Dimensions.get("window").width - d2p(40),
            borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
            paddingHorizontal: d2p(10),
            flexDirection: "row", alignItems: "center",
            borderRadius: 5,
            marginTop: h2p(40), marginBottom: h2p(10)
          }}>
            <Image source={grayLinkIcon}
              style={{ width: d2p(16), height: d2p(16), marginRight: d2p(10) }} />
            <TextInput
              style={[FONT.Regular, {
                width: Dimensions.get("window").width - d2p(92),
                paddingVertical: h2p(10), fontSize: 16, color: theme.color.black
              }]}
              placeholder="구매하신 상품의 URL을 붙여넣어주세요" placeholderTextColor={theme.color.grayscale.C_9F9CA3} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto", marginBottom: h2p(40) }}>
            <CheckBoxButton toggleCheckBox={urlCheckBox} setToggleCheckBox={setUrlCheckBox} />
            <Text style={[FONT.Regular, { marginLeft: d2p(8), fontSize: 12, color: theme.color.grayscale.C_9F9CA3 }]}>
              URL 없이 작성하기
            </Text>
          </View>

          <BasicButton
            onPress={() => {
              //todo url 작성
              buyLinkRefRBSheet.current?.close();
            }}
            text="작성하기"
            bgColor={theme.color.white} textColor={theme.color.main} />
        </View>
      </CustomBottomSheet>
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
  }
});