import { Dimensions, Image, StyleSheet, Text, View, Animated, Easing, Pressable } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { knewnewIcon } from '~/assets/icons';
import { FONT } from '~/styles/fonts';

interface NotificationPopupProp {
  content: string,
  modalOpen: boolean,
  setIsVisible: (view: boolean) => void
  setModalOpen: (isOpen: boolean) => void
}

const NotificationPopup = ({ content, modalOpen, setIsVisible, setModalOpen }: NotificationPopupProp) => {
  const moveAnim = useRef(new Animated.Value(-80)).current;

  const moveUp = () => {
    Animated.timing(moveAnim, {
      toValue: h2p(-80),
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => setIsVisible(false));
  };

  const moveDown = async () => {
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
      // setTimeout(() => {
      //   setModalOpen(false);
      // }, 2000);
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
        onPress={() => console.log("noti")}>
        <View style={{ width: d2p(30), height: d2p(30), justifyContent: "center", alignItems: "center" }}>
          <Image source={knewnewIcon} style={{ width: d2p(18), height: d2p(18) }} />
        </View>
        <Text style={FONT.Regular}>{content}</Text>
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
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 6,
    shadowOpacity: 1
  },
  pressable: {
    flexDirection: "row",
    alignItems: 'center',
    paddingHorizontal: d2p(10),
    paddingVertical: h2p(15),
    minHeight: h2p(72),
    borderRadius: 8
  }
});