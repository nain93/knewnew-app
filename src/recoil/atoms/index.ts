import { StyleProp, TextStyle, ViewStyle } from "react-native";
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

export const latestVersionsState = atom<string>({
  key: "latestVerionsState",
  default: ""
});

interface PopupStateType {
  isOpen: boolean;
  content: string;
  popupStyle?: ViewStyle
}

export const popupState = atom<PopupStateType>({
  key: "popupState",
  default: {
    isOpen: false,
    content: "",
    popupStyle: {}
  }
});

interface OkPopupStateType {
  isOpen: boolean;
  content: string;
  popupStyle?: ViewStyle;
  okButton: () => void,
  isBackdrop?: boolean,
  isCancleButton?: boolean
}

export const okPopupState = atom<OkPopupStateType>({
  key: "okPopupState",
  default: {
    isOpen: false,
    content: "",
    okButton: () => null,
    popupStyle: {},
    isBackdrop: true,
    isCancleButton: true
  }
});

interface NotificationPopupType extends PopupStateType {
  onPress: () => void,
  id: number
}

export const notificationPopup = atom<NotificationPopupType>({
  key: "notificationState",
  default: {
    id: -1,
    isOpen: false,
    content: "",
    onPress: () => null
  }
});

interface BottomSheetType {
  onOpen?: () => void
  isOpen: boolean,
  height: number,
  children: JSX.Element,
  customStyles: {
    wrapper?: StyleProp<ViewStyle>;
    container?: StyleProp<ViewStyle>;
    draggableIcon?: StyleProp<ViewStyle>;
  }
}

export const bottomSheetState = atom<BottomSheetType | null>({
  key: "bottomSheetState",
  default: null
});

interface BottomDotSheetType {
  onOpen?: () => void
  isOpen: boolean,
  topTitle: string,
  topPress: () => void,
  topTextStyle?: TextStyle,
  middleTitle?: string,
  middlePress?: () => void,
  bottomTitle: string,
  middleTextStyle?: TextStyle
}

export const bottomDotSheetState = atom<BottomDotSheetType>({
  key: "bottomDotSheetState",
  default: {
    onOpen: () => null,
    isOpen: false,
    topTitle: "",
    topPress: () => null,
    middleTitle: "",
    middlePress: () => null,
    bottomTitle: ""
  }
});