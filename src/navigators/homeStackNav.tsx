import { Platform, StyleSheet } from 'react-native';
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
          headerShown: false,
          cardStyle: { backgroundColor: theme.color.grayscale.f7f7fc }
        }}
        component={Home}
      />
      <Stack.Screen
        name="Feed"
        options={{
          headerShown: false
        }}
        component={Feed}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNav;

const styles = StyleSheet.create({});