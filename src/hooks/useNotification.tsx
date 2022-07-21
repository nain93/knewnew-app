import { Platform, PlatformOSType, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { useMutation } from 'react-query';
import { registerNotification } from '~/api/setting';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';

const useNotification = () => {
  const token = useRecoilValue(tokenState);

  const notificationMutation = useMutation("registerNotification", ({ FCMToken, type }: { FCMToken: string, type: PlatformOSType }) =>
    registerNotification({ token, FCMToken, type }));

  const notificationPermission = () => {
    // * 아이폰 알림 권한 핸들링
    if (Platform.OS === "ios") {
      messaging().requestPermission().then(isPermission => {
        console.log(isPermission, 'isPermission');
        if (isPermission === 1) {
          messaging().getToken().then(FCMToken => {
            AsyncStorage.setItem("isNotification", JSON.stringify(true));
            notificationMutation.mutate({ FCMToken, type: Platform.OS });
          });
        }
        else {
          AsyncStorage.setItem("isNotification", JSON.stringify(false));
        }
      });
    }
    else {
      // * 알림 디바이스 등록
      messaging().getToken().then(FCMToken => {
        AsyncStorage.setItem("isNotification", JSON.stringify(true));
        notificationMutation.mutate({ FCMToken, type: Platform.OS });
      });
    }
  };

  return {
    notificationPermission
  };
};

export default useNotification;

const styles = StyleSheet.create({});