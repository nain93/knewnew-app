import { Platform } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Onboarding from '~/screens/onboarding';
import TagSelect from '~/screens/onboarding/tagSelect';
import BadgeSelect from '~/screens/onboarding/badgeSelect';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import Welcome from '~/screens/onboarding/welcome';
import CloseIcon from '~/components/icon/closeIcon';
import TabNavigator from '~/navigators/tabNav';
import { d2p } from '~/utils';
import EditProfile from '~/screens/mypage/editProfile';

const TransitionScreenOptions = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
};
const Stack = createStackNavigator();

const GlobalNav = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={Object.assign(
          {},
          Platform.OS === "android" && TransitionScreenOptions,
          { cardStyle: { backgroundColor: "white" } }
        )}>
        <Stack.Screen
          name="OnBoarding"
          options={{
            title: "",
            headerShown: false
          }}
          component={Onboarding}
        />
        <Stack.Screen
          name="TagSelect"
          options={{
            title: "",
            headerLeft: () => <LeftArrowIcon />,
            headerLeftContainerStyle: { paddingLeft: d2p(20) },
            headerShadowVisible: false,
          }}
          component={TagSelect} />
        <Stack.Screen
          name="BadgeSelect"
          options={{
            title: "",
            headerLeft: () => <LeftArrowIcon />,
            headerLeftContainerStyle: { paddingLeft: d2p(20) },
            headerShadowVisible: false,
          }}
          component={BadgeSelect} />
        <Stack.Screen
          name="Welcome"
          options={{
            title: "",
            headerLeft: () => <CloseIcon onPress={() => console.log("close")} />,
            headerLeftContainerStyle: { paddingLeft: d2p(20) },
            headerShadowVisible: false,
          }}
          component={Welcome} />
        <Stack.Screen
          name="TabNav"
          component={TabNavigator}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="editProfile"
          component={EditProfile}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default GlobalNav;