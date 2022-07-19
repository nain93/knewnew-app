import { StyleProp, Text, TextStyle } from 'react-native';
import React from 'react';

interface CustomTextProps {
  children: React.ReactNode
  style?: StyleProp<TextStyle>
}

const CustomText = ({ children, style }: CustomTextProps) => {
  return (
    <Text style={[{ fontSize: 15 }, style]}>{children}</Text>
  );
};

export default CustomText;