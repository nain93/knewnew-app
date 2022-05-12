import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import theme from "~/styles/theme";
import { d2p, h2p } from "~/utils";

interface BadgeProp {
  text: string,
  type: "picker" | "feed" | "mypage",
  viewStyle?: ViewStyle
}

const Badge = ({ text, type, viewStyle }: BadgeProp) => {
  switch (type) {
    case 'picker':
      return (
        <TouchableOpacity style={[styles.select, viewStyle]}>
          <Text>{text}</Text>
        </TouchableOpacity>
      );
    case 'feed':
      return (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{text}</Text>
        </View>
      );
    case 'mypage':
      return <View />;
    default:
      return <View />;
  }
};

export default Badge;

const styles = StyleSheet.create({
  select: {
    borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 16,
    marginTop: d2p(8), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
  badge: {
    borderWidth: 1, borderColor: theme.color.grayscale.d2d0d5,
    borderRadius: 10,
    backgroundColor: theme.color.grayscale.f7f7fc,
    paddingVertical: h2p(3), paddingHorizontal: d2p(10),
    marginRight: 'auto'
  },
  badgeText: {
    fontSize: 10, color: theme.color.grayscale.C_443e49
  }
});