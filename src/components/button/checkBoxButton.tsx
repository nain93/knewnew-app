import { Image, ImageStyle, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { hitslop } from '~/utils/constant';
import { d2p } from '~/utils';
import theme from '~/styles/theme';
import { whiteCheckIcon } from '~/assets/icons/notificationIcon';

interface CheckBoxButtonPropType {
  toggleCheckBox: boolean,
  setToggleCheckBox: (check: boolean) => void,
  imageStyle?: ImageStyle
}

const CheckBoxButton = ({ toggleCheckBox, setToggleCheckBox, imageStyle }: CheckBoxButtonPropType) => {
  return (
    <Pressable
      hitSlop={hitslop}
      onPress={() => setToggleCheckBox(!toggleCheckBox)}
      style={[{
        width: d2p(14), height: d2p(14),
        borderRadius: 2, marginLeft: d2p(5)
      },
      toggleCheckBox ? {
        backgroundColor: theme.color.main,
        justifyContent: "center", alignItems: "center"
      } : {
        borderWidth: 1,
        borderColor: theme.color.grayscale.C_79737e
      }, imageStyle]}
    >
      <Image source={whiteCheckIcon} style={{ width: d2p(9), height: d2p(7) }} />
    </Pressable>
  );
};

export default CheckBoxButton;

const styles = StyleSheet.create({});