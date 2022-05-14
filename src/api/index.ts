import axios from "axios";
import Config from "react-native-config";

export const baseURL = Config.BACKEND_URL;

export const getNewToken = async (refreshToken: string) => {
  const res = await axios.get(baseURL + "auth/refresh/", {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    }
  });
  if (res) {
    return res.data;
  }
};