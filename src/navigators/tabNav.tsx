import { Image, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from 'react';
import Mypage from '~/screens/mypage';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { graylogo, graymypage, graywrite, mainmypage, mainlogoIcon, settingIcon, mainNotiIcon, notiIcon } from '~/assets/icons';
import { useRecoilValue } from 'recoil';
import { isNotiReadState, myIdState } from '~/recoil/atoms';
import Header from '~/components/header';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import BeforeWrite from '~/screens/write/beforeWrite';
import HomeStackNav from '~/navigators/homeStackNav';
import Notification from '~/screens/feed/notification';
import { getFocusedRouteNameFromRoute, useRoute } from '@react-navigation/native';
import { home, mainHome, mainMy, mainNotification, my, notification, write } from '~/assets/icons/tabBar';

const Tabs = createBottomTabNavigator();

function StatusBarPlaceHolder() {
  return (
    <View style={{
      width: "100%",
      position: "absolute",
      top: 0,
      height: getStatusBarHeight(),
      backgroundColor: theme.color.white
    }} />
  );
}

const TabNavigator = () => {
  const myId = useRecoilValue(myIdState);
  const isNotiRead = useRecoilValue(isNotiReadState);
  const screen = useRoute();
  const routeName = getFocusedRouteNameFromRoute(screen);


  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontFamily: "Pretendard-Regular",
          fontSize: 12,
          marginTop: h2p(10),
          backgroundColor: "transparent"
        },
        tabBarActiveTintColor: theme.color.main,
        tabBarInactiveTintColor: "#343434",
        // tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          height: h2p(77),
          paddingTop: h2p(20),
          paddingBottom: isIphoneX() ? h2p(25) : h2p(20),
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          shadowOffset: {
            width: 10,
            height: 8,
          },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 24,
        }
      }}
      sceneContainerStyle={{
        backgroundColor: theme.color.white,
      }}
    >
      <Tabs.Screen
        name="HomeStackNav"
        component={HomeStackNav}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Home', { scrollUp: routeName === "HomeStackNav" ? true : false });
          }
        })}
        options={{
          tabBarLabel: "홈",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              style={{ width: d2p(16.67), height: d2p(16.67) }}
              source={focused ? mainHome : home}
            />
          )
        }}
      />
      <Tabs.Screen
        name="BeforeWrite"
        component={BeforeWrite}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('BeforeWrite', { stateReset: true });
          },
        })}
        options={{
          tabBarLabel: "작성",
          headerShown: false,
          tabBarStyle: { display: "none" },
          tabBarIcon: () => (
            <Image
              style={{ width: d2p(19), height: d2p(19) }}
              source={write}
            />
          )
        }}
      />
      <Tabs.Screen
        name="Notification"
        component={Notification}
        options={{
          tabBarLabel: "소식",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View>
              <Image
                style={{ width: d2p(14), height: d2p(18) }}
                source={focused ? mainNotification : notification}
              />
              {!isNotiRead &&
                <View style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  alignSelf: "center",
                  borderRadius: 4,
                  width: d2p(4), height: d2p(4), backgroundColor: theme.color.main
                }} />
              }
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="Mypage"
        component={Mypage}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Mypage', { id: myId });
          },
        })}
        options={{
          tabBarLabel: "마이",
          header: ({ navigation }) => (
            <>
              <StatusBarPlaceHolder />
              <Header
                title={"마이"}
                bgColor={theme.color.white}
                headerRight={<Image source={settingIcon} style={{ width: d2p(16), height: d2p(16) }} />}
                headerRightPress={() => navigation.navigate("setting")}
              />
            </>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              style={{ width: d2p(16), height: d2p(18) }}
              source={focused ? mainMy : my}
            />
          )
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({});