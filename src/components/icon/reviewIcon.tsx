import React from "react";
import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from "react-native";
import { heart, circle, bad } from "~/assets/icons";
import { FONT } from "~/styles/fonts";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface ReviewIconProp {
  review: "best" | "good" | "bad";
  imageStyle?: ImageStyle;
  viewStyle?: ViewStyle
}

const ReviewIcon = ({ review, imageStyle, viewStyle }: ReviewIconProp) => {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, viewStyle]}>
      <Image
        source={reviewItem(review)?.image}
        resizeMode="contain"
        style={[{ width: d2p(20), height: d2p(20) }, imageStyle]}
      />
      <Text style={[{ paddingLeft: 5 }, FONT.Bold, review === 'best' ? styles.best : (review === 'good' ? styles.good : styles.bad)]}>
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