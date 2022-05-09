import React from "react";
import { useNavigation } from "@react-navigation/native";
import { leftArrow } from "~/assets/icons";
import { TouchableOpacity, Image, ImageStyle } from "react-native";
import { d2p } from "~/utils";

interface LeftArrowIconProps {
  onBackClick?: () => void;
  imageStyle?: ImageStyle
}

const LeftArrowIcon = ({ onBackClick, imageStyle }: LeftArrowIconProps) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={onBackClick ? onBackClick : () => navigation.goBack()}
      hitSlop={{ top: d2p(20), left: d2p(20), right: d2p(20), bottom: d2p(20) }}>
      <Image
        source={leftArrow}
        resizeMode="contain"
        style={{ height: 24.5, width: 24, ...imageStyle }}
      />
    </TouchableOpacity>
  );
};

export default LeftArrowIcon;