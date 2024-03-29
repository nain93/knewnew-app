import { Image, Platform, Pressable, View } from 'react-native';
import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import Onboarding from '~/screens/onboarding';
import WriteProfile from '~/screens/onboarding/writeProfile';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import TabNavigator from '~/navigators/tabNav';
import { d2p } from '~/utils';
import EditProfile from '~/screens/mypage/editProfile';
import theme from '~/styles/theme';
import FeedDetail from '~/screens/feed/detail';
import Report from '~/screens/report';
import EmailLogin from '~/screens/onboarding/email/emailLogin';
import EmailSignup from '~/screens/onboarding/email/emailSignup';
import Setting from '~/screens/setting';
import Privacy from '~/screens/setting/term/privacy';
import Term from '~/screens/setting/term/term';
import TermScreen from '~/screens/setting/term';
import OpenSource from '~/screens/setting/openSource';
import Write from '~/screens/write';
import EditBeforeWrite from '~/screens/write/editBeforeWrite';
import ProductDetail from '~/screens/feed/productDetail';
import ProductList from '~/screens/feed/productList';
import BlockList from '~/screens/setting/blockList';
import ProductDetailReady from '~/screens/feed/productDetailReady';
import Welcome from '~/screens/onboarding/welcome';
import UserPage from '~/screens/userPage';
import Header from '~/components/header';
import { lightHomeIcon } from '~/assets/icons';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { hitslop } from '~/utils/constant';
import CommentAll from '~/screens/feed/comment/commentAll';
import EventPage from '~/screens/event';

const Stack = createStackNavigator();

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

const EmptyScreen = () => (
  <View />
);

const GlobalNav = ({ token, versionCheckModal }: { token: string, versionCheckModal: boolean }) => {

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
              name="emailLogin"
              component={EmailLogin}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen
              name="emailSignup"
              component={EmailSignup}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen
              name="WriteProfile"
              options={{
                headerShown: false
              }}
              component={WriteProfile} />
          </>
        }
        {versionCheckModal ?
          <Stack.Screen
            name="Empty"
            component={EmptyScreen}
            options={{
              headerShown: false
            }}
          />
          :
          <Stack.Screen
            name="TabNav"
            component={TabNavigator}
            options={{
              headerShown: false
            }}
          />
        }
        <Stack.Screen
          name="EventPage"
          options={{
            headerShown: false
          }}
          component={EventPage}
        />
        <Stack.Screen
          name="TagResult"
          options={{
            headerShown: false
          }}
          component={TagResult} />
        <Stack.Screen
          name="Welcome"
          options={{
            headerShown: false
          }}
          component={Welcome} />
        <Stack.Screen
          name="TagSelect"
          options={{
            headerShown: false
          }}
          component={TagSelect} />
        <Stack.Screen
          name="Write"
          options={{
            title: "",
            headerShown: false,
          }}
          component={Write} />
        <Stack.Screen
          name="UserPage"
          options={{
            title: "",
            header: ({ navigation }) => (
              <>
                <StatusBarPlaceHolder />
                <Header
                  title={"회원 프로필"}
                  bgColor={theme.color.white}
                  viewStyle={{
                  }}
                  headerLeft={
                    <LeftArrowIcon onBackClick={() => {
                      navigation.goBack();
                    }}
                      imageStyle={{ width: d2p(11), height: d2p(25) }} />}

                  headerRight={
                    <Pressable hitSlop={hitslop}
                      onPress={() => navigation.navigate("Home")}
                    >
                      <Image source={lightHomeIcon} style={{ width: d2p(24), height: d2p(24) }} />

                    </Pressable>}
                  headerRightPress={() => navigation.navigate("setting")}
                />
              </>
            ),
          }}
          component={UserPage} />
        <Stack.Screen
          name="FeedDetail"
          options={{
            title: "",
            headerShown: false
          }}
          component={FeedDetail} />
        <Stack.Screen
          name="CommentAll"
          options={{
            title: "",
            headerShown: false
          }}
          component={CommentAll}
        />
        <Stack.Screen
          name="ProductDetail"
          options={{
            title: "",
            headerShown: false,
          }}
          component={ProductDetail} />
        <Stack.Screen
          name="ProductDetailReady"
          options={{
            title: "",
            headerShown: false,
          }}
          component={ProductDetailReady} />
        <Stack.Screen
          name="ProductList"
          options={{
            title: "",
            headerShown: false,
          }}
          component={ProductList} />
        <Stack.Screen
          name="editProfile"
          component={EditProfile}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="EditBeforeWrite"
          component={EditBeforeWrite}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="report"
          component={Report}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="setting"
          component={Setting}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="openSource"
          component={OpenSource}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="BlockList"
          component={BlockList}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="termScreen"
          component={TermScreen}
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
      </Stack.Navigator>
    </>
  );
};

export default GlobalNav;