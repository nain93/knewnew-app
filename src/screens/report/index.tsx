import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import React, { useRef, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p } from '~/utils';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useMutation } from 'react-query';
import { addReport } from '~/api/report';
import { popupState, tokenState } from '~/recoil/atoms';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ReviewListType } from '~/types/review';

interface ReportProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    review: ReviewListType,
  }>
}

const Report = ({ navigation, route }: ReportProps) => {
  const inputRef = useRef<TextInput>(null);
  const token = useRecoilValue(tokenState);
  const setIspopupOpen = useSetRecoilState(popupState);
  const [report, setReport] = useState("");

  const addReportMutation = useMutation("addReport", ({ content, reviewId }: { content: string, reviewId: number }) =>
    addReport({ token, objectType: "review", qnaType: "report", content, review: reviewId })
    , {
      onSuccess: () => {
        setReport("");
        setIspopupOpen({ isOpen: true, content: "신고 되었습니다" });
        navigation.goBack();
      }
    }
  );

  const handleAddReport = () => {
    if (!report) {
      setIspopupOpen({ isOpen: true, content: "내용을 입력해주세요" });
      return;
    }
    if (route.params?.review.id) {
      addReportMutation.mutate({ content: report, reviewId: route.params?.review.id });
    }
  };

  return (
    <>
      <Header title="리뷰 신고"
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()}
          imageStyle={{ width: d2p(11), height: d2p(25) }} />}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={{ flex: 1 }}
      >
        <View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[FONT.Bold, { lineHeight: 20, color: theme.color.grayscale.C_443e49 }]}>‘{route.params?.review.author.nickname}’</Text>
            <Text style={[FONT.Regular, { lineHeight: 20, color: theme.color.grayscale.C_443e49 }]}>님의 리뷰를</Text>
          </View>
          <Text style={[FONT.Regular, { lineHeight: 20, color: theme.color.grayscale.C_443e49 }]}>신고하는 이유를 입력해주세요.</Text>
        </View>
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{ height: h2p(436) }}>
          <TextInput
            value={report}
            ref={inputRef}
            autoCapitalize="none"
            maxLength={501}
            onChangeText={(e) => {
              if (e.length > 500) {
                setReport(e.slice(0, e.length - 1));
              }
              else {
                setReport(e);
              }
            }}
            placeholder="신고 사유를 입력해주세요."
            placeholderTextColor={theme.color.grayscale.a09ca4}
            multiline
            textAlignVertical="top"
            style={[FONT.Regular, {
              maxHeight: h2p(436),
              padding: 0,
              paddingTop: 0,
              fontSize: 16, marginTop: h2p(20),
              color: theme.color.black
            }]}
          />
          <Text style={[FONT.Regular, {
            position: "absolute", right: 0, bottom: d2p(30),
            color: report.length === 500 ? theme.color.main : theme.color.grayscale.a09ca4
          }]}>{report.length}/500</Text>
        </Pressable>
        <View style={{ marginTop: "auto", marginBottom: isIphoneX() ? getBottomSpace() : h2p(20) }}>
          <BasicButton bgColor={report ? theme.color.white : theme.color.grayscale.f7f7fc}
            textColor={report ? theme.color.main : theme.color.grayscale.d3d0d5}
            borderColor={report ? theme.color.main : theme.color.grayscale.e9e7ec}
            text="보내기" onPress={handleAddReport} />
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(20),
  }
});