import { Platform } from 'react-native';
import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import Onboarding from '~/screens/onboarding';
import TagSelect from '~/screens/onboarding/tagSelect';
import BadgeSelect from '~/screens/onboarding/badgeSelect';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import Welcome from '~/screens/onboarding/welcome';
import TabNavigator from '~/navigators/tabNav';
import { d2p } from '~/utils';
import EditProfile from '~/screens/mypage/editProfile';
import theme from '~/styles/theme';
import FeedDetail from '~/screens/feed/detail';
import Report from '~/screens/report';
import Term from '~/screens/setting';
import Privacy from '~/screens/setting/privacy';
import EmailLogin from '~/screens/onboarding/emailLogin';
import Notification from '~/screens/feed/notification';

const Stack = createStackNavigator();

const GlobalNav = ({ token }: { token: string }) => {
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
        {!token &&
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
            headerShown: false
          }}
          component={Welcome} />
        <Stack.Screen
          name="report"
          component={Report}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="term"
          component={Term}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="privacy"
          component={Privacy}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="emailLogin"
          component={EmailLogin}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="notification"
          component={Notification}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </>
  );
};

export default GlobalNav;