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