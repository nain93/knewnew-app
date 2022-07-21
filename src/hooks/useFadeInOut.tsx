import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface FadeInOutProp {
  isPopupOpen: {
    isOpen: boolean,
    content: string
  }
  setIsPopupOpen: (
    { isOpen, content }:
      {
        isOpen: boolean,
        content: string
      }) => void
}

const useFadeInOut = ({ isPopupOpen, setIsPopupOpen }: FadeInOutProp) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  };

  // * 알림 팝업창 띄웠다 꺼지는 로직
  useEffect(() => {
    if (isPopupOpen.isOpen) {
      fadeIn();
      setTimeout(() => {
        fadeOut();
        setTimeout(() => {
          setIsPopupOpen({ ...isPopupOpen, isOpen: false });
        }, 100);
      }, 1500);
    }
  }, [isPopupOpen, fadeAnim]);

  return {
    fadeAnim
  };
};

export default useFadeInOut;