import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface FeedBadgeProp {
    text: string,
    viewStyle?: ViewStyle
}

const FeedBadge = ({ text, viewStyle }: FeedBadgeProp) => {
    return (
        <TouchableOpacity style={styles.badge}>
            <Text style={styles.badgeText}>{text}</Text>
        </TouchableOpacity>);
};

export default FeedBadge;

const styles = StyleSheet.create({
    badge: {
        borderWidth: 1, borderColor: theme.color.main,
        borderRadius: 9,
        paddingVertical: d2p(1), paddingHorizontal: d2p(4),
        marginRight: 'auto'
    },
    badgeText: {
        fontSize: 10, color: theme.color.main
    }
});