import axios from "axios";
import { baseURL } from "~/api";

export const getReviewComment = async (token: string, rid: number) => {
  const res = await axios.get(baseURL + "comment/review/", { 
    params: { 
      rid 
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const addReviewComment = async (token: string, rid: number, content: string) => {
  const res = await axios.post(baseURL + "comment/review/", {
    review: rid,
    content
  },{ 
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const deleteReviewComment = async (token: string, id: number) => {
  const res = await axios.delete(baseURL + `comment/review/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const editReviewComment = async (token: string, reviewId: number, commentId: number, content: string) => {
  const res = await axios.patch(baseURL + `comment/review/${commentId}/`, {
    review: reviewId,
    content
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};
