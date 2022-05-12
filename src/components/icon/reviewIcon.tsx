import React from "react";
import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from "react-native";
import { heart, triangle, close } from "~/assets/icons";
import theme from "~/styles/theme";

interface ReviewIconProp {
  review: "heart" | "triangle" | "close";
  imageStyle?: ImageStyle
}

const ReviewIcon = ({ review, imageStyle }: ReviewIconProp) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={reviewItem(review)?.image}
        resizeMode="contain"
        style={[{ width: 20, height: 20 }, imageStyle]}
      />
      <Text style={[{ paddingLeft: 5 }, review === 'heart' ? styles.heart : (review === 'triangle' ? styles.triangle : styles.default)]}>
        {reviewItem(review)?.text}</Text>
    </View >
  );
};

const reviewItem = (review: string) => {
  switch (review) {
    case "heart":
      return { image: heart, text: '최고예요', };
    case "triangle":
      return { image: triangle, text: '그저그래요', };
    case "close":
      return { image: close, text: '별로예요', };
  }
};

export default ReviewIcon;

const styles = StyleSheet.create({
  default: {
    color: theme.color.black
  },
  heart: {
    color: theme.color.main
  },
  triangle: {
    color: theme.color.yellow
  }
});