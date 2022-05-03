import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import onboardingImg from "assets/images/onboardingImg.png";
import kakaoImg from "assets/images/snsImg/kakaoImg.png";
import googleImg from "assets/images/snsImg/googleImg.png";
import naverImg from "assets/images/snsImg/naverImg.png";
import appleImg from "assets/images/snsImg/appleImg.png";

const Onboarding = () => {

	const handleKakaoLogin = () => {

	};

	const handleNaverLogin = () => {

	};

	const handleGoogleLogin = () => {

	};

	const handleAppleLogin = () => {

	};

	return (
		<View style={styles.container}>
			<View style={{ marginLeft: 20 }}>
				<Text style={{ fontSize: 24, fontWeight: "600" }}>실패없는 장보기</Text>
				<View style={styles.logo}>
					<Text>로고 영역</Text>
				</View>
				<Image
					source={onboardingImg}
					resizeMode="contain"
					style={styles.onboardingImg}
				/>
			</View>
			<View style={{ marginTop: d2p(60) }}>
				<Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold" }}>SNS로 시작하기</Text>
				<View style={{ flexDirection: "row", marginTop: d2p(20), alignSelf: "center" }}>
					<TouchableOpacity onPress={handleKakaoLogin}>
						<Image source={kakaoImg} style={styles.snsImg} />
					</TouchableOpacity>
					<TouchableOpacity onPress={handleNaverLogin}>
						<Image source={naverImg} style={styles.snsImg} />
					</TouchableOpacity>
					<TouchableOpacity onPress={handleGoogleLogin}>
						<Image source={googleImg} style={styles.snsImg} />
					</TouchableOpacity>
					{Platform.OS === "ios" &&
						<TouchableOpacity onPress={handleAppleLogin}>
							<Image source={appleImg} style={styles.snsImg} />
						</TouchableOpacity>}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	logo: {
		width: d2p(260),
		height: d2p(80),
		borderWidth: 1,
		marginTop: d2p(8)
	},
	onboardingImg: {
		width: d2p(302),
		height: h2p(287),
		marginTop: d2p(35),
		marginLeft: d2p(58),
	},
	snsImg: {
		width: d2p(50),
		height: d2p(50),
		marginHorizontal: d2p(10)
	}
});

export default Onboarding;