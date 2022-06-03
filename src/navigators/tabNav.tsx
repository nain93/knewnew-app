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
        name="Feed"
        component={Feed}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              style={{ width: d2p(20), height: d2p(20) }}
              source={focused ? mainlogoIcon : graylogo}
            />
          )
        }}
      />
      <Tabs.Screen
        name="Write"
        component={Write}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Write', { loading: false, isEdit: false });
          },
        })}
        options={{
          tabBarStyle: { display: "none" },
          tabBarIcon: () => (
            <Image
              style={{ width: d2p(20), height: d2p(20) }}
              source={graywrite}
            />
          )
        }}
      />
      <Tabs.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              style={{ width: d2p(20), height: d2p(20) }}
              source={focused ? mainSearchIcon : graysearch}
            />
          )
        }}
      />
      <Tabs.Screen
        name="Mypage"
        component={Mypage}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Mypage', {});
          },
        })}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              style={{ width: d2p(20), height: d2p(20) }}
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