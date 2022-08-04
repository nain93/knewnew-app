import { Image, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import React from 'react';
import { d2p } from '~/utils';
import { checkIcon } from '~/assets/icons';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';

interface BadgeButtonProps {
  title: string,
  viewStyle?: ViewStyle,
  onPress: () => void,
  isClick: boolean
}

const BadgeButton = ({ title, onPress, viewStyle, isClick }: BadgeButtonProps) => {
  return (
    <TouchableOpacity
      style={[{
        borderColor: isClick ? theme.color.main : theme.color.grayscale.e9e7ec,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: d2p(15),
        paddingVertical: d2p(5),
        flexDirection: "row",
        alignItems: "center",
        marginRight: d2p(5),
        marginBottom: d2p(10)
      }, viewStyle]}
      onPress={onPress}>
      {isClick &&
        <Image style={{ width: d2p(10), height: d2p(8), marginRight: d2p(5) }} source={checkIcon} />
      }
      <Text style={[FONT.Medium, { color: isClick ? theme.color.main : theme.color.black }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default BadgeButton;

const styles = StyleSheet.create({
  container: {
  }
});