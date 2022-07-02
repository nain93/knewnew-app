import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";

export interface NavigationType {
  navigation: NavigationStackProp;
  route?: NavigationRoute;
}

export interface InterestType {
  title: string;
  isClick: boolean;
  masterBadge?: boolean
}

export interface BadgeType {
  foodLife: Array<{
    title: string;
    isClick: boolean;
  }>,
  household: Array<{
    title: string;
    isClick: boolean;
  }>,
  lifeStyle: Array<{
    title: string;
    isClick: boolean;
    content?: string
  }>
}

export interface AuthorType {
  id: number,
  representBadge: "빵식가" | "애주가" | "디저트러버" | "캠핑족" | "속편한식사" | "다이어터" | "비건" | "간편식" | "한끼식사",
  nickname: string,
  household: "자취생" | "애기가족" | "가족한끼" | "신혼부부",
  profileImage: string
}