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

export const blockList = async ({ token, offset, id }: { token: string, id: number, offset?: number }) => {
  const res = await axios.get(baseURL + `user/${id}/blocking/`, {
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

interface EditNotificationType {
  token: string,
  id: number,
  isRead: boolean
}

export const editNotification = async ({ token, id, isRead }: EditNotificationType) => {
  const res = await axios.patch(baseURL + `notification/${id}/`, {
    isRead
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const allReadNotification = async ({ token }: { token: string }) => {
  const res = await axios.patch(baseURL + `notification/`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};

export const isNotification = async ({ token }: { token: string }) => {
  const res = await axios.get(baseURL + "notification/device/", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (res) {
    return res.data;
  }
};
