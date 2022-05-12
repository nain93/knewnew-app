import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { colorCheck } from "~/assets/icons";
import theme from "~/styles/theme";
import { d2p } from "~/utils";


interface badgeType {
  interest: Array<{
    title: string;
    isClick: boolean;
  }>,
  household: Array<string>,
  taste: Array<{
    title: string;
    isClick: boolean;
  }>
}
interface BadgeProp {
  text: string,
  type: "picker" | "feed" | "mypage" | "unabled",
  isClick: boolean,
  idx: number,
  userBadge: badgeType,
  setUserBadge: (interestArr: { title: string, isClick: boolean }) => void;
  viewStyle?: ViewStyle
}

const Badge = ({ text, type, isClick, idx, userBadge, setUserBadge, viewStyle }: BadgeProp) => {
  console.log(userBadge, "badge");

  switch (type) {
    case 'picker':
      console.log(idx);
      return (
        <TouchableOpacity
          onPress={() => {
            userBadge.interest.map((v, i) => {
              if (i === idx) {

                setUserBadge({ isClick: !userBadge.interest[i].isClick, title: text });
              }

            })
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