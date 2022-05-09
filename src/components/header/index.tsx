import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';
import theme from '~/styles/theme';

interface HeaderProps {
  title?: string;
  headerLeft?: JSX.Element;
  headerRight?: JSX.Element;
}

const Header = ({ headerLeft, headerRight, title }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={{ position: "absolute", left: d2p(20) }}>
        {headerLeft}
      </View>
      <Text style={{ fontSize: 16 }}>
        {title}
      </Text>
      <View style={{ position: "absolute", right: d2p(20) }}>
        {headerRight}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    height: h2p(60),
    borderBottomColor: theme.color.grayscale.e9e7ec,
    marginTop: isIphoneX() ? getStatusBarHeight() : 0,
    paddingVertical: h2p(15)
  }
});