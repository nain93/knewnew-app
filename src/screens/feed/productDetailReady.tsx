import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { knewnewchar } from '~/assets/images';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import { NavigationRoute } from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import { settingKnewnew } from '~/assets/icons';

interface ProductDetailReadyProps {
  navigation: NavigationStackProp;
}

const ProductDetailReady = ({ navigation }: ProductDetailReadyProps) => {
  return (
    <>
      <Header headerLeft={<LeftArrowIcon />} title="상품 상세" />
      <View style={styles.container}>
        <Image source={knewnewchar} style={{ width: d2p(120), height: d2p(120), marginBottom: h2p(24.5), marginTop: "auto" }} />
        <Text style={[FONT.Bold, {
          color: theme.color.grayscale.C_443e49,
          lineHeight: 23,
          textAlign: "center", fontSize: 16
        }]}>
          {`상품 상세 페이지를 준비 하고 있습니다.\n금방 찾아올게요!`}
        </Text>
        <BasicButton
          viewStyle={{ marginTop: h2p(60) }}
          bgColor={theme.color.white}
          text="이전 화면으로" textColor={theme.color.main}
          onPress={() => navigation.goBack()}
        />
        <Image source={settingKnewnew}
          style={{ width: d2p(96), height: d2p(20), marginTop: "auto", marginBottom: h2p(40) }} />
      </View>
    </>
  );
};

export default ProductDetailReady;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.color.grayscale.f7f7fc
  }
});