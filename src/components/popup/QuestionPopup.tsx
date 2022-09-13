import { Animated, Dimensions, Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import useFadeInOut from '~/hooks/useFadeInOut';

interface QuestionPopupProps {
  isPopupOpen: boolean,
  setIsPopupOpen: (ispopup: boolean) => void,
  // popupImage: ImageSourcePropType,
  children: JSX.Element | null
}

const QuestionPopup = ({ isPopupOpen, setIsPopupOpen, children }: QuestionPopupProps) => {
  const fadeHook = useFadeInOut({ isPopupOpen, setIsPopupOpen, openTime: 2500 });

  return (
    <Animated.View
      style={{
        opacity: fadeHook.fadeAnim ? fadeHook.fadeAnim : 1,
        zIndex: 10
      }}>
      {children}
    </Animated.View>
  );
};

export default QuestionPopup;

const styles = StyleSheet.create({});
