import React from "react";
import { Image, ViewStyle } from "react-native";
import { like, dislike, retweet, comment, save } from "~/assets/icons";

interface ReviewIconProp {
    reaction: string;
}

const ReactionIcon = ({ reaction }: ReviewIconProp) => {
    return (
        <Image
            source={imgSource(reaction)}
            resizeMode="contain"
            style={{ width: 26, height: 26 }}
        />
    );
};

const imgSource = (reaction: string) => {
    switch (reaction) {
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
}

export default ReactionIcon;