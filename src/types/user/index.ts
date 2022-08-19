import { AuthorType } from "~/types";
import { FoodLogType } from "~/types/review";

export interface UserInfoTagType {
  foodStyle: Array<string>,
  household: Array<string>,
  occupation: Array<string>,
  taste?: Array<string>
}
export interface BookmarkType {
  id: number,
  author: AuthorType,
  parent: number | null,
  market: string,
  product: string,
  images: Array<string>,
  cart: {
    id: number,
    products: Array<string>
  },
  content: string,
  satisfaction: "best" | "good" | "bad",
  tags: {
    interest: Array<string>,
    household: Array<string>,
    taste: Array<string>
  },
  bookmarkCount: number,
  childCount: number,
  commentCount: number,
  likeCount: number,
  dislikeCount: number,
  created: string,
  isLike: boolean,
  isBookmark: boolean
}

export interface userNormalType {
  id: number,
  nickname: string,
  profileImage?: string
}
export interface MyProfileType {
  id: number,
  nickname: string,
  occupation?: string,
  profileImage: string,
  headline: string,
  representBadge: FoodLogType,
  household: "자취생" | "애기가족" | "가족한끼" | "신혼부부",
  tags: UserInfoTagType,
  created: string,
  reviewCount: number,
  reviewBookmarkCount: number,
  productBookmarkCount: number,
  remainingPeriod: number,
  isNotifiable: boolean,
  isMarketing: boolean
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
  tags: UserInfoTagType
}

export interface postProfileType {
  nickname: string,
  headline: string,
  profileImage: string | null,
  isNotifiable?: boolean,
  isMarketing?: boolean,
  tags: UserInfoTagType
}