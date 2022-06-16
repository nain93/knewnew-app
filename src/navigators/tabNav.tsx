import { Image, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState } from 'react';
import Feed from '~/screens/feed';
import Write from '~/screens/write';
import Search from '~/screens/search';
import Mypage from '~/screens/mypage';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { mainSearchIcon, graylogo, graymypage, graysearch, graywrite, mainmypage, mainlogoIcon, more } from '~/assets/icons';
import { useRecoilValue } from 'recoil';
import { myIdState } from '~/recoil/atoms';
import Header from '~/components/header';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import MypageHeader from '~/screens/mypage/mypageHeader';

const Tabs = createBottomTabNavigator();

function StatusBarPlaceHolder() {
  return (
    <View style={{
      width: "100%",
      height: getStatusBarHeight(),
      backgroundColor: theme.color.white
    }} />
  );
}

const TabNavigator = () => {
  const myId = useRecoilValue(myIdState);
  const [openMore, setOpenMore] = useState(false);

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
        // headerShown: false
      }}
      sceneContainerStyle={{
        backgroundColor: theme.color.white,
      }}
    >
      <Tabs.Screen
        name="Feed"
        component={Feed}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Feed', { refresh: true });
          },
        })}
        options={{
          headerShown: false,
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
          headerShown: false,
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
          headerShown: false,
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
            setOpenMore(false);
            navigation.navigate('Mypage', { id: myId, refresh: true });
          },
        })}
        options={{
          header: ({ route: { params }, navigation }) => (
            <>
              <StatusBarPlaceHolder />
              <Header
                //@ts-ignore
                title={params?.id === myId ? "마이페이지" : "회원 프로필"}
                bgColor={theme.color.white}
                viewStyle={{
                  marginTop: 0,
                }}
                headerLeft={
                  //@ts-ignore
                  (params?.id === myId || !params?.id) ? undefined :
                    <LeftArrowIcon onBackClick={() => {
                      navigation.goBack();
                    }}
                      imageStyle={{ width: d2p(11), height: d2p(25) }} />}
                headerRight={
                  //@ts-ignore
                  (params?.id === myId || !params?.id) ?
                    <Image source={more} style={{ width: d2p(26), height: h2p(16) }} />
                    :
                    undefined
                }
                headerRightPress={() => {
                  setOpenMore(!openMore);
                  navigation.setParams({ openMore });
                }}
              />
              {
                //@ts-ignore
                (openMore && params?.id === myId) &&
                <MypageHeader setOpenMore={(isOpen: boolean) => setOpenMore(isOpen)} />
              }
            </>
          ),
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