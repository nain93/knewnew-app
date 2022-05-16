import React from "react";
import { TouchableOpacity, Image, ViewStyle } from "react-native";
import { more } from "~/assets/icons";

interface MoreIconProp {
  viewStyle?: ViewStyle;
  onPress: () => void;
}


const MoreIcon = ({ viewStyle, onPress }: MoreIconProp) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={more}
        resizeMode="contain"
        style={{ width: 26, height: 16, ...viewStyle }}
      />
    </TouchableOpacity>
  );
};

export default MoreIcon;