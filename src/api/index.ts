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

export async function uploadImage(file: string, preSigned: { url: string, fields: { [key: string]: string } }) {
  const data = new FormData();
  Object.keys(preSigned.fields).map(k => {
    data.append(k, preSigned.fields[k]);
  });

  const parsedPath = file.split("/");
  const filename = parsedPath[parsedPath.length - 1];
  const parsedFilename = filename.split(".");

  data.append("file", {
    uri: file,
    type: `image/${parsedFilename[parsedFilename.length - 1]}`,
    name: filename,
  });

  return (await axios.post(preSigned.url, data)).data;
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