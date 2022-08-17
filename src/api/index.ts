import axios from "axios";
import Config from "react-native-config";

export const baseURL = Config.BACKEND_URL;
// export const baseURL = "http://1.227.95.139:8000/";

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

interface preSiginedType {
  token: string,
  fileName: Array<string>,
  route: "user" | "review" | "qna"
}

export const preSiginedImages = async ({ token, fileName, route }: preSiginedType) => {
  const res = await axios.post(baseURL + "file/presigned/", {
    fileName,
    route
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export async function uploadImage(file: { uri: string, type: string, name: string | undefined },
  preSigned: { url: string, fields: { [key: string]: string } }) {
  const data = new FormData();
  Object.keys(preSigned.fields).map(k => {
    data.append(k, preSigned.fields[k]);
  });

  data.append("file", file);

  try {
    const res = await axios.post(preSigned.url, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (res) {
      return res.config.data;
    }
  }
  catch (e) {
    console.log(e);
  }
}


interface preSiginedProfileType {
  token: string,
  path: string,
  id: number
}

export const preSiginedProfile = async ({ token, path, id }: preSiginedProfileType) => {
  const res = await axios.post(baseURL + `file/user/${id}/`, {
    path
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const getRecommendFoodLog = async ({ sort }: { sort: "0" | "1" }) => {
  const res = await axios.get(baseURL + "recommend/hot/", {
    params: {
      sort
    }
  });
  if (res) {
    return res.data;
  }
};