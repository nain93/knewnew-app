import React from "react";
import { useNavigation } from "@react-navigation/native";
import { blackLeftArrow, leftArrow } from "~/assets/icons";
import { TouchableOpacity, Image, ImageStyle, ViewStyle } from "react-native";
import { d2p } from "~/utils";
import { hitslop } from "~/utils/constant";

interface LeftArrowIconProps {
  onBackClick?: () => void;
  imageStyle?: ImageStyle;
  viewStyle?: ViewStyle
}

const LeftArrowIcon = ({ onBackClick, imageStyle, viewStyle }: LeftArrowIconProps) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={viewStyle} onPress={onBackClick ? onBackClick : () => navigation.goBack()}
      hitSlop={hitslop}>
      <Image
        source={blackLeftArrow}
        resizeMode="contain"
        style={[{ height: d2p(16), width: d2p(8) }, imageStyle]}
      />
    </TouchableOpacity>
  );
};

export default LeftArrowIcon;