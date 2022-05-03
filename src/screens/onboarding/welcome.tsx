import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import BasicButton from '~/components/button/basicButton';
import theme from '~/styles/theme';
import { d2p } from '~/utils';

const Welcome = () => {
	return (
		<View style={styles.container}>
			{/* eslint-disable-next-line react-native/no-raw-text */}
			<Text style={styles.mainText}><Text style={{ color: theme.color.main }}>여지아</Text> 픽커님{"\n"}
				반가워요!</Text>
			<Text style={{ color: theme.color.main, fontSize: 16, marginLeft: d2p(20) }}>#가성비좋아 #애주가 #맵고수 #해산물파</Text>
			<Text style={{ color: theme.color.gray, fontSize: 14, marginTop: d2p(10), marginLeft: d2p(20), marginBottom: "auto" }}>맛있는 정보 함께 나눠요.</Text>
			<BasicButton text="입장하기" color={theme.color.main} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: d2p(40)
	},
	mainText: {
		fontSize: 26,
		fontWeight: '600',
		marginTop: d2p(173), marginBottom: d2p(60),
		marginLeft: d2p(20),
	}
});

export default Welcome;
