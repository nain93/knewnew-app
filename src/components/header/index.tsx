import { Dimensions, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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
  type?: "feed"
}

function StatusBarPlaceHolder() {
  return (
    <View style={{
      width: "100%",
      height: getStatusBarHeight(),
      backgroundColor: theme.color.white
    }} />
  );
}

const Header = ({ type, headerRightPress, headerLeft, headerRight, customRight, title, isBorder = true, bgColor, viewStyle }: HeaderProps) => {
  return (
    <>
      {(type !== "feed" && !isIphoneX() && Platform.OS === "ios") &&
        <StatusBarPlaceHolder />}
      <View style={[styles.container, viewStyle, { borderBottomWidth: isBorder ? 1 : 0 }, { backgroundColor: bgColor }]}>
        <View
          style={{ position: "absolute", left: d2p(20) }}>
          {headerLeft}
        </View>
        <Text style={[{ fontSize: 16, color: theme.color.black }, FONT.Regular]}>
          {title}
        </Text>
        {headerRight ?
          <TouchableOpacity
            hitSlop={hitslop}
            onPress={headerRightPress}
            style={{ position: "absolute", right: d2p(20) }}>
            {headerRight}
          </TouchableOpacity>
          :
          <View style={{ position: "absolute", right: d2p(20) }}>
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
    alignItems: "center",
    justifyContent: "center",
    borderBottomColor: theme.color.grayscale.e9e7ec,
    marginTop: isIphoneX() ? getStatusBarHeight() : 0,
    paddingVertical: h2p(20),
  }
});