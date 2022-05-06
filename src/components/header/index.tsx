import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';
import theme from '~/styles/theme';

interface HeaderProps {
	title?: string;
	headerLeft?: JSX.Element;
	headerRight?: JSX.Element;
}

const Header = ({ headerLeft, headerRight, title }: HeaderProps) => {
	return (
		<View style={styles.container}>
			<TouchableOpacity>
				{headerLeft}
			</TouchableOpacity>
			<Text>
				{title}
			</Text>
			<TouchableOpacity>
				{headerRight}
			</TouchableOpacity>
		</View>
	);
};

export default Header;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: theme.color.grayscale.e9e7ec,
		marginTop: isIphoneX() ? getStatusBarHeight() : 0,
		paddingHorizontal: d2p(20),
		paddingVertical: h2p(15)
	}
});