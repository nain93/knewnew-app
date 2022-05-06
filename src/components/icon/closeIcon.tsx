import React from "react";
import { TouchableOpacity, Image, ImageStyle } from "react-native";
import { close } from "~/assets/icons";

interface CloseIcon {
	imageStyle?: ImageStyle
}

const CloseIcon = ({ imageStyle }: CloseIcon) => {
	return (
		<TouchableOpacity onPress={() => console.log("close")}>
			<Image
				source={close}
				resizeMode="contain"
				style={{ width: 24, height: 24, ...imageStyle }}
			/>
		</TouchableOpacity>
	);
};

export default CloseIcon;