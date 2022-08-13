import { AuthorType } from "~/types";

export interface WriteImagesType {
  id?: number,
  priority: number,
  image: string,
}

export type MarketType = "네이버스토어" | "마켓컬리" | "쿠팡프레시" | "SSG" | "B마트" | "윙잇" | string

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
  shareCount: number
}