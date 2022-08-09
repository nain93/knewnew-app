import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import ReactionLayout from '~/components/layout/ReactionLayout';
import { marketList, reactList } from '~/utils/constant';
import { ReactionType, WriteReviewType } from '~/types/review';
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

interface BeforeWriteProp {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    stateReset: boolean
  }>;
}

const BeforeWrite = ({ navigation, route }: BeforeWriteProp) => {
  const marketRefRBSheet = useRef<RBSheet>(null);
  const [clickedReact, setClickReact] = useState<Array<{
    title: ReactionType,
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
      <View style={styles.container}>
        <Text style={[FONT.Regular, { fontSize: 16 }]}>오늘의 푸드로그는</Text>
        <Text style={[FONT.Bold, { fontSize: 20 }]}>한마디로,
          <Text style={[FONT.Regular, { color: theme.color.main, fontSize: 12 }]}> (필수)</Text>
        </Text>
        <View style={styles.reactionWrap}>
          <ReactionLayout
            multiSelect={false}
            clickedReact={clickedReact}
            setClickReact={(react: {
              title: ReactionType,
              isClick: boolean
            }[]) => setClickReact(react)}
          />
        </View>
        <Text style={[FONT.Bold, { fontSize: 20, marginBottom: h2p(10) }]}>푸드 태그는,
          <Text style={[FONT.Regular, { color: theme.color.main, fontSize: 12 }]}> (필수)</Text>
        </Text>
        <SelectLayout type="write" interestTag={interestTag} setInterestTag={setInterestTag} />
        <View style={{ marginTop: h2p(60), marginBottom: h2p(15) }}>
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
            paddingHorizontal: d2p(10), paddingVertical: h2p(13.5),
            marginBottom: "auto",
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
          disabled={interestTag.interest.every(v => !v.isClick) || clickedReact.every(v => !v.isClick)}
          text="다음으로" bgColor={theme.color.white} textColor={theme.color.main}
          onPress={() => navigation.navigate("Write", {
            review: {
              ...writeData,
              satisfaction: clickedReact.filter(v => v.isClick).map(v => v.title)[0],
              tags: {
                interest: interestTag.interest.filter(v => v.isClick).map(v => v.title)
              }
            },
            loading: false, isEdit: false
          })}
        />
      </View>
      <CustomBottomSheet
        sheetRef={marketRefRBSheet}
        height={Dimensions.get("window").height - h2p(380)}
      >
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
            showsVerticalScrollIndicator={false}>
            {React.Children.toArray(marketList.map((market) =>
              <TouchableOpacity
                onPress={() => {
                  setWriteData({ ...writeData, market });
                  marketRefRBSheet.current?.close();
                }}
                style={{
                  paddingVertical: h2p(12.5), paddingHorizontal: d2p(10),
                  borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc
                }}>
                <Text style={FONT.Medium}>{market}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      </CustomBottomSheet>
    </>
  );
};

export default BeforeWrite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(40)
  },
  reactionWrap: {
    marginTop: h2p(20),
    marginBottom: h2p(60),
    flexDirection: "row"
  },
});