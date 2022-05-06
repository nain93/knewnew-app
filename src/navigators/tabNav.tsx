import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from 'react';
import Feed from '~/screens/feed';
import Write from '~/screens/write/indes';
import Search from '~/screens/search';
import Mypage from '~/screens/mypage';
import theme from '~/styles/theme';

const Tabs = createBottomTabNavigator();

const TabNavigator = () => {
	return (
		<Tabs.Navigator
			sceneContainerStyle={{
				backgroundColor: theme.color.white,
			}}
		>
			<Tabs.Screen
				name="Feed"
				component={Feed}
			/>
			<Tabs.Screen
				name="Write"
				component={Write}
			/>
			<Tabs.Screen
				name="Search"
				component={Search}
			/>
			<Tabs.Screen
				name="Mypage"
				component={Mypage}
			/>
		</Tabs.Navigator>
	);
};

export default TabNavigator;

const styles = StyleSheet.create({});