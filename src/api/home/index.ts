import axios from "axios";
import { baseURL } from "~/api";

export const getBanner = async (token: string) => {
  const res = await axios.get(baseURL + "banner/", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getFoodLogCount = async (token: string) => {
  const res = await axios.get(baseURL + "review/count/", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getRecommend = async ({ token }: { token: string }) => {
  const res = await axios.get(baseURL + "recommend/", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getRecommendFoodLog = async ({ token, sort }: { token: string, sort: "0" | "1" }) => {
  const res = await axios.get(baseURL + "recommend/hot/", {
    params: {
      sort
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};