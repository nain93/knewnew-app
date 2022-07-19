import { ViewStyle } from "react-native";
import { atom } from "recoil";

// * 토큰여부에 따라서 로그인 여부 확인
export const tokenState = atom<string>({
  key: "tokenState",
  default: "",
});

export const myIdState = atom<number>({
  key: "myIdState",
  default: -1,
});

export const refreshState = atom<boolean>({
  key: "refreshState",
  default: false
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

interface okPopupStateProps {
  isOpen: boolean;
  content: string;
  popupStyle?: ViewStyle;
  okButton: () => void
}

export const okPopupState = atom<okPopupStateProps>({
  key: "okPopupState",
  default: {
    isOpen: false,
    content: "",
    okButton: () => null,
    popupStyle: {}
  }
});

export const notificationPopup = atom<popupStateProps & { onPress: () => void }>({
  key: "notificationState",
  default: {
    isOpen: false,
    content: "",
    onPress: () => null
  }
});