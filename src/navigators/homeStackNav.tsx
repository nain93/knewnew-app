import { Platform, StyleSheet, Text, View } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import React from 'react';
import theme from '~/styles/theme';
import Feed from '~/screens/feed';
import Home from '~/screens/home';

const Stack = createStackNavigator();

const HomeStackNav = () => {
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
          headerShown: false,
        }}
        component={Home}
      />
      <Stack.Screen
        name="Feed"
        options={{
          title: "",
          headerShown: false,
        }}
        component={Feed}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNav;

const styles = StyleSheet.create({});