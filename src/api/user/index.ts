import axios from "axios";
import { baseURL } from "~/api";
import { UserInfoType } from "~/types";

interface UserLoginType {
  token: string,
  providerType: "kakao" | "naver" | "google" | "apple"
}

export const userLogin = async ({ token, providerType }: UserLoginType) => {
  try {
    const res = await axios.post(baseURL + "auth/login/", {
      providerType,
    }, {
      headers: {
        Authorization: token,
      }
    });
    if (res) {
      return res.data;
    }
  }
  catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log(error.response.data);
    }
  }
};


export const userSignup = async ({
  providerType,
  providerKey,
  email,
  nickname,
  age,
  headline,
  profileImage,
  occupation,
  userBadge
}: UserInfoType) => {
  try {
    const res = await axios.post(baseURL + "auth/signup/", {
      providerType,
      providerKey,
      email,
      nickname,
      age,
      headline,
      profileImage,
      occupation,
      userBadge
    });
    if (res) {
      return res.data;
    }
  }
  catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log(JSON.stringify(error.response.data));
    }
  }
};