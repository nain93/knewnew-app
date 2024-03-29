import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { like, reKnew, comment, colorLike, cart, colorCart, bookmark, graybookmark, shareIcon } from "~/assets/icons";
import theme from "~/styles/theme";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "react-navigation-stack/lib/typescript/src/vendor/types";
import { UseMutationResult } from "react-query";
import { FONT } from "~/styles/fonts";
import { ReviewListType } from "~/types/review";
import { d2p } from "~/utils";

interface ReviewIconProp {
  name: "like" | "cart" | "ReKnew" | "comment"
  count?: number;
  state?: boolean;
  isState?: (isState: boolean) => void;
  mutation?: UseMutationResult<any, unknown, {
    id: number;
    state: boolean;
  }>;
  id?: number;
  review?: ReviewListType
  viewStyle?: ViewStyle
}

const ReactionIcon = ({ review, name, count, state, isState, mutation, id, viewStyle }: ReviewIconProp) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [reactCount, setReactCount] = useState(count || 0);

  return (
    <TouchableOpacity style={[viewStyle, {
      flexDirection: "row", alignItems: 'center'
    }]} onPress={() => {
      if (isState && id) {
        isState(!state);
        mutation?.mutate({ id, state: !state });
        if (!state) {
          setReactCount(prev => prev + 1);
        }
        else {
          setReactCount(prev => prev - 1);
        }
      } else if (name === "comment") {
        navigation.push("FeedDetail", { id });
      } else {

        if (name === "ReKnew") {
          navigation.navigate(name, { review });
        }
        else {
          navigation.navigate(name);
        }
      }
    }} >
      <Image
        source={!state ? imgSource(name)?.item : imgSource(name)?.colored}
        resizeMode="contain"
        style={{ width: d2p(26), height: d2p(26) }}
      />
      <Text style={[{ fontSize: 12 }, !state ? styles.default : styles.clicked, { marginLeft: d2p(9) }, state ? FONT.Bold : FONT.Regular]}>
        {reactCount}</Text>
    </TouchableOpacity >
  );
};

const imgSource = (name: string) => {
  switch (name) {
    case "cart":
      return { item: bookmark, colored: graybookmark };
    case "like":
      return { item: like, colored: colorLike };
    case "ReKnew":
      return { item: reKnew, colored: null };
    case "comment":
      return { item: comment, colored: null };
  }
};

export default ReactionIcon;

const styles = StyleSheet.create({
  default: {
    color: theme.color.grayscale.C_79737e
  },
  clicked: {
    color: theme.color.grayscale.C_79737e
  },
});