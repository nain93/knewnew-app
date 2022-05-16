import axios from "axios";
import { baseURL } from "~/api";

export const getReviewList = async (token: string) => {
  const res = await axios.get(baseURL + "review/", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};