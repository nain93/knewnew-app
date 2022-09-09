import { NativeSyntheticEvent, StyleProp, Text, TextInputContentSizeChangeEventData, TextStyle } from 'react-native';
import React from 'react';

interface CustomTextProps {
  children: React.ReactNode
  style?: StyleProp<TextStyle>
  numberOfLines?: number
  ellipsizeMode?: "clip" | "head" | "middle" | "tail"
}

const CustomText = ({ ellipsizeMode, children, style, numberOfLines }: CustomTextProps) => {
  return (
    <Text
      ellipsizeMode={ellipsizeMode}
      numberOfLines={numberOfLines}
      style={[{ fontSize: 15 }, style]}>{children}</Text>
  );
};

export default CustomText;