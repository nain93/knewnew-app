import axios from "axios";
import { baseURL } from "~/api";

interface AddReortType {
  token: string,
  objectType: "auth" | "review_comment" | "product" | "review",
  objectId: number,
  content: string,
  qnaType: "qna" | "report",
  images?: Array<{ priority: number, image: string }>
}

export const addReport = async ({ token, objectType, objectId, content, qnaType, images }: AddReortType) => {
  const res = await axios.post(baseURL + "qna/", {
    objectType,
    objectId,
    content,
    qnaType,
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