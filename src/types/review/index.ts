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
  cart?: number,
  market: "선택 안함" | "마켓컬리" | "쿠팡프레시" | "SSG" | "B마트" | "윙잇" | "쿠캣마켓",
  tags: Array<string>
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
  market: string | null,
  parent: string | null,
  product: string | null,
  satisfaction: "best" | "good" | "bad",
  tags: Array<string>
}