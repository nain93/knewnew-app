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

export const isNotiReadState = atom<boolean>({
  key: "isNotiReadState",
  default: true
});

export const latestVerionsState = atom<string>({
  key: "latestVerionsState",
  default: ""
});

interface popupStateType {
  isOpen: boolean;
  content: string;
  popupStyle?: ViewStyle
}

export const popupState = atom<popupStateType>({
  key: "popupState",
  default: {
    isOpen: false,
    content: "",
    popupStyle: {}
  }
});

interface okPopupStateType {
  isOpen: boolean;
  content: string;
  popupStyle?: ViewStyle;
  okButton: () => void
}

export const okPopupState = atom<okPopupStateType>({
  key: "okPopupState",
  default: {
    isOpen: false,
    content: "",
    okButton: () => null,
    popupStyle: {}
  }
});

interface notificationPopupType extends popupStateType {
  onPress: () => void,
  id: number
}

export const notificationPopup = atom<notificationPopupType>({
  key: "notificationState",
  default: {
    id: -1,
    isOpen: false,
    content: "",
    onPress: () => null
  }
});