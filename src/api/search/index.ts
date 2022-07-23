import axios from "axios";
import { baseURL } from "~/api";

interface GetSearchListType {
  token: string,
  keyword: string,
  offset: number,
  limit: number
}

export const getSearchList = async ({ token, keyword, offset, limit }: GetSearchListType) => {
  const res = await axios.get(baseURL + "search/review/", {
    params: {
      offset,
      limit,
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
