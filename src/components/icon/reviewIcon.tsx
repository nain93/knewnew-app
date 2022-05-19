import React from "react";
import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from "react-native";
import { heart, circle, bad } from "~/assets/icons";
import { FONT } from "~/styles/fonts";
import theme from "~/styles/theme";

interface ReviewIconProp {
  review: "best" | "good" | "bad";
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
      <Text style={[{ paddingLeft: 5, fontWeight: 'bold' }, FONT.Bold, review === 'best' ? styles.best : (review === 'good' ? styles.good : styles.bad)]}>
        {reviewItem(review)?.text}</Text>
    </View >
  );
};

const reviewItem = (review: string) => {
  switch (review) {
    case "best":
      return { image: heart, text: '최고예요', };
    case "good":
      return { image: circle, text: '괜찮아요', };
    case "bad":
      return { image: bad, text: '별로예요', };
  }
};


const styles = StyleSheet.create({
  bad: {
    color: theme.color.black
  },
  best: {
    color: theme.color.main
  },
  good: {
    color: theme.color.yellow
  }
});

export default ReviewIcon;