import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { hitslop } from '~/utils/constant';

interface HeaderProps {
  title?: string;
  isBorder?: boolean;
  bgColor?: string;
  headerLeft?: JSX.Element;
  headerRight?: JSX.Element;
  headerRightPress?: () => void;
  customRight?: JSX.Element;
  viewStyle?: ViewStyle;
  type?: "search"
}

const Header = ({ type, headerRightPress, headerLeft, headerRight, customRight, title, isBorder = true, bgColor, viewStyle }: HeaderProps) => {
  return (
    <>
      <View style={[styles.container, viewStyle, { borderBottomWidth: isBorder ? 1 : 0 },
      {
        backgroundColor: bgColor ? bgColor : theme.color.white,
        marginTop: Platform.OS === "ios" ? getStatusBarHeight() : 0
      }]}>
        <View
          style={{ position: "absolute", left: d2p(30), top: d2p(30) }}>
          {headerLeft}
        </View>
        <Text style={[{ fontSize: 16, color: theme.color.black }, FONT.Regular]}>
          {title}
        </Text>
        {headerRight ?
          <TouchableOpacity
            hitSlop={hitslop}
            onPress={headerRightPress}
            style={{ position: "absolute", right: d2p(30) }}>
            {headerRight}
          </TouchableOpacity>
          :
          <View style={{ position: "absolute", right: type === "search" ? d2p(20) : d2p(30) }}>
            {customRight}
          </View>
        }
      </View>
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: theme.color.grayscale.e9e7ec,
    paddingVertical: h2p(20)
  }
});