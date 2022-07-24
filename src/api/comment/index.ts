import axios from "axios";
import { baseURL } from "~/api";

interface GetReviewCommentType {
  token: string,
  reviewId: number,
  offset: number,
  limit?: number
}

export const getReviewComment = async ({ token, reviewId, offset, limit }: GetReviewCommentType) => {
  const res = await axios.get(baseURL + "comment/review/", {
    params: {
      offset,
      limit,
      rid: reviewId
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

interface addReviewCommentType {
  token: string,
  reviewId: number,
  parentId?: number,
  content: string
}

export const addReviewComment = async ({ token, reviewId, parentId, content }: addReviewCommentType) => {
  const res = await axios.post(baseURL + "comment/review/", {
    review: reviewId,
    parent: parentId,
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

interface editReviewCommentType {
  token: string,
  reviewId: number,
  commentId: number,
  content: string
  parentId?: number
}

export const editReviewComment = async ({ token, reviewId, commentId, content }: editReviewCommentType) => {
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

interface likeCommentType {
  token: string,
  commentId: number,
  isLike: boolean
}

export const likeComment = async ({ token, commentId, isLike }: likeCommentType) => {
  const res = await axios.post(baseURL + `comment/review/${commentId}/like/`, {
    isLike
  },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
  if (res) {
    return res.data;
  }
};