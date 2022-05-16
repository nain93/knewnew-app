import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";

export interface NavigationType {
  navigation: NavigationStackProp;
  route?: NavigationRoute;
}

export interface MyPrfoileType {
  id: number,
  nickname: string,
  occupation: string,
  created: string
}

export interface UserInfoType {
  providerType: "kakao" | "naver" | "google" | "apple",
  providerKey: number,
  email: string,
  nickname: string,
  age?: number,
  headline?: string,
  profileImage?: string,
  occupation?: string,
  representBadge: string,
  tags: Array<string>
}

export interface InterestType {
  title: string;
  isClick: boolean;
  masterBadge?: boolean
}

export interface BadgeType {
  interest: Array<InterestType>,
  household: Array<{
    title: string,
    isClick: boolean
  }>,
  taste: Array<{
    title: string;
    isClick: boolean;
  }>
}

export interface ReviewListType {
  id: number,
  author: string
}