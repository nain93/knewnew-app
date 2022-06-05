import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ViewStyle } from "react-native";
import { FONT } from "~/styles/fonts";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface BasicButtonProp {
  text: string;
  bgColor: string;
  textColor: string;
  viewStyle?: ViewStyle;
  onPress: () => void;
  borderColor?: string
}

const BasicButton = ({ text, bgColor, textColor, borderColor, viewStyle, onPress }: BasicButtonProp) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.container, viewStyle, { backgroundColor: bgColor }, { borderColor: borderColor ? borderColor : textColor }]}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: textColor }, FONT.Bold]}>{text}</Text>
        </View>
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
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: theme.color.white,
    fontSize: 14,
    fontWeight: 'bold',
  }
});