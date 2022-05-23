import { AuthorType } from "~/types";
import { ReviewListType } from "~/types/review";

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
  tags: Array<string>,
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
export interface MyPrfoileType {
  id: number,
  nickname: string,
  occupation: string,
  profileImage: string,
  headline: string,
  representBadge: "빵식가" | "애주가" | "디저트러버" | "캠핑족" | "속편한식사" | "다이어터" | "비건" | "간편식" | "한끼식사",
  household: "자취생" | "애기가족" | "가족한끼" | "신혼부부",
  tags: Array<string>,
  created: string,
  reviews: Array<ReviewListType>,
  reviewCount: number,
  bookmarkCount: number,
  bookmarks: Array<ReviewListType>
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