import axios from "axios";
import { baseURL } from "~/api";

export const getProductDetail = async ({ token, id }: { token: string, id: number }) => {
  const res = await axios.get(baseURL + `market/product/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const productBookmark = async ({ token, id, isBookmark }: { token: string, id: number, isBookmark: boolean }) => {
  const res = await axios.post(baseURL + `market/product/${id}/bookmark/`, {
    isBookmark
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const productBookmarkList = async ({ token, id, offset, limit }: { token: string, id: number, offset: number, limit: number }) => {
  const res = await axios.get(baseURL + `user/${id}/bookmark/product/`, {
    params: {
      offset,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};