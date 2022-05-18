import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { like, retweet, comment, colorLike, cart, colorCart } from "~/assets/icons";
import theme from "~/styles/theme";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "react-navigation-stack/lib/typescript/src/vendor/types";
import { UseMutationResult } from "react-query";

interface ReviewIconProp {
  name: "like" | "cart" | "retweet" | "comment";
  count?: number;
  state?: boolean;
  isState?: (isState: boolean) => void;
  mutation?: UseMutationResult<any, unknown, {
    id: number;
    state: boolean;
  }>;
  id: number;
}

const ReactionIcon = ({ name, count, state, isState, mutation, id }: ReviewIconProp) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [reactCount, setReactCount] = useState(count);

  return (
    <TouchableOpacity style={{
      flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', position: 'relative', left: -13
    }} onPress={() => {
      if (isState) {
        isState(!state);
        mutation?.mutate({ id, state: !state });
        if (!state) {
          setReactCount(prev => prev && (prev + 1));
        }
        else {
          setReactCount(prev => prev && (prev - 1));
        }
      } else {
        navigation.navigate(name);
      }
    }} >
      <Image
        source={!state ? imgSource(name)?.item : imgSource(name)?.colored}
        resizeMode="contain"
        style={{ width: 26, height: 26 }}
      />
      <Text style={[{ fontSize: 12 }, !state ? styles.default : styles.clicked, { marginLeft: 9 }]}>{reactCount}</Text>
    </TouchableOpacity >
  );
};

const imgSource = (name: string) => {
  switch (name) {
    case "cart":
      return { item: cart, colored: colorCart };
    case "like":
      return { item: like, colored: colorLike };
    case "retweet":
      return { item: retweet, colored: null };
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