import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ViewStyle, Pressable } from "react-native";
import { FONT } from "~/styles/fonts";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface BasicButtonProp {
  text: string;
  bgColor: string;
  textColor: string;
  viewStyle?: ViewStyle;
  onPress: () => void;
  borderColor?: string;
  disabled?: boolean
}

const BasicButton = ({ disabled, text, bgColor, textColor, borderColor, viewStyle, onPress }: BasicButtonProp) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}>
      <View style={[styles.container, viewStyle, { backgroundColor: disabled ? theme.color.grayscale.f7f7fc : bgColor },
      { borderColor: disabled ? theme.color.grayscale.e9e7ec : (borderColor ? borderColor : textColor) }]}>
        <Text style={[styles.text, { color: disabled ? theme.color.grayscale.d3d0d5 : textColor }, FONT.Bold]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default BasicButton;

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width - d2p(40),
    borderRadius: 5,
    height: d2p(45),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: theme.color.white
  }
});