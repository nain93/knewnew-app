import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { colorCheck } from "~/assets/icons";
import { FONT } from "~/styles/fonts";
import theme from "~/styles/theme";
import { BadgeType } from "~/types";
import { d2p, h2p } from "~/utils";

interface BadgeProp {
  onPress?: () => void,
  text: string,
  type: "picker" | "feed" | "mypage" | "unabled",
  layoutType?: "filter" | "wrtie" | "normal",
  badge?: "interest" | "household" | "taste",
  isClick?: boolean,
  idx?: number,
  userBadge?: BadgeType,
  setUserBadge?: (badgeArr: Array<{ title: string, isClick: boolean }>) => void;
  viewStyle?: ViewStyle
}

//! will soon deprecate
const Badge = ({
  onPress,
  layoutType = "normal",
  text, type, badge,
  isClick, idx, userBadge, setUserBadge, viewStyle }: BadgeProp) => {

  switch (type) {
    case 'picker':
      return (
        <TouchableOpacity
          onPress=
          {onPress ?
            onPress :
            () => {
              if (badge && userBadge && setUserBadge) {
                // * 필터 ui 태그 하나만 선택 할 수있슴
                if (layoutType === "filter") {
                  setUserBadge(
                    userBadge[badge].map((v, i) => {
                      if (i === idx) {
                        return { isClick: !v.isClick, title: v.title };
                      }
                      else {
                        return { isClick: false, title: v.title };
                      }
                    })
                  );
                }
                // * 관심사, 입맛 여러개 선택가능
                else {
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
              }
            }} style={[styles.tag, !isClick ? styles.basic : styles.checked, viewStyle]}>
          {isClick && <Image source={colorCheck} resizeMode="contain" style={{ width: d2p(10), height: d2p(8), marginRight: d2p(5) }} />}
          <Text style={[!isClick ? styles.blackText : styles.colorText, FONT.Medium]}>{text}</Text>
        </TouchableOpacity>
      );
    case 'unabled':
      return (
        <View style={[styles.tag, styles.basic, styles.unabled, viewStyle]} >
          <Text style={[styles.unabledText, FONT.Medium]}>{text}</Text>
        </View>
      );
    case 'feed':
      return (
        <View style={styles.badge}>
          <Text style={[styles.badgeText, FONT.Medium]}>{text}</Text>
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
    paddingVertical: d2p(5)
  },
  basic: {
    borderColor: theme.color.grayscale.eae7ec,
    paddingHorizontal: d2p(15),
  },
  checked: {
    borderColor: theme.color.main,
    paddingRight: d2p(15),
    paddingLeft: d2p(10)
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
    borderWidth: 1, borderColor: theme.color.grayscale.d2d0d5,
    borderRadius: 10,
    backgroundColor: theme.color.grayscale.f7f7fc,
    paddingVertical: h2p(3), paddingHorizontal: d2p(10),
    minWidth: d2p(55),
    height: h2p(20),
    justifyContent: "center",
    alignItems: "center"
  },
  badgeText: {
    fontSize: 10, color: theme.color.grayscale.C_443e49
  }
});