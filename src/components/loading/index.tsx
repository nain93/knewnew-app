import { ActivityIndicator, Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import React from 'react';
import { h2p } from '~/utils';
import theme from '~/styles/theme';

interface LoadingProps {
  viewStyle?: ViewStyle;
}

const Loading = (props: LoadingProps) => {
  return (
    <View style={[styles.container, props.viewStyle]}>
      <ActivityIndicator size="large" color={theme.color.main} />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    zIndex: 10,
    top: (Dimensions.get("window").height / 2) - h2p(120),
    alignSelf: "center"
  }
});