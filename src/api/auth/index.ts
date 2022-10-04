import axios from "axios";
import { baseURL } from "~/api";

export const emailCheck = async (email: string) => {
  const res = await axios.post(baseURL + "auth/email/duplicate/", {
    email
  });
  if (res) {
    return res.data;
  }
};

export const getEmailCode = async (email: string) => {
  const res = await axios.post(baseURL + "auth/email/verify/", {
    email
  });
  if (res) {
    return res.data;
  }
};

export const emailVerify = async ({ email, code }: { email: string, code: string }) => {
  const res = await axios.post(baseURL + "/auth/email/verify/code/", {
    email,
    code
  });
  if (res) {
    return res.data;
  }
};
