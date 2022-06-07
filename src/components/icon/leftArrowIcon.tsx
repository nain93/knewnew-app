import React from "react";
import { useNavigation } from "@react-navigation/native";
import { leftArrow } from "~/assets/icons";
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
        source={leftArrow}
        resizeMode="contain"
        style={[{ height: 24.5, width: 24 }, imageStyle]}
      />
    </TouchableOpacity>
  );
};

export default LeftArrowIcon;