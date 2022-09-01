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
import { interestTagData } from '~/utils/data';
import { colorCart, grayCart, rightArrow } from '~/assets/icons';
import CustomBottomSheet from '~/components/popup/CustomBottomSheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import CloseIcon from '~/components/icon/closeIcon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
  const [writeData, setWriteData] = useState<WriteReviewType>({
    images: [],
    content: "",
    satisfaction: "",
    market: undefined,
    parent: undefined,
    tags: {
      interest: []
    }
  });
  const [interestTag, setInterestTag] = useState<InterestTagType>(interestTagData);
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
    }
  }, [route.params]);

  useEffect(() => {
    if (!interestTag.interest[interestTag.interest.length - 1].isClick) {
      setFoodTag("");
    }
  }, [interestTag]);

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon
          onBackClick={() => navigation.goBack()}
        />} title="글쓰기"
        headerRightPress={() => {
          // todo 임시저장
          // if (blockSubmit) {
          //   return;
          // }
          // else {
          //   handleAddWrite();
          // }
        }}
      // headerRight={<Text style={[{ color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>
      //   임시저장
      // </Text>}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}>
        <View style={{ marginHorizontal: d2p(20), marginTop: h2p(40) }}>
          <Text style={[FONT.Regular, { fontSize: 16 }]}>오늘의 푸드로그는</Text>
          <Text style={[FONT.Bold, { fontSize: 20 }]}>한마디로,
            <Text style={[FONT.Regular, { color: theme.color.main, fontSize: 12 }]}> (필수)</Text>
          </Text>
          <View style={styles.reactionWrap}>
            <ReactionLayout
              multiSelect={false}
              clickedReact={clickedReact}
              setClickReact={(react: {
                title: SatisfactionType,
                isClick: boolean
              }[]) => setClickReact(react)}
            />
          </View>
          <Text style={[FONT.Bold, { fontSize: 20, marginBottom: h2p(10) }]}>추천 대상은,
            <Text style={[FONT.Regular, { color: theme.color.main, fontSize: 12 }]}> (필수)</Text>
          </Text>
          <SelectLayout type="write" focusRef={foodTagRef} interestTag={interestTag} setInterestTag={setInterestTag} />
        </View>
        {interestTag.interest[interestTag.interest.length - 1].isClick &&
          <View style={{ marginTop: h2p(20), justifyContent: "center" }}>
            <TextInput
              ref={foodTagRef}
              autoCapitalize="none"
              value={foodTag}
              style={[FONT.Regular, {
                borderColor: theme.color.grayscale.eae7ec,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                paddingHorizontal: d2p(20),
                paddingVertical: h2p(15),
                color: theme.color.black,
                fontSize: 16
              }]}
              maxLength={16}
              onChangeText={(e) => {
                if (e.length > 15) {
                  setFoodTag(e.slice(0, e.length - 1));
                }
                else {
                  setFoodTag(e);
                }
              }}
              placeholderTextColor={theme.color.grayscale.a09ca4}
              placeholder="푸드태그를 입력해주세요"
            />
            <Text style={[FONT.Regular, {
              position: "absolute",
              right: d2p(20),
              color: foodTag.length === 15 ? theme.color.main : theme.color.grayscale.a09ca4,
            }]} >{foodTag.length}/15</Text>
          </View>
        }
        <View style={{ marginTop: h2p(60), marginBottom: h2p(15), marginHorizontal: d2p(20) }}>
          <Text style={[FONT.Bold, { fontSize: 20, marginBottom: h2p(5) }]}>구매한 곳은,
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => marketRefRBSheet.current?.open()}
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.color.grayscale.f7f7fc,
            borderBottomWidth: 1,
            borderBottomColor: theme.color.grayscale.f7f7fc,
            paddingHorizontal: d2p(30), paddingVertical: h2p(13.5),
            marginBottom: h2p(80),
            flexDirection: "row",
            alignItems: "center"
          }}>
          <Image source={writeData.market ? colorCart : grayCart} style={{ marginRight: d2p(10), width: d2p(14), height: d2p(14) }} />
          <Text style={[FONT.Regular, {
            fontSize: 16,
            color: writeData.market ? theme.color.black : theme.color.grayscale.a09ca4
          }]}>{writeData.market ? writeData.market : "구매처를 선택하세요"}</Text>
          <Image source={rightArrow} style={{ marginLeft: "auto", width: d2p(12), height: d2p(25) }} />
        </TouchableOpacity>
        <BasicButton
          viewStyle={{ marginHorizontal: d2p(20), marginBottom: h2p(40) }}
          disabled={interestTag.interest.every(v => !v.isClick) || clickedReact.every(v => !v.isClick)
            || (interestTag.interest[interestTag.interest.length - 1].isClick && foodTag === "")
          }
          text="다음으로" bgColor={theme.color.white} textColor={theme.color.main}
          onPress={() => navigation.navigate("Write", {
            review: {
              ...writeData,
              satisfaction: clickedReact.filter(v => v.isClick).map(v => v.title)[0],
              tags: {
                interest: foodTag ? interestTag.interest.filter(v => {
                  if (v.title.includes("기타")) {
                    return false;
                  }
                  return v.isClick;
                }).map(v => v.title).concat(foodTag)
                  :
                  interestTag.interest.filter(v => {
                    if (v.title.includes("기타")) {
                      return false;
                    }
                    return v.isClick;
                  }).map(v => v.title)
              }
            },
            loading: false, isEdit: false
          })}
        />
      </KeyboardAwareScrollView>
      <CustomBottomSheet
        sheetRef={marketRefRBSheet}
        height={Dimensions.get("window").height - h2p(340)}
        onClose={() => setEtcInputOpen(false)}>
        <>
          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            paddingHorizontal: d2p(10), paddingBottom: h2p(20)
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
                  setWriteData({ ...writeData, market });
                  marketRefRBSheet.current?.close();
                }}
                style={{
                  paddingVertical: h2p(12.5), paddingHorizontal: d2p(10),
                  borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc
                }}>
                <Text style={[(market === "기타 (직접 입력)" && etcInputOpen) ? FONT.Bold : FONT.Medium, {
                  color: (market === "기타 (직접 입력)" && etcInputOpen) ? theme.color.main : theme.color.black
                }]}>{market}</Text>
              </TouchableOpacity>
            ))}
            {etcInputOpen &&
              <>
                <View style={{ justifyContent: "center" }}>
                  <TextInput
                    maxLength={16}
                    value={etcMarket}
                    onChangeText={(e) => {
                      if (e.length > 15) {
                        setEtcMarket(e.slice(0, e.length - 1));
                      }
                      else {
                        setEtcMarket(e);
                      }
                    }}
                    ref={etcInputRef}
                    autoCapitalize="none"
                    style={[FONT.Regular, {
                      fontSize: 16,
                      paddingVertical: h2p(12.5), paddingHorizontal: d2p(10),
                      borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc,
                      color: theme.color.black
                    }]}
                    placeholder="구매하신 사이트명을 입력해주세요."
                    placeholderTextColor={theme.color.grayscale.a09ca4} />
                  <Text style={[FONT.Regular, {
                    position: "absolute",
                    right: d2p(20),
                    color: etcMarket.length === 15 ? theme.color.main : theme.color.grayscale.a09ca4,
                  }]} >{etcMarket.length}/15</Text>
                </View>
                <BasicButton
                  onPress={() => {
                    setWriteData({ ...writeData, market: etcMarket });
                    marketRefRBSheet.current?.close();
                  }}
                  viewStyle={{ marginVertical: h2p(20) }}
                  text="필터 저장하기" bgColor={theme.color.main} textColor={theme.color.white} />
              </>
            }
          </ScrollView>
        </>
      </CustomBottomSheet>
    </>
  );
};

export default BeforeWrite;

const styles = StyleSheet.create({
  reactionWrap: {
    marginTop: h2p(20),
    marginBottom: h2p(60),
    flexDirection: "row"
  },
});