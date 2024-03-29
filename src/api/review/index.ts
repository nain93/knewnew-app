import axios from "axios";
import { baseURL } from "~/api";
import { WriteReviewType } from "~/types/review";
interface GetReviewListType {
  token: string,
  tag?: string,
  market?: string,
  satisfaction?: string,
  sort: "0" | "1" | "2" | "3",
  offset: number,
  limit?: number,
  product?: string
}

export const getReviewList = async ({ token, tag, market, satisfaction, sort, offset, product, limit }: GetReviewListType) => {
  const res = await axios.get(baseURL + "review/", {
    params: {
      offset,
      limit,
      tag,
      market,
      satisfaction,
      sort,
      product
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

export const bookmarkReview = async (token: string, id: number, state: boolean) => {
  const res = await axios.post(baseURL + `review/${id}/bookmark/`, {
    isBookmark: state
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const shareReview = async ({ token, id }: { token: string, id: number }) => {
  const res = await axios.get(baseURL + `review/${id}/share/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const writeReview = async ({
  token, images, content,
  satisfaction, market,
  product, parent, cart, tags }: { token: string } & WriteReviewType) => {
  const res = await axios.post(baseURL + "review/", {
    images,
    content,
    satisfaction,
    tags,
    parent,
    market,
    product
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const editReview = async ({
  token, id, images, content,
  satisfaction, market,
  product, parent, cart, tags }: { token: string, id: number } & WriteReviewType) => {
  const res = await axios.patch(baseURL + `review/${id}/`, {
    images,
    content,
    satisfaction,
    tags,
    parent,
    market,
    product: product ? product : null
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const deleteReview = async (token: string, id: number) => {
  const res = await axios.delete(baseURL + `review/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const deleteReviewImage = async (token: string, id: number) => {
  const res = await axios.delete(baseURL + `review/image/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};