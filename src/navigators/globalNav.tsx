import { Platform } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import Onboarding from '~/screens/onboarding';
import TagSelect from '~/screens/onboarding/tagSelect';
import BadgeSelect from '~/screens/onboarding/badgeSelect';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import Welcome from '~/screens/onboarding/welcome';
import CloseIcon from '~/components/icon/closeIcon';
import TabNavigator from '~/navigators/tabNav';
import { d2p } from '~/utils';
import EditProfile from '~/screens/mypage/editProfile';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import theme from '~/styles/theme';
import FeedDetail from '~/screens/feed/detail';

const Stack = createStackNavigator();

const GlobalNav = () => {
  const isLogin = useRecoilValue(tokenState);

  return (
    <>
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
        {!isLogin &&
          <>
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
          </>
        }
        <Stack.Screen
          name="TabNav"
          component={TabNavigator}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FeedDetail"
          options={{
            title: "",
            headerShown: false,
          }}
          component={FeedDetail} />
        <Stack.Screen
          name="editProfile"
          component={EditProfile}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Welcome"
          options={{
            title: "",
            headerLeft: () => <CloseIcon onPress={() => console.log("close")} />,
            headerLeftContainerStyle: { paddingLeft: d2p(20) },
            headerShadowVisible: false,
          }}
          component={Welcome} />
      </Stack.Navigator>
    </>
  );
};

export default GlobalNav;