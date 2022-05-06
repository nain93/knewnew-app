import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import CloseIcon from '~/components/icon/closeIcon';
import SearchTabView from '~/screens/search/tabView';
import { colorSearchIcon, searchIcon } from '~/assets/icons';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';

import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationRoute } from 'react-navigation';

type SearchProps = {
	navigation: StackNavigationProp<any>
	route: NavigationRoute;
}

const Search = ({ navigation }: SearchProps) => {
	const [isSearchMode, setIsSearchMode] = useState(false);

	const handleSearch = () => {
		setIsSearchMode(true);
	};

	const handleBackClick = () => {
		if (isSearchMode) {
			setIsSearchMode(false);
		}
		else {
			navigation.goBack();
		}
	};

	useFocusEffect(
		useCallback(() => {
			setIsSearchMode(false);
		}, []));

	return (
		<>
			<Header
				headerLeft={<LeftArrowIcon onBackClick={handleBackClick} imageStyle={{ width: 11, height: 25 }} />}
				headerRight={
					<View style={{
						position: "relative",
						width: Dimensions.get("window").width - d2p(70),
						borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
						borderRadius: 15, height: h2p(30),
						marginLeft: d2p(20),
					}}>
						<TextInput
							autoFocus
							style={{
								paddingLeft: d2p(10), paddingRight: d2p(40), paddingVertical: d2p(6),
								includeFontPadding: false, fontSize: 14
							}}
							placeholderTextColor={theme.color.placeholder}
							placeholder="검색어를 입력하세요" />
						<TouchableOpacity
							onPress={handleSearch}
							style={{ position: "absolute", right: d2p(10), top: d2p(6), }}>
							<Image source={isSearchMode ? colorSearchIcon : searchIcon}
								style={{ width: d2p(16), height: d2p(16) }} />
						</TouchableOpacity>
					</View>
				}
			/>
			{isSearchMode ?
				<SearchTabView />
				:
				<View style={styles.container}>
					<Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4 }}>최근 검색어</Text>
					<View style={{ marginTop: h2p(15) }}>
						<View style={styles.recentKeyword}>
							<TouchableOpacity
								onPress={() => console.log("keyword")}
								style={{ width: Dimensions.get("window").width - d2p(70) }}>
								<Text style={{ fontSize: 16 }}>마라</Text>
							</TouchableOpacity>
							<TouchableOpacity hitSlop={{ top: d2p(20), left: d2p(20), right: d2p(20), bottom: d2p(20) }}
								onPress={() => console.log("close")}>
								<CloseIcon imageStyle={{ width: 10, height: 10 }} />
							</TouchableOpacity>
						</View>
						<View style={styles.recentKeyword}>
							<TouchableOpacity
								onPress={() => console.log("keyword")}
								style={{ width: Dimensions.get("window").width - d2p(70) }}>
								<Text style={{ fontSize: 16 }}>양송이 스프</Text>
							</TouchableOpacity>
							<TouchableOpacity hitSlop={{ top: d2p(20), left: d2p(20), right: d2p(20), bottom: d2p(20) }}
								onPress={() => console.log("close")}>
								<CloseIcon imageStyle={{ width: 10, height: 10 }} />
							</TouchableOpacity>
						</View>
						<View style={styles.recentKeyword}>
							<TouchableOpacity
								onPress={() => console.log("keyword")}
								style={{ width: Dimensions.get("window").width - d2p(70) }}>
								<Text style={{ fontSize: 16 }}>맛있는 디저트</Text>
							</TouchableOpacity>
							<TouchableOpacity hitSlop={{ top: d2p(20), left: d2p(20), right: d2p(20), bottom: d2p(20) }}
								onPress={() => console.log("close")}>
								<CloseIcon imageStyle={{ width: 10, height: 10 }} />
							</TouchableOpacity>
						</View>
					</View>
				</View>
			}
		</>
	);
};

export default Search;

const styles = StyleSheet.create({
	container: {
		padding: d2p(20),
	},
	recentKeyword: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginVertical: h2p(10)
	}
});