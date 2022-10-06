import { Animated, Easing, Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { hitslop } from '~/utils/constant';
import { graysearch } from '~/assets/icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';

interface HomeHeaderPropType {
  filterScreen: "푸드로그" | "찾아보기",
  setFilterScreen: (screen: "푸드로그" | "찾아보기") => void

}

const HomeHeader = ({ filterScreen, setFilterScreen }: HomeHeaderPropType) => {
  const navigation = useNavigation<StackNavigationProp>();
  const moveAnim = useRef(new Animated.Value(96)).current;

  const moveOn = () => {
    Animated.timing(moveAnim, {
      toValue: d2p(90),
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  const moveOff = async () => {
    Animated.timing(moveAnim, {
      toValue: d2p(0),
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  useEffect(() => {
    if (filterScreen === "찾아보기") {
      moveOn();
    }
    else {
      moveOff();
    }
  }, [filterScreen]);

  return (
    <>
      <View
        style={{
          paddingTop: isIphoneX() ? getStatusBarHeight() + h2p(23) : h2p(23)
        }}
      />
      <View style={styles.filterWrap}>
        <Animated.View style={[styles.filter, {
          position: "absolute",
          width: d2p(90),
          height: "100%",
          borderWidth: filterScreen === "푸드로그" ? 1 : 0,
          transform: [{ translateX: moveAnim }],
          borderColor: filterScreen === "푸드로그" ? theme.color.main : theme.color.grayscale.e9e7ec,
        }]} />
        <Pressable
          onPress={() => {
            setFilterScreen("푸드로그");
            moveOff();
          }}
          style={styles.filter}>
          <Text style={[
            filterScreen === "푸드로그" ? FONT.Bold : FONT.Medium
            , {
              color: filterScreen === "푸드로그" ? theme.color.main : theme.color.grayscale.d2d0d5
            }]}>
            푸드로그
          </Text>
        </Pressable>

        <Animated.View style={[styles.filter, {
          position: "absolute",
          width: d2p(90),
          height: "100%",
          borderWidth: filterScreen === "찾아보기" ? 1 : 0,
          transform: [{ translateX: moveAnim }],
          borderColor: filterScreen === "찾아보기" ? theme.color.main : theme.color.grayscale.e9e7ec,
        }]} />
        <Pressable
          onPress={() => {
            setFilterScreen("찾아보기");
            moveOn();
          }}
          style={styles.filter}>
          <Text style={[
            filterScreen === "찾아보기" ? FONT.Bold : FONT.Medium, {
              marginLeft: d2p(10),
              color: filterScreen === "찾아보기" ? theme.color.main : theme.color.grayscale.d2d0d5
            }]}>
            찾아보기
          </Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => navigation.navigate("search")}
        style={{
          marginLeft: "auto",
          position: "absolute",
          right: d2p(15),
          top: isIphoneX() ? getStatusBarHeight() + h2p(23) : h2p(23)
        }}
        hitSlop={hitslop}>
        <Image source={graysearch} style={{ width: d2p(30), height: d2p(30) }} />
      </Pressable>
    </>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  filterWrap: {
    flexDirection: "row",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: theme.color.grayscale.e9e7ec,
    width: d2p(180),
    alignSelf: "center"

  },
  filter: {
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(8),
    borderRadius: 50
  },
});