import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface BasicButtonProp {
    text: string;
    color: string;
    marginTop: number;
}

const BasicButton = ({ text, color, marginTop }: BasicButtonProp) => {
    return (
        <TouchableOpacity>
            <View style={{ ...styles.container, backgroundColor: color, marginTop: d2p(marginTop) }}>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>{text}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default BasicButton;

const styles = StyleSheet.create({
    container: {
        width: Dimensions.get('window').width - d2p(40),
        borderRadius: 5,
        height: d2p(45),
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: theme.color.white,
        fontSize: 14,
        fontWeight: 'bold',
    }
});