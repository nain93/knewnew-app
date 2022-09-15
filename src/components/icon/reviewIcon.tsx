import React from "react";
import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from "react-native";
import { heart, circle, bad, question } from "~/assets/icons";
import { FONT } from "~/styles/fonts";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface ReviewIconProp {
  review: "best" | "good" | "bad" | "question" | "";
  imageStyle?: ImageStyle;
  viewStyle?: ViewStyle
  type?: "image"
}

const ReviewIcon = ({ review, imageStyle, viewStyle, type }: ReviewIconProp) => {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, viewStyle]}>
      <Image
        source={reviewItem(review)?.image}
        resizeMode="contain"
        style={[{ width: d2p(17), height: d2p(18) }, imageStyle]}
      />
      <Text style={[{ marginLeft: d2p(4), fontSize: type === "image" ? 12 : 14 }, FONT.Bold, review === 'best' ? styles.best : (review === 'good' ? styles.good : styles.bad)]}>
        {reviewItem(review)?.text}</Text>
    </View >
  );
};

const reviewItem = (review: string) => {
  switch (review) {
    case "best":
      return { image: heart, text: "최고예요", };
    case "good":
      return { image: circle, text: "괜찮아요", };
    case "bad":
      return { image: bad, text: "별로예요", };
    case "question":
      return { image: question, text: "궁금해요" };
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