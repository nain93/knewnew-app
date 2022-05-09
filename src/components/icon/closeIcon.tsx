import React from "react";
import { TouchableOpacity, Image, ImageStyle } from "react-native";
import { close } from "~/assets/icons";
import { d2p } from "~/utils";

interface CloseIcon {
  imageStyle?: ImageStyle
  onPress: () => void;
}

const CloseIcon = ({ imageStyle, onPress }: CloseIcon) => {
  return (
    <TouchableOpacity onPress={onPress}
      hitSlop={{ top: d2p(20), left: d2p(20), right: d2p(20), bottom: d2p(20) }}>
      <Image
        source={close}
        resizeMode="contain"
        style={{ width: 24, height: 24, ...imageStyle }}
      />
    </TouchableOpacity>
  );
};

export default CloseIcon;