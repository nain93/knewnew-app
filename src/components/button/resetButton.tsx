import { Image, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import React from 'react';
import { initialize } from '~/assets/icons';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { d2p } from '~/utils';

interface ResetButtonProps {
  viewStyle?: ViewStyle
  resetClick: () => void
}

const ResetButton = ({ viewStyle, resetClick }: ResetButtonProps) => {
  return (
    <TouchableOpacity
      onPress={resetClick}
      style={[viewStyle, { flexDirection: 'row', alignItems: "center" }]}>
      <Image source={initialize} resizeMode="contain" style={{ height: d2p(12), width: d2p(12), marginRight: d2p(5) }} />
      <Text style={[{ color: theme.color.grayscale.a09ca4 }, FONT.Bold]}>초기화</Text>
    </TouchableOpacity >
  );
};

export default ResetButton;

const styles = StyleSheet.create({});