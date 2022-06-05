import { StyleSheet, Text, View, TextInput } from 'react-native';
import React, { useState } from 'react';
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
import { tokenState } from '~/recoil/atoms';
import { useRecoilValue } from 'recoil';

interface ReportProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    id: number
  }>
}

const Report = ({ navigation, route }: ReportProps) => {
  const token = useRecoilValue(tokenState);
  const [report, setReport] = useState("");

  const addReportMutation = useMutation("addReport", ({ content, objectId }: { content: string, objectId: number }) =>
    addReport({ token, objectType: "review", qnaType: "report", content, objectId })
    , {
      onSuccess: () => {
        navigation.goBack();
      }
    }
  );

  return (
    <>
      <Header title="리뷰 신고"
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()}
          imageStyle={{ width: d2p(11), height: d2p(25) }} />}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flex: 1 }}
        style={styles.container}>
        <View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[FONT.Bold, { lineHeight: 20, color: theme.color.grayscale.C_443e49 }]}>‘열려라 참깨’</Text>
            <Text style={[FONT.Regular, { lineHeight: 20, color: theme.color.grayscale.C_443e49 }]}>님의 리뷰를</Text>
          </View>
          <Text style={[FONT.Regular, { lineHeight: 20, color: theme.color.grayscale.C_443e49 }]}>신고하는 이유를 입력해주세요.</Text>
        </View>
        <TextInput
          value={report}
          onChangeText={(e) => setReport(e)}
          placeholder="신고 사유를 입력해주세요."
          placeholderTextColor={theme.color.grayscale.a09ca4}
          multiline
          maxLength={501}
          textAlignVertical="top"
          style={[FONT.Regular, {
            height: h2p(436),
            padding: 0,
            paddingTop: 0,
            fontSize: 16, marginTop: h2p(20)
          }]}
        />
        <View style={{ marginTop: "auto", marginBottom: isIphoneX() ? getBottomSpace() : h2p(20) }}>
          <BasicButton bgColor={theme.color.grayscale.f7f7fc}
            textColor={theme.color.grayscale.d3d0d5}
            borderColor={theme.color.grayscale.e9e7ec}
            text="보내기" onPress={() => {
              if (route.params?.id) {
                addReportMutation.mutate({ content: report, objectId: route.params?.id });
              }
            }} />
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
    paddingVertical: h2p(20)
  }
});