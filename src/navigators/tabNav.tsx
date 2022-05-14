import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from 'react';
import Feed from '~/screens/feed';
import Write from '~/screens/write';
import Search from '~/screens/search';
import Mypage from '~/screens/mypage';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { mainSearchIcon, graylogo, graymypage, graysearch, graywrite, mainmypage, mainlogoIcon } from '~/assets/icons';

const Tabs = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tabs.Navigator

      screenOptions={{
        tabBarLabelStyle: {
          backgroundColor: "transparent",
        },
        // tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          height: h2p(77),
          paddingTop: h2p(20),
          paddingBottom: h2p(30),
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          shadowOffset: {
            width: 10,
            height: 8,
          },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 24,
        },
        tabBarLabel: "",
        headerShown: false
      }}
      sceneContainerStyle={{
        backgroundColor: theme.color.white,
      }}
    >
      <Tabs.Screen
        name="피드"
        component={Feed}

        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              style={{ width: d2p(20), height: h2p(20) }}
              source={focused ? mainlogoIcon : graylogo}
            />
          )
        }}
      />
      <Tabs.Screen
        name="작성"
        component={Write}
        options={{
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ color, focused }) => (
            <Image
              style={{ width: d2p(20), height: h2p(20) }}
              source={graywrite}
            />
          )
        }}
      />
      <Tabs.Screen
        name="검색"
        component={Search}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              style={{ width: d2p(20), height: h2p(20) }}
              source={focused ? mainSearchIcon : graysearch}
            />
          )
        }}
      />
      <Tabs.Screen
        name="마이페이지"
        component={Mypage}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              style={{ width: d2p(20), height: h2p(20) }}
              source={focused ? mainmypage : graymypage}
            />
          )
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({});