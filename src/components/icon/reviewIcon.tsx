import React from "react";
import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from "react-native";
import { heart, circle, bad } from "~/assets/icons";
import theme from "~/styles/theme";

interface ReviewIconProp {
  review: "heart" | "general" | "bad";
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
      <Text style={[{ paddingLeft: 5, fontWeight: 'bold' }, review === 'heart' ? styles.heart : (review === 'general' ? styles.triangle : styles.default)]}>
        {reviewItem(review)?.text}</Text>
    </View >
  );
};

const reviewItem = (review: string) => {
  switch (review) {
    case "heart":
      return { image: heart, text: '최고예요', };
    case "general":
      return { image: circle, text: '괜찮아요', };
    case "bad":
      return { image: bad, text: '별로예요', };
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
  circle: {
    color: theme.color.yellow
  }
});