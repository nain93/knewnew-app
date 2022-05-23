import axios from "axios";
import { baseURL } from "~/api";

export const getReviewList = async ({ token, tag = "", offset }: { token: string, tag?: string, offset: number }) => {
  const res = await axios.get(baseURL + "review/", {
    params: {
      offset,
      tag
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getReviewDetail = async (token: string, id: number) => {
  const res = await axios.get(baseURL + `review/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const likeReview = async (token: string, id: number, state: boolean) => {
  const res = await axios.post(baseURL + `review/${id}/like/`, {
    isLike: state
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const bookmarkReview = async (token: string, id: number, isBookmark: boolean) => {
  const res = await axios.post(baseURL + `review/${id}/bookmark/`, {
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