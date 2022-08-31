import { AuthorType } from "~/types";

export interface WriteImagesType {
  id?: number,
  priority: number,
  image: string,
}

export type FoodLogType = "빵식가" | "애주가" | "디저트러버" | "캠퍼" | "오늘한끼" | "다이어터" | "비건" | "홈카페" | "신상탐험대"

export type MarketType = "네이버 쇼핑" | "마켓컬리" | "쿠팡" | "SSG" | "B마트" | "윙잇" | string

export type SatisfactionType = "good" | "bad" | "best" | "question" | ""

export interface WriteReviewType {
  images?: Array<WriteImagesType>,
  content: string,
  satisfaction: SatisfactionType,
  product?: string,
  parent?: number,
  parentReview?: ReviewParentType,
  cart?: number,
  market?: MarketType,
  tags: {
    interest: Array<string>
  },
}

export interface ReviewParentType {
  author: AuthorType,
  cart?: {
    id: number,
    products: Array<string>
  },
  content: string,
  created: string,
  isActive: boolean
  id: number,
  images: Array<WriteImagesType>,
  market: MarketType,
  product: string | null,
  satisfaction: SatisfactionType,
  tags: {
    interest: Array<string>,
    household: Array<string>,
    taste: Array<string>
  }
}
export interface ReviewListType {
  id: number,
  author: AuthorType,
  bookmarkCount: number,
  cart: {
    id: number,
    products: Array<string>
  }
  childCount: number,
  commentCount: number,
  content: string,
  created: string,
  dislikeCount: number,
  images: Array<WriteImagesType>,
  likeCount: number,
  market: MarketType,
  parent?: ReviewParentType,
  product?: {
    id: number,
    name: string
  },
  satisfaction: SatisfactionType,
  tags: {
    interest: Array<string>,
    household: Array<string>,
    taste: Array<string>
  },
  isLike: boolean,
  isBookmark: boolean,
  isEdit: boolean,
  viewCount: number,
  shareCount: number,
  isVerified: boolean
}