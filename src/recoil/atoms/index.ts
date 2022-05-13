import { ViewStyle } from "react-native";
import { atom } from "recoil";

// * 토큰여부에 따라서 로그인 여부 확인
export const tokenState = atom<string>({
  key: "tokenState",
  default: "",
});

interface popupStateProps {
  isOpen: boolean;
  content: string;
  popupStyle?: ViewStyle
}

export const popupState = atom<popupStateProps>({
  key: "popupState",
  default: {
    isOpen: false,
    content: "",
    popupStyle: {}
  }
});