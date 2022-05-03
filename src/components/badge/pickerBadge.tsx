import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface PickerBadgeProp {
    text: string
}

const PickerBadge = ({ text }: PickerBadgeProp) => {
    return (
        <TouchableOpacity style={styles.select}>
            <Text>{text}</Text>
        </TouchableOpacity>)
}

export default PickerBadge;

const styles = StyleSheet.create({
    select: {
        borderWidth: 1, borderColor: theme.color.lightgray,
        borderRadius: 16,
        marginTop: d2p(8), marginRight: d2p(5),
        paddingVertical: d2p(5), paddingHorizontal: d2p(15),
    },
});