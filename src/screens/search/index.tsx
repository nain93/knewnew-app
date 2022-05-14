import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import CloseIcon from '~/components/icon/closeIcon';
import SearchTabView from '~/screens/search/tabView';
import { mainSearchIcon, searchIcon } from '~/assets/icons';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';

import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationRoute } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SearchProps = {
  navigation: StackNavigationProp<any>
  route: NavigationRoute;
}

const Search = ({ navigation }: SearchProps) => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [recentKeywords, setRecentKeyWords] = useState<Array<string>>([]);

  const handleSearch = async () => {
    const recentKeyword = await AsyncStorage.getItem("recentKeyword") || "[]";
    AsyncStorage.setItem("recentKeyword", JSON.stringify((JSON.parse(recentKeyword)).concat(keyword)));
    setRecentKeyWords((JSON.parse(recentKeyword)).concat(keyword));
    setIsSearchMode(true);
  };

  const filterRecentKeyword = (filterIndex: number) => {
    AsyncStorage.setItem("recentKeyword", JSON.stringify(recentKeywords.filter((text, keywordIndex) => keywordIndex !== filterIndex)));
    setRecentKeyWords(recentKeywords.filter((text, keywordIndex) => keywordIndex !== filterIndex));
  };

  const handleBackClick = () => {
    if (isSearchMode) {
      setIsSearchMode(false);
    }
    else {
      navigation.goBack();
    }
  };

  // * 검색모드 초기화
  useFocusEffect(
    useCallback(() => {
      setIsSearchMode(false);
    }, []));

  // * 최근 검색어 asyn스토리지에서 가져오기
  useEffect(() => {
    const getRecentKeyWords = async () => {
      const recentKeyword = await AsyncStorage.getItem("recentKeyword") || "[]";
      setRecentKeyWords(JSON.parse(recentKeyword));
    };
    getRecentKeyWords();
  }, []);

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
              autoCapitalize="none"
              style={{
                paddingLeft: d2p(10), paddingRight: d2p(40), paddingVertical: d2p(6),
                includeFontPadding: false, fontSize: 14
              }}
              value={keyword}
              onChangeText={(text) => setKeyword(text)}
              onSubmitEditing={handleSearch}
              placeholderTextColor={theme.color.grayscale.d3d0d5}
              placeholder="검색어를 입력하세요" />
            <TouchableOpacity
              onPress={handleSearch}
              style={{ position: "absolute", right: d2p(10), top: d2p(6), }}>
              <Image source={isSearchMode ? mainSearchIcon : searchIcon}
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
          <ScrollView style={{ marginTop: h2p(15) }}>
            {React.Children.toArray(recentKeywords.map((recentKeyword, filterIndex) =>
              <View style={styles.recentKeyword}>
                <TouchableOpacity
                  onPress={() => console.log("keyword")}
                  style={{ width: Dimensions.get("window").width - d2p(70) }}>
                  <Text style={{ fontSize: 16 }}>{recentKeyword}</Text>
                </TouchableOpacity>
                <CloseIcon onPress={() => filterRecentKeyword(filterIndex)} imageStyle={{ width: 10, height: 10 }} />
              </View>
            ))}
          </ScrollView>
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