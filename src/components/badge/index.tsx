import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface BadgeProp {
  text: string,
  type: string,
  viewStyle?: ViewStyle
}

const Badge = ({ text, type, viewStyle }: BadgeProp) => {
  const BadgeComponent = (type: string) => {
    switch (type) {
      case 'picker':
        return <TouchableOpacity style={[styles.select, { ...viewStyle }]}>
          <Text>{text}</Text>
        </TouchableOpacity>;
      case 'feed':
        return <View style={styles.badge}>
          <Text style={styles.badgeText}>{text}</Text>
        </View>;
      case 'mypage':
        return null;
    }
  };

  return (<>
    {BadgeComponent(type)}
  </>
  );
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
    borderWidth: 1, borderColor: theme.color.main,
    borderRadius: 9,
    paddingVertical: d2p(1), paddingHorizontal: d2p(4),
    marginRight: 'auto'
  },
  badgeText: {
    fontSize: 10, color: theme.color.main
  }
});