import { Platform } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Onboarding from '~/screens/onboarding';
import BadgeSelect from '~/screens/onboarding/badgeSelect';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';

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
					name="BadgeSelect"
					options={{
						title: "",
						headerLeft: () => <LeftArrowIcon />,
						headerShadowVisible: false,
					}}
					component={BadgeSelect} />
				<Stack.Screen
					name="OnBoarding"
					options={{
						title: "",
					}}
					component={Onboarding}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default GlobalNav;
