import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import React, { useState } from 'react';
import theme from '~/styles/theme';
import Feed from '~/screens/feed';
import Home from '~/screens/home';
import HomeHeader from '~/components/header/HomeHeader';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { h2p } from '~/utils';
import FoodLog from '~/screens/feed/foodLog';
import { FilterType } from '~/types';
import Search from '~/screens/search';

const Stack = createStackNavigator();

const HomeStackNav = () => {
  const [filterScreen, setFilterScreen] = useState<FilterType>("찾아보기");

  return (
    <Stack.Navigator
      screenOptions={
        {
          cardStyle: { backgroundColor: theme.color.white },
          cardStyleInterpolator:
            Platform.OS === "android" ?
              CardStyleInterpolators.forFadeFromBottomAndroid :
              CardStyleInterpolators.forHorizontalIOS
        }
      }>
      <Stack.Screen
        name="Home"
        options={{
          title: "",
          header: () => (
            <HomeHeader
              filterScreen={filterScreen}
              setFilterScreen={(screen: FilterType) => setFilterScreen(screen)} />
          ),
        }}
      // component={filterScreen === "찾아보기" ? Home : FoodLog}
      >
        {props => {
          return (
            <Home {...props} filterScreen={filterScreen} />
          );
        }}
      </Stack.Screen>
      <Stack.Screen
        name="Feed"
        options={{
          title: "",
          header: () => (
            <HomeHeader
              filterScreen={filterScreen}
              setFilterScreen={(screen: FilterType) => setFilterScreen(screen)} />
          ),
        }}
      >
        {props => {
          return (
            <Feed {...props} filterScreen={filterScreen} />
          );
        }}
      </Stack.Screen>
      <Stack.Screen
        name="search"
        component={Search}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNav;

const styles = StyleSheet.create({});