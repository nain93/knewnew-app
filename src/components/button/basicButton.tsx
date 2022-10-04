import React from "react";
import { View, Text, StyleSheet, Dimensions, ViewStyle, TouchableOpacity, ActivityIndicator } from "react-native";
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
  disabled?: boolean;
  loading?: boolean
}

const BasicButton = ({ loading = false, disabled, text, bgColor, textColor, borderColor, viewStyle, onPress }: BasicButtonProp) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => {
        if (!loading) {
          onPress();
        }
      }}>
      <View style={[styles.container, viewStyle, { backgroundColor: disabled ? theme.color.grayscale.e9e7ec : bgColor },
      { borderColor: disabled ? theme.color.grayscale.e9e7ec : (borderColor ? borderColor : textColor) }]}>
        {loading ? <ActivityIndicator color={bgColor === "#ffffff" ? theme.color.main : "white"} />
          :
          <Text style={[styles.text, { color: disabled ? theme.color.white : textColor }, FONT.Bold]}>{text}</Text>
        }
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