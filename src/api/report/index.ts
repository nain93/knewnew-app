import axios from "axios";
import { baseURL } from "~/api";

interface AddReortType {
  token: string,
  objectType: "auth" | "review_comment" | "product" | "review",
  content: string,
  review?: number,
  reviewComment?: number,
  qnaType: "qna" | "report",
  images?: Array<{ priority: number, image: string }>
}

export const addReport = async ({ token, objectType, content, qnaType, images, review, reviewComment }: AddReortType) => {
  const res = await axios.post(baseURL + "qna/", {
    objectType,
    content,
    qnaType,
    review,
    reviewComment,
    images
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};