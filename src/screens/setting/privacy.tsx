import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationStackProp } from 'react-navigation-stack';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { leftArrow } from '~/assets/icons';
import { getBottomSpace } from 'react-native-iphone-x-helper';

interface PrivacyProps {
  navigation: NavigationStackProp
}

const Privacy = ({ navigation }: PrivacyProps) => {
  const [isOpen, setIsOpen] = useState([false, false, false, false]);

  const handleIsOpen = (selectIdx: number) => {
    setIsOpen(isOpen.map((v, i) => {
      if (i === selectIdx) {
        return !v;
      }
      return v;
    }));
  };

  return (
    <>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()}
          imageStyle={{ width: d2p(11), height: d2p(25) }} />}
        title="개인정보 처리방침"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        <Text style={[FONT.Bold, { fontSize: 16 }]}>개인정보 수집 및 이용동의</Text>
        <Text style={[FONT.Bold, { marginTop: h2p(40), marginBottom: h2p(10) }]}>
          수집하는 개인정보 항목 /수집 및 이용목적/보유 및 이용기간</Text>
        <TouchableOpacity
          onPress={() => handleIsOpen(0)}
          style={[styles.picker,
          { backgroundColor: isOpen[0] ? theme.color.grayscale.f7f7fc : theme.color.white }]}
        >
          <View
            style={styles.pickerBtn}>
            <Text style={isOpen[0] ? FONT.Bold : FONT.Regular}>필수 정보</Text>
            <Image source={leftArrow} style={{
              width: d2p(11), height: d2p(25), transform: [{ rotate: '270deg' }]
            }} />
          </View>
          {isOpen[0] &&
            <View style={{
              paddingTop: h2p(20),
              borderTopWidth: 1, borderColor: theme.color.grayscale.e9e7ec
            }}>
              <View style={[styles.selectWrap, { marginTop: 0 }]}>
                <Text style={[styles.selectTitle, FONT.Bold]}>수집항목</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  닉네임, 이메일 주소 또는 핸드폰번호</Text>
              </View>
              <View style={styles.selectWrap}>
                <Text style={[styles.selectTitle, FONT.Bold]}>수집 및
                  이용목적</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  회원제 서비스의 제공을 위한 이용자 식별, 서비스 이용 및 상담, 고객문의 회신, 마케팅 서비스 개선을 위한 분석, 회원의 서비스 이용에 대한 통계 등</Text>
              </View>
              <View style={[styles.selectWrap, { marginBottom: h2p(20) }]}>
                <Text style={[styles.selectTitle, FONT.Bold]}>보유 및 이용기간</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  회원탈퇴 및 목적 달성 후 지체없이 삭제합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령의 규정에 따라 거래 관계 확인을 위해 개인정보를 일정기간 보유할 수 있습니다.</Text>
              </View>
            </View>
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleIsOpen(1)}
          style={[styles.picker,
          { backgroundColor: isOpen[1] ? theme.color.grayscale.f7f7fc : theme.color.white }]}
        >
          <View
            style={styles.pickerBtn}>
            <Text style={isOpen[1] ? FONT.Bold : FONT.Regular}>자동 수집 항목</Text>
            <Image source={leftArrow} style={{
              width: d2p(11), height: d2p(25), transform: [{ rotate: '270deg' }]
            }} />
          </View>
          {isOpen[1] &&
            <View style={{
              paddingTop: h2p(20),
              borderTopWidth: 1, borderColor: theme.color.grayscale.e9e7ec
            }}>
              <View style={[styles.selectWrap, { marginTop: 0 }]}>
                <Text style={[styles.selectTitle, FONT.Bold]}>수집항목</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  서비스 방문 및 이용기록 분석</Text>
              </View>
              <View style={styles.selectWrap}>
                <Text style={[styles.selectTitle, FONT.Bold]}>수집 및 이용목적</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  서비스 이용기록, 앱/웹 로그인 기록, 접속 로그, 접속IP정보, 뉴뉴 어플리케이션 정보, 쿠키, ADID/IDFA</Text>
              </View>
              <View style={[styles.selectWrap, { marginBottom: h2p(20) }]}>
                <Text style={[styles.selectTitle, FONT.Bold]}>보유 및 이용기간</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  회원 탈퇴 시 지체없이 삭제, IP의 경우 3개월 보관</Text>
              </View>
            </View>
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleIsOpen(2)}
          style={[styles.picker,
          { backgroundColor: isOpen[2] ? theme.color.grayscale.f7f7fc : theme.color.white }]}
        >
          <View
            style={styles.pickerBtn}>
            <Text style={isOpen[2] ? FONT.Bold : FONT.Regular}>선택 정보</Text>
            <Image source={leftArrow} style={{
              width: d2p(11), height: d2p(25), transform: [{ rotate: '270deg' }]
            }} />
          </View>
          {isOpen[2] &&
            <View style={{
              paddingTop: h2p(20),
              borderTopWidth: 1, borderColor: theme.color.grayscale.e9e7ec
            }}>
              <View style={[styles.selectWrap, { marginTop: 0 }]}>
                <Text style={[styles.selectTitle, FONT.Bold]}>수집항목</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  마케팅(할인 쿠폰 제공, 서비스 이용에 따른 통계 분석 및 맞춤형 상품 추천)</Text>
              </View>
              <View style={styles.selectWrap}>
                <Text style={[styles.selectTitle, FONT.Bold]}>수집 및 이용목적</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  이메일주소, 닉네임, ADID/IDFA</Text>
              </View>
              <View style={[styles.selectWrap, { marginBottom: h2p(20) }]}>
                <Text style={[styles.selectTitle, FONT.Bold]}>보유 및 이용기간</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  정보 삭제 또는 이용정지 요청 및 회원탈퇴 시 지체없이 삭제</Text>
              </View>
            </View>
          }
        </TouchableOpacity>
        <Text style={[FONT.Bold, { marginTop: h2p(35) }]}>관계 법령에 의하여 수집 이용되는 정보</Text>
        <TouchableOpacity
          onPress={() => handleIsOpen(3)}
          style={[styles.picker,
          {
            marginTop: h2p(15),
            backgroundColor: isOpen[3] ? theme.color.grayscale.f7f7fc : theme.color.white
          }]}
        >
          <View
            style={styles.pickerBtn}>
            <Text style={isOpen[3] ? FONT.Bold : FONT.Regular}>통신자료 관련</Text>
            <Image source={leftArrow} style={{
              width: d2p(11), height: d2p(25), transform: [{ rotate: '270deg' }]
            }} />
          </View>
          {isOpen[3] &&
            <View style={{
              paddingTop: h2p(20),
              borderTopWidth: 1, borderColor: theme.color.grayscale.e9e7ec
            }}>
              <View style={[styles.selectWrap, { marginTop: 0 }]}>
                <Text style={[styles.selectTitle, { width: d2p(44) }, FONT.Bold]}>보존 항목</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  로그 기록, 접속 기록</Text>
              </View>
              <View style={styles.selectWrap}>
                <Text style={[styles.selectTitle, { width: d2p(44) }, FONT.Bold]}>관계 법령</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  통신비밀보호법</Text>
              </View>
              <View style={[styles.selectWrap, { marginBottom: h2p(20) }]}>
                <Text style={[styles.selectTitle, { width: d2p(44) }, FONT.Bold]}>보존 기간</Text>
                <Text style={[styles.selectText, FONT.Regular]}>
                  3개월</Text>
              </View>
            </View>
          }
        </TouchableOpacity>
        <Text style={[FONT.Bold, { marginTop: h2p(35) }]}>동의를 거부할 권리 및 거부 경우의 불이익</Text>
        <Text style={[FONT.Regular, { marginTop: h2p(20), marginBottom: h2p(30) }]}>
          귀하께서는 밀링이 위와 같이 수집하는 개인정보에 대해 동의하지 않거나 개인정보를 기재하지 않음으로써 거부할 수 있습니다. 다만, 이때 회원에게 제공되는 서비스가 제한될 수 있습니다.
        </Text>
        <Text style={FONT.Bold}>부칙</Text>
        <Text style={FONT.Regular}>이 약관은 2022년 6월 1일부터 적용됩니다.</Text>
        <View style={{ marginBottom: getBottomSpace() + h2p(30) }} />
      </ScrollView>
    </>
  );
};

export default Privacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: d2p(20)
  },
  picker: {
    minHeight: h2p(40),
    width: Dimensions.get("window").width - d2p(40),
    borderWidth: 1,
    borderRadius: 5, borderColor: theme.color.grayscale.e9e7ec,
    paddingHorizontal: d2p(15),
    marginBottom: h2p(5)
  },
  pickerBtn: {
    width: Dimensions.get("window").width - d2p(70),
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: h2p(11)
  },
  selectWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: h2p(7.5)
  },
  selectTitle: {
    fontSize: 12,
    color: theme.color.grayscale.C_79737e,
    width: d2p(41)
  },
  selectText: {
    width: Dimensions.get("window").width - d2p(123),
    marginLeft: d2p(21),
    fontSize: 12
  }
});