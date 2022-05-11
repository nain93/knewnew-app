import React from "react";
import { Image, ImageStyle, ViewStyle } from "react-native";
import { heart, triangle, close } from "~/assets/icons";

interface ReviewIconProp {
  review: "heart" | "triangle" | "close";
  imageStyle?: ImageStyle
}

const ReviewIcon = ({ review, imageStyle }: ReviewIconProp) => {
  return (
    <Image
      source={imgSource(review)}
      resizeMode="contain"
      style={[{ width: 20, height: 20 }, imageStyle]}
    />
  );
};

const imgSource = (review: string) => {
  switch (review) {
    case "heart":
      return heart;
    case "triangle":
      return triangle;
    case "close":
      return close;
  }
};

export default ReviewIcon;