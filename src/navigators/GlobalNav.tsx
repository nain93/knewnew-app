import { Platform } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Onboarding from '~/screens/onboarding';

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
					}}
					component={Onboarding}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default GlobalNav;
