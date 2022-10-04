import React, { useEffect, useState } from "react";
import { Dimensions, Image, ImageSourcePropType, Pressable, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { bmartBtnImg, cupangBtnImg, kurlyBtnImg, naverBtnImg, otherBtnImg, SSGBtnImg, unClickBtnImg } from "~/assets/images/marketBtn";
import { FONT } from "~/styles/fonts";
import theme from "~/styles/theme";
import { d2p, h2p } from "~/utils";

interface SelectMarketButtonPropType {
  market: "마켓컬리" | "쿠팡" | "B마트" | "SSG" | "네이버쇼핑" | "기타",
  isClick: boolean,
  viewStyle?: ViewStyle,
  onPress: () => void
}


const SelectMarketButton = ({ market, isClick, viewStyle, onPress }: SelectMarketButtonPropType) => {
  const [marketImg, setMarketImg] = useState<ImageSourcePropType>();

  useEffect(() => {
    switch (market) {
      case "마켓컬리": {
        setMarketImg(kurlyBtnImg);
        return;
      }
      case "쿠팡": {
        setMarketImg(cupangBtnImg);
        return;
      }
      case "B마트": {
        setMarketImg(bmartBtnImg);
        return;
      }
      case "SSG": {
        setMarketImg(SSGBtnImg);
        return;
      }
      case "네이버쇼핑": {
        setMarketImg(naverBtnImg);
        return;
      }
      default: {
        setMarketImg(otherBtnImg);
        return;
      }
    }
  }, [market]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, viewStyle]}>
      <Text style={[FONT.SemiBold, {
        position: "absolute",
        color: isClick ? theme.color.white : theme.color.black,
        zIndex: 1
      }]}>{market}
      </Text>
      {(isClick && marketImg) ?
        <Image source={marketImg} style={styles.marketImg} />
        :
        <Image source={unClickBtnImg} style={styles.marketImg} />
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (Dimensions.get("window").width - d2p(60)) / 5,
    height: (Dimensions.get("window").width - d2p(60)) / 5,
    borderRadius: 63,
    justifyContent: "center",
    alignItems: "center"
  },
  marketImg: {
    width: (Dimensions.get("window").width - d2p(60)) / 5,
    height: (Dimensions.get("window").width - d2p(60)) / 5,
    borderRadius: 63,
  }
});

export default SelectMarketButton;
