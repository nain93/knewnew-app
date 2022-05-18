import axios from "axios";
import { baseURL } from "~/api";

export const getSearchList = async ({ token, keyword, offset }: { token: string, keyword: string, offset: number }) => {
  const res = await axios.get(baseURL + "search/review/", {
    params: {
      offset,
      keyword
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};
