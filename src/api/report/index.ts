import axios from "axios";
import { baseURL } from "~/api";

interface AddReortType {
  token: string
}

export const addReport = async ({ token }: AddReortType) => {
  const res = await axios.post(baseURL + "qna/", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};