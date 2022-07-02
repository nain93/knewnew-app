import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react';
import { tagIcon, selectTagIcon } from '~/assets/icons';
import { d2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';

interface SelectTagType {
  name: string,
  isSelected: boolean,
  viewStyle?: ViewStyle
}

const SelectTag = ({ name, isSelected, viewStyle }: SelectTagType) => {
  return (
    <View style={[styles.container, viewStyle]}>
      <Image source={isSelected ? selectTagIcon : tagIcon} style={{ width: d2p(12), height: d2p(12), marginRight: d2p(10) }} />
      <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49 }]}>{name}</Text>
    </View>
  );
};

export default SelectTag;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  }
});