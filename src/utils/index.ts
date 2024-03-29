import { Dimensions, PermissionsAndroid } from "react-native";
import analytics from '@react-native-firebase/analytics';

export function d2p(size: number) {
  //Zeplin에 나와있는 디자인을 iPhone에 맞춰 ppi 값에 따라서 배수를 곱해준다.
  // return size * 3 / PixelRatio.get();
  // console.log(Dimensions.get("screen").width)
  return size / 360 * Dimensions.get("window").width;
}

export function h2p(size: number) {
  return size / 760 * Dimensions.get("window").height;
}

export function simpleDate(date: string, suffix?: string): string {
  const formatDate = new Date(date);
  const now = new Date(Date.now());

  const diff: number = now.valueOf() - formatDate.valueOf();
  if (diff < 0)
    return `0분${suffix ?? ""}`;
  const diffMin: number = Math.floor(diff / 1000 / 60);
  if (diffMin <= 10)
    return `${diffMin}분${suffix ?? ""}`;
  else if (diffMin > 10 && diffMin <= 30)
    return `30분${suffix ?? ""}`;
  else if (diffMin > 30 && diffMin <= 60)
    return `1시간${suffix ?? ""}`;

  const diffHour: number = Math.floor(diffMin / 60);
  if (diffHour < 12)
    return `${diffHour}시간${suffix ?? ""}`;

  // const diffDay: number = Math.floor(diffHour / 24);
  // if (diffDay <= 3)
  //   return `${diffDay}일${suffix ?? ""}`;

  return `${formatDate.getFullYear()}.${formatDate.getMonth() + 1}.${formatDate.getDate()}`;
}

export function dateCommentFormat(date: string) {
  return date.slice(0, 4) + '.' + date.slice(5, 7) + '.' + date.slice(8, 10) + ' ' + date.slice(11, 16);
}

export function dateNormalFormat(date: string) {
  return date.slice(0, 4) + '-' + date.slice(5, 7) + '-' + date.slice(8, 10);
}

// * 천단위 , 찍어주는 함수
export const inputPriceFormat = (str: string) => {
  const comma = (strCom: string) => {
    return strCom.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
  };
  const unComma = (strUnCom: string) => {
    return strUnCom.replace(/[^\d]+/g, "");
  };
  return comma(unComma(str));
};

export async function hasAndroidPermission() {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }
  const status = await PermissionsAndroid.request(permission);
  return status === "granted";
}

export async function googleAnalytics(screen: string) {
  if (!__DEV__) {
    await analytics().logScreenView({
      screen_name: screen
    });
  }
}

export const convertFoodLogName = (name: string) => {
  switch (name) {
    case "dieter": {
      return "다이어터";
    }
    case "vegan": {
      return "비건";
    }
    case "drink": {
      return "애주가";
    }
    default: {
      return name;
    }
  }
};