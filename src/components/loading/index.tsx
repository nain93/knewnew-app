import { Dimensions, Image, StyleSheet, View, ViewStyle } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import { loading } from '~/assets/gif';

interface LoadingProps {
  viewStyle?: ViewStyle;
}

const Loading = (props: LoadingProps) => {
  return (
    <View style={[styles.container, props.viewStyle]}>
      <Image source={loading} style={{ width: d2p(70), height: d2p(70) }} />
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