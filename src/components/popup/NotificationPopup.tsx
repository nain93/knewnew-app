import { Dimensions, Image, StyleSheet, Text, View, Animated, Easing, Pressable, Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { knewnewIcon } from '~/assets/icons';
import { FONT } from '~/styles/fonts';
import { tokenState } from '~/recoil/atoms';
import { useRecoilValue } from 'recoil';
import { useMutation } from 'react-query';
import { editNotification } from '~/api/setting';

interface NotificationPopupProp {
  id: number,
  content: string,
  modalOpen: boolean,
  setIsVisible: (view: boolean) => void,
  setModalOpen: (isOpen: boolean) => void,
  onPress: () => void
}

const NotificationPopup = ({ id, content, modalOpen, setIsVisible, setModalOpen, onPress }: NotificationPopupProp) => {
  const moveAnim = useRef(new Animated.Value(-80)).current;
  const token = useRecoilValue(tokenState);
  const editNoti = useMutation("editNoti", ({ notiId, isRead }: { notiId: number, isRead: boolean }) => editNotification({ token, id: notiId, isRead }));

  const moveUp = () => {
    Animated.timing(moveAnim, {
      toValue: h2p(-80),
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => setIsVisible(false));
  };

  const moveDown = () => {
    Animated.timing(moveAnim, {
      toValue: h2p(20) + getStatusBarHeight(),
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  useEffect(() => {
    if (modalOpen) {
      moveDown();
      // * 5초뒤 팝업 자동 종료
      setTimeout(() => {
        setModalOpen(false);
      }, 5000);
    }
    else {
      moveUp();
    }
  }, [modalOpen]);

  return (
    <Animated.View
      style={[styles.container, {
        transform: [{ translateY: moveAnim }]
      }]}>
      <Pressable
        style={styles.pressable}
        onPress={() => {
          onPress();
          // editNoti.mutate({ notiId: id, isRead: true });
          setModalOpen(false);
        }}>
        <View style={{
          width: d2p(30), height: d2p(30), justifyContent: "center",
          alignItems: "center", marginRight: d2p(10)
        }}>
          <Image source={knewnewIcon} style={{ width: d2p(18), height: d2p(18) }} />
        </View>
        <View style={{ width: Dimensions.get("window").width - d2p(100) }}>
          <Text style={FONT.Regular}>{content}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default NotificationPopup;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 20,
    width: Dimensions.get("window").width - d2p(40),
    alignSelf: "center",
    backgroundColor: theme.color.white,
    borderRadius: 8,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: {
      width: 0,
      height: 3
    },
    elevation: Platform.OS === "android" ? 24 : 0,
    shadowRadius: 6,
    shadowOpacity: 1
  },
  pressable: {
    flexDirection: "row",
    alignItems: 'center',
    paddingHorizontal: d2p(10),
    paddingVertical: h2p(15),
    minHeight: h2p(72),
    borderRadius: 8,
  }
});
