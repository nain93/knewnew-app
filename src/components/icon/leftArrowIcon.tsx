import React from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Image } from "react-native";
import leftArrow from "../../assets/icons/leftArrow.png";

const LeftArrowIcon = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Image
        source={leftArrow}
        resizeMode="contain"
        style={{ width: 24, height: 24.5, marginLeft: 20 }}
      />
    </TouchableOpacity>
  );
};

export default LeftArrowIcon;