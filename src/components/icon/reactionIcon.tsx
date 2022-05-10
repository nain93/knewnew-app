import React from "react";
import { Image, Text, TouchableOpacity, ViewStyle } from "react-native";
import { like, dislike, retweet, comment, save, colorLike, colorDislike, colorSave } from "~/assets/icons";
import theme from "~/styles/theme";
import { NavigationStackProp } from "react-navigation-stack";

interface ReviewIconProp {
  name: "like" | "dislike" | "retweet" | "comment" | "save";
  state?: boolean;
  setState?: (isState: boolean) => void;
  navigation?: NavigationStackProp;
}

const ReactionIcon = ({ name, state, setState, navigation }: ReviewIconProp) => {
  return (
    <TouchableOpacity style={{
      flexDirection: "row", alignItems: 'center', justifyContent: 'space-around'
    }} onPress={() => setState ? setState(!state) : navigation?.navigate(name)} >
      <Image
        source={!state ? imgSource(name) : imgColorSource(name)}
        resizeMode="contain"
        style={{ width: 26, height: 26 }}
      />
      <Text style={{ fontSize: 12, color: !state ? theme.color.grayscale.C_79737e : theme.color.main, marginLeft: 9 }}>15</Text>
    </TouchableOpacity >
  );
};

const imgSource = (name: string) => {
  switch (name) {
    case "like":
      return like;
    case "dislike":
      return dislike;
    case "retweet":
      return retweet;
    case "comment":
      return comment;
    case "save":
      return save;
  }
};

const imgColorSource = (name: string) => {
  switch (name) {
    case "like":
      return colorLike;
    case "dislike":
      return colorDislike;
    case "retweet":
      return null;
    case "comment":
      return null;
    case "save":
      return colorSave;
  }
};

export default ReactionIcon;