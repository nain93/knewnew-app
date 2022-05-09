import React from "react";
import { Image, ViewStyle } from "react-native";
import { heart, triangle, close } from "~/assets/icons";

interface ReviewIconProp {
  review: string;
}

const ReviewIcon = ({ review }: ReviewIconProp) => {
  return (
    <Image
      source={imgSource(review)}
      resizeMode="contain"
      style={{ width: 20, height: 20 }}
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
}

export default ReviewIcon;