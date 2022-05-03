import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ViewStyle } from "react-native";
import theme from "~/styles/theme";
import { d2p } from "~/utils";

interface BasicButtonProp {
	text: string;
	color: string;
	viewStyle?: ViewStyle;
}

const BasicButton = ({ text, color, viewStyle }: BasicButtonProp) => {
	return (
		<TouchableOpacity>
			<View style={{ ...styles.container, backgroundColor: color, ...viewStyle }}>
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
		marginHorizontal: d2p(20),
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