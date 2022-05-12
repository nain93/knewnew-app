import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { colorCheck } from "~/assets/icons";
import theme from "~/styles/theme";
import { BadgeType } from "~/types";
import { d2p } from "~/utils";

interface BadgeProp {
  text: string,
  type: "picker" | "feed" | "mypage" | "unabled",
  badge?: "interest" | "household" | "taste",
  isClick: boolean,
  idx: number,
  userBadge: BadgeType,
  setUserBadge: (badgeArr: Array<{ title: string, isClick: boolean }>) => void;
  viewStyle?: ViewStyle
}

const Badge = ({ text, type, badge, isClick, idx, userBadge, setUserBadge, viewStyle }: BadgeProp) => {

  switch (type) {
    case 'picker':
      return (
        <TouchableOpacity
          onPress={() => {
            if (badge) {
              setUserBadge(
                userBadge[badge].map((v, i) => {
                  if (i === idx) {
                    return { isClick: !v.isClick, title: v.title };
                  }
                  if (badge === "household") {
                    return { isClick: false, title: v.title };
                  }
                  else {
                    return v;
                  }
                })
              );
            }
          }} style={[styles.tag, !isClick ? styles.basic : styles.checked, viewStyle]}>
          {isClick && <Image source={colorCheck} resizeMode="contain" style={{ width: 10, height: 8, marginRight: 5 }} />}
          <Text style={[styles.text, !isClick ? styles.blackText : styles.colorText]}>{text}</Text>
        </TouchableOpacity>
      );
    case 'unabled':
      return (
        <View style={[styles.tag, styles.basic, styles.unabled, viewStyle]} >
          <Text style={styles.unabledText}>{text}</Text>
        </View>
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
  tag: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: d2p(10), marginRight: d2p(5),
    paddingVertical: d2p(5), paddingHorizontal: d2p(15),
  },
  basic: {
    borderColor: theme.color.grayscale.eae7ec,
  },
  checked: {
    borderColor: theme.color.main,
  },
  text: {
    fontWeight: '500'
  },
  blackText: {
    color: theme.color.black,
  },
  colorText: {
    color: theme.color.main
  },
  unabled: {
    borderColor: theme.color.grayscale.eae7ec,
    backgroundColor: theme.color.grayscale.f7f7fc,
  },
  unabledText: {
    color: theme.color.grayscale.d3d0d5
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