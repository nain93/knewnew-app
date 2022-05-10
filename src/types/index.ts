import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";

export interface NavigationType {
  navigation: NavigationStackProp
  route: NavigationRoute;
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
  userBadge: {
    consumptionStyle: string,
    interest: string,
    household: string,
    taste: string,
    preferIngredient: string,
    cookingRecipe: string
  }
}