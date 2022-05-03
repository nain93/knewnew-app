import { Dimensions } from "react-native";

export function d2p(size: number) {
	//Zeplin에 나와있는 디자인을 iPhone에 맞춰 ppi 값에 따라서 배수를 곱해준다.
	// return size * 3 / PixelRatio.get();
	// console.log(Dimensions.get("screen").width)
	return size / 360 * Dimensions.get("window").width;
}

export function h2p(size: number) {
	return size / 760 * Dimensions.get("window").height;
}