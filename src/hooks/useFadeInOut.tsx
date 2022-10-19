import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface FadeInOutProp {
  isPopupOpen: boolean
  setIsPopupOpen: (isOpen: boolean) => void,
  openTime?: number
}

const useFadeInOut = ({ isPopupOpen, setIsPopupOpen, openTime = 2000 }: FadeInOutProp) => {
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
    if (isPopupOpen) {
      fadeIn();
      setTimeout(() => {
        fadeOut();
        setTimeout(() => {
          setIsPopupOpen(false);
        }, 100);
      }, openTime);
    }
  }, [isPopupOpen, fadeAnim]);

  return {
    fadeAnim
  };
};

export default useFadeInOut;