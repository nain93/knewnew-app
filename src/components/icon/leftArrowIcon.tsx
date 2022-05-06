import React from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Image, ImageStyle } from "react-native";
import leftArrow from "../../assets/icons/leftArrow.png";

interface LeftArrowIconProps {
	onBackClick?: () => void;
	imageStyle?: ImageStyle
}

const LeftArrowIcon = ({ onBackClick, imageStyle }: LeftArrowIconProps) => {
	const navigation = useNavigation();
	return (
		<TouchableOpacity onPress={onBackClick ? onBackClick : () => navigation.goBack()}>
			<Image
				source={leftArrow}
				resizeMode="contain"
				style={{ height: 24.5, ...imageStyle }}
			/>
		</TouchableOpacity>
	);
};

export default LeftArrowIcon;