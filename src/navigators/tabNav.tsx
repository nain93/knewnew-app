import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from 'react';
import Feed from '~/screens/feed';
import Write from '~/screens/write';
import Search from '~/screens/search';
import Mypage from '~/screens/mypage';
import theme from '~/styles/theme';

const Tabs = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tabs.Navigator
      screenOptions={{
      }}
      sceneContainerStyle={{
        backgroundColor: theme.color.white,
      }}
    >
      <Tabs.Screen
        name="피드"
        component={Feed}
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="작성"
        component={Write}
        options={{
          tabBarStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="검색"
        component={Search}
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="마이페이지"
        component={Mypage}
        options={{
          headerShown: false,
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({});