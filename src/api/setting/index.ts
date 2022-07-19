import axios from "axios";
import { PlatformOSType } from "react-native";
import { baseURL } from "~/api";

interface registerNotificationType {
  token: string,
  FCMToken: string,
  type: PlatformOSType
}

export const registerNotification = async ({ token, FCMToken, type }: registerNotificationType) => {
  const res = await axios.post(baseURL + "notification/device/", {
    registrationId: FCMToken,
    type
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const deleteNotification = async ({ token, id }: { token: string, id: string }) => {
  const res = await axios.delete(baseURL + `notification/device/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const notificationList = async ({ token, offset }: { token: string, offset: number }) => {
  const res = await axios.get(baseURL + "notification/", {
    params: {
      offset
    },
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

