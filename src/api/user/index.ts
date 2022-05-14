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
  representBadge,
  tags
}: UserInfoType) => {
  // console.log(providerType, 'providerType');
  // console.log(providerKey, 'providerKey');
  // console.log(email, 'email');
  // console.log(nickname, 'nickname');
  // console.log(age, 'age');
  // console.log(headline, 'headline');
  // console.log(profileImage, 'profileImage');
  // console.log(occupation, 'occupation');
  // console.log(representBadge, 'representBadge');
  // console.log(tags, 'tags');
  try {
    const res = await axios.post(baseURL + "auth/signup/", {
      providerType,
      providerKey,
      email,
      nickname,
      age: 30,
      headline: "hello, world!",
      profileImage: "mockprofileimage@meali.ng/12345/200x100.jpg",
      occupation: "ㅋㅋ",
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