import { Dimensions, StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';

interface AlertPopupProps {
  popupStyle?: ViewStyle,
  text: string
}

const AlertPopup = ({ popupStyle, text }: AlertPopupProps) => {
  return (
    <View style={[styles.container, popupStyle]}>
      <Text style={[styles.text, FONT.Regular]}>{text}</Text>
    </View>
  );
};

export default AlertPopup;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    // backgroundColor: "rgba(0,0,0,0.7)",
    backgroundColor: theme.color.black,
    bottom: h2p(100),
    width: Dimensions.get("window").width - d2p(40),
    alignSelf: "center",
    zIndex: 10,
  },
  text: {
    fontSize: 12,
    paddingHorizontal: d2p(40),
    paddingVertical: h2p(10),
    color: theme.color.white,
  }
});
