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
  const res = await axios.get(baseURL + `user/${id}/profile/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

interface EditPrfoileType {
  token: string,
  id: number,
  isNotifiable?: boolean,
  isMarketing?: boolean,
  profile: {
    nickname?: string,
    profileImage?: string | null,
    headline?: string,
    tags?: Array<string>
  }
}

export const editUserProfile = async ({ token, id, profile }: EditPrfoileType) => {
  const res = await axios.patch(baseURL + `user/${id}/profile/`, {
    ...profile,
  }, {
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
  providerType: "kakao" | "naver" | "google" | "apple" | "email",
  userInput?: {
    email: string,
    password: string
  }
}

export const userLogin = async ({ token, providerType, userInput }: UserLoginType) => {
  try {
    const res = await axios.post(baseURL + "auth/login/", {
      providerType,
      email: userInput?.email,
      password: userInput?.password
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
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
  }
};

export const userSignup = async ({
  providerType,
  providerKey,
  nickname,
  email,
  password,
  birth,
  gender,
  profileImage,
  headline,
  occupation,
  representBadge,
  tags,
  isAgreePolicy
}: UserInfoType) => {
  try {
    const res = await axios.post(baseURL + "auth/signup/", {
      providerType,
      providerKey,
      email,
      nickname,
      profileImage,
      occupation,
      representBadge,
      headline,
      tags,
      birth,
      gender,
      isAgreePolicy
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

export const deleteUser = async ({ token, id }: { token: string, id: number }) => {
  const res = await axios.delete(baseURL + `user/${id}/profile/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

interface GetUserReviewListType {
  token: string,
  id: number,
  offset: number,
  limit: number
}

export const getUserReviewList = async ({ token, id, offset, limit }: GetUserReviewListType) => {
  const res = await axios.get(baseURL + `user/${id}/reviews/`, {
    params: {
      offset,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

interface GetUserBookmarkListType {
  token: string,
  id: number,
  offset: number,
  limit: number
}

export const getUserBookmarkList = async ({ token, id, offset, limit }: GetUserBookmarkListType) => {
  const res = await axios.get(baseURL + `user/${id}/bookmark/review/`, {
    params: {
      offset,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getUserProductBookmarkList = async ({ token, id, offset, limit }: GetUserBookmarkListType) => {
  const res = await axios.get(baseURL + `user/${id}/bookmark/product/`, {
    params: {
      offset,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

interface BlockUserType {
  token: string,
  id: number,
  isBlock: boolean
}

export const blockUser = async ({ token, id, isBlock }: BlockUserType) => {
  const res = await axios.post(baseURL + `user/${id}/block/`, {
    isBlock
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const userFollow = async ({ token, userId, isFollow }: { token: string, userId: number, isFollow: boolean }) => {
  const res = await axios.post(baseURL + `user/${userId}/follow/`, {
    isFollow
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const deleteMyFollower = async ({ token, userId }: { token: string, userId: number }) => {
  const res = await axios.delete(baseURL + `user/follower/${userId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getFollowingList = async ({ token, id, offset, limit }: GetUserReviewListType) => {
  const res = await axios.get(baseURL + `user/${id}/following/`, {
    params: {
      offset,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getFollowerList = async ({ token, id, offset, limit }: GetUserReviewListType) => {
  const res = await axios.get(baseURL + `user/${id}/follower/`, {
    params: {
      offset,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};