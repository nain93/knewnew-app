export interface WriteReviewType {
  images?: Array<{ priority: number, image: string }>,
  content: string,
  satisfaction: | "best" | "good" | "bad" | "",
  product: number,
  parent: number,
  cart: number,
  market: "선택 안함" | "마켓컬리" | "쿠팡프레시" | "SSG" | "B마트" | "윙잇" | "쿠캣마켓",
  tags: Array<string>
}