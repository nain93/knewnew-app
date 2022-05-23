import axios from "axios";
import { baseURL } from "~/api";
import { UserInfoType } from "~/types/user";

export const getMyProfile = async (token: string) => {
  const res = await axios.get(baseURL + "user/", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getUserProfile = async (token: string, id: number) => {
  const res = await axios.get(baseURL + `user/profile/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

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
        "Content-Type": "application/json",
        "Authorization": token,
      }
    });
    if (res) {
      return res.data;
    }
  }
  catch (error) {
    console.log(error, 'error');
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
  representBadge,
  tags
}: UserInfoType) => {
  try {
    const res = await axios.post(baseURL + "auth/signup/", {
      providerType,
      providerKey,
      email,
      nickname,
      age: 30,
      headline,
      profileImage,
      occupation,
      representBadge,
      tags
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

export const getSearchUserList = async ({ token, nickname, offset }: { token: string, nickname: string, offset: number }) => {
  const res = await axios.get(baseURL + "search/user/", {
    params: {
      offset,
      nickname
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};
