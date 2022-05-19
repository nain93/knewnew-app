import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { like, reKnew, comment, colorLike, cart, colorCart } from "~/assets/icons";
import theme from "~/styles/theme";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "react-navigation-stack/lib/typescript/src/vendor/types";
import { UseMutationResult } from "react-query";
import { FONT } from "~/styles/fonts";
import { ReviewListType } from "~/types/review";

interface ReviewIconProp {
  name: "like" | "cart" | "ReKnew" | "comment";
  count?: number;
  state?: boolean;
  isState?: (isState: boolean) => void;
  mutation?: UseMutationResult<any, unknown, {
    id: number;
    state: boolean;
  }>;
  id?: number;
  review?: ReviewListType
}

const ReactionIcon = ({ review, name, count, state, isState, mutation, id }: ReviewIconProp) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [reactCount, setReactCount] = useState(count);

  return (
    <TouchableOpacity style={{
      flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', position: 'relative', left: -13
    }} onPress={() => {
      if (isState && id) {
        isState(!state);
        mutation?.mutate({ id, state: !state });
        if (!state) {
          setReactCount(prev => prev && (prev + 1));
        }
        else {
          setReactCount(prev => prev && (prev - 1));
        }
      } else if (name === "comment") {
        navigation.navigate("FeedDetail", { id });
      } else {

        if (name === "ReKnew") {
          console.log(review, 'review');
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
        style={{ width: 26, height: 26 }}
      />
      <Text style={[{ fontSize: 12 }, !state ? styles.default : styles.clicked, { marginLeft: 9 }, FONT.Bold]}>{reactCount}</Text>
    </TouchableOpacity >
  );
};

const imgSource = (name: string) => {
  switch (name) {
    case "cart":
      return { item: cart, colored: colorCart };
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
    color: theme.color.grayscale.C_79737e,
  },
  clicked: {
    color: theme.color.grayscale.C_79737e,
    fontWeight: 'bold'
  },
});