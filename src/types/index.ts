import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";
import { UserInfoTagType } from "~/types/user";

export interface NavigationType {
  navigation: NavigationStackProp;
  route?: NavigationRoute;
}

export interface InterestType {
  title: string;
  isClick: boolean;
  masterBadge?: boolean
}

export interface InterestTagType {
  interest: Array<{
    title: string;
    isClick: boolean;
  }>
}
export interface BadgeType {
  foodStyle: Array<{
    title: string;
    isClick: boolean;
  }>,
  household: Array<{
    title: string;
    isClick: boolean;
  }>,
  occupation: Array<{
    title: string;
    isClick: boolean;
    content?: string
  }>,
  taste?: Array<{
    title: string,
    isClick: boolean
  }>
}

export interface AuthorType {
  id: number,
  nickname: string,
  badge?: string,
  profileImage: string,
  tags: UserInfoTagType
}