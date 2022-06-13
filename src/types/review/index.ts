import { AuthorType } from "~/types";

export interface WriteImagesType {
  id?: number,
  priority: number,
  image: string,
}
export interface WriteReviewType {
  images?: Array<WriteImagesType>,
  content: string,
  satisfaction: | "best" | "good" | "bad" | "",
  product?: number,
  parent?: number,
  parentReview?: ReviewParentType,
  cart?: number,
  market: "선택 안함" | "마켓컬리" | "쿠팡프레시" | "SSG" | "B마트" | "윙잇" | "쿠캣마켓" | "판매처 선택",
  tags: {
    interest: Array<string>,
    household: Array<string>,
    taste: Array<string>
  }
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
  market: "선택 안함" | "마켓컬리" | "쿠팡프레시" | "SSG" | "B마트" | "윙잇" | "쿠캣마켓",
  product: string | null,
  satisfaction: "best" | "good" | "bad",
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
  market: "선택 안함" | "마켓컬리" | "쿠팡프레시" | "SSG" | "B마트" | "윙잇" | "쿠캣마켓",
  parent?: ReviewParentType,
  product: string | null,
  satisfaction: "best" | "good" | "bad",
  tags: {
    interest: Array<string>,
    household: Array<string>,
    taste: Array<string>
  },
  isLike: boolean,
  isBookmark: boolean,
  isEdit: boolean
}