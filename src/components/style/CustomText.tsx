import { StyleProp, Text, TextStyle } from 'react-native';
import React from 'react';
import ReadMore from '@fawazahmed/react-native-read-more';

interface CustomTextProps {
  children: React.ReactNode
  style?: StyleProp<TextStyle>
  numberOfLines?: number
}

const CustomText = ({ children, style, numberOfLines }: CustomTextProps) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontSize: 15 }, style]}>{children}</Text>
  );
};

export default CustomText;