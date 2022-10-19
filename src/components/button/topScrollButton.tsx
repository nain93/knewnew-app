import { FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { RefObject } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { topImage } from '~/assets/images';

interface TopScrollButtonPropType {
  scrollRef: RefObject<FlatList>
}

const TopScrollButton = ({ scrollRef }: TopScrollButtonPropType) => {
  return (
    <>
      {Platform.OS === "android" &&
        <TouchableOpacity
          onPress={() => scrollRef.current?.scrollToOffset({ offset: 0, animated: true })}
          style={{
            position: "absolute",
            width: d2p(46),
            height: d2p(46),
            borderRadius: 46,
            right: d2p(20),
            bottom: h2p(96),
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec,
            backgroundColor: theme.color.white,
            zIndex: 20
          }}>
          <Image source={topImage} style={{ width: d2p(21), height: d2p(20.5) }} />
        </TouchableOpacity>
      }
    </>
  );
};

export default TopScrollButton;

const styles = StyleSheet.create({});