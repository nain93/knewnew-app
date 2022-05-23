import axios from "axios";
import { baseURL } from "~/api";
import { WriteReviewType } from "~/types/review";

export const writeReview = async ({
  token, images, content,
  satisfaction,
  product, parent, cart, tags }: { token: string } & WriteReviewType) => {
  const res = await axios.post(baseURL + "review/", {
    images,
    content,
    satisfaction,
    tags,
    parent
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};