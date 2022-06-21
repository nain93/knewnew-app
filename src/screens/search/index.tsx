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
import { useInfiniteQuery } from 'react-query';
import { ReviewListType } from '~/types/review';
import { getSearchList } from '~/api/search';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import { getSearchUserList } from '~/api/user';
import { userNormalType } from '~/types/user';
import { FONT } from '~/styles/fonts';

type SearchProps = {
  navigation: StackNavigationProp<any>
  route: NavigationRoute;
}

const Search = ({ navigation }: SearchProps) => {
  const [textForRefresh, setTextForRefresh] = useState(""); // * 검색 할때마다 query 리프레시용
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchWords, setSearchWords] = useState("");
  const [recentKeywords, setRecentKeyWords] = useState<Array<string>>([]);

  const token = useRecoilValue(tokenState);

  const searchListQuery = useInfiniteQuery<ReviewListType[], Error>(["searchList", token, textForRefresh], async ({ pageParam = 0 }) => {
    const queryData = await getSearchList({ token, keyword, offset: pageParam });
    return queryData;
  }, {
    enabled: !!textForRefresh,
    getNextPageParam: (next, all) => all.flat().length,
    getPreviousPageParam: (prev) => (prev.length - 20) ?? undefined,
  });

  const userListQuery = useInfiniteQuery<userNormalType[], Error>(["userList", token, textForRefresh], async ({ pageParam = 0 }) => {
    const queryData = await getSearchUserList({ token, nickname: keyword, offset: pageParam });
    return queryData;
  }, {
    enabled: !!textForRefresh,
    getNextPageParam: (next, all) => all.flat().length,
    getPreviousPageParam: (prev) => (prev.length - 20) ?? undefined,
  });

  const handleSearch = async (searchKeyword: string) => {
    if (searchKeyword === "") {
      return;
    }
    setSearchWords(searchKeyword);
    // * 최근검색어 중복일시 리스트에 넣지않음
    if (!recentKeywords.every(v => v !== searchKeyword)) {
    }

    // * 최근검색어 갯수제한 10개, 10개 넘어가면 밀어내면서 10개 유지
    else if (recentKeywords.length === 10) {
      setRecentKeyWords([searchKeyword, ...recentKeywords].slice(0, recentKeywords.length));
      AsyncStorage.setItem("recentKeyword", JSON.stringify([searchKeyword, ...recentKeywords].slice(0, recentKeywords.length)));
    }
    else {
      setRecentKeyWords([searchKeyword, ...recentKeywords]);
      AsyncStorage.setItem("recentKeyword", JSON.stringify([searchKeyword, ...recentKeywords]));
    }
    setTextForRefresh(searchKeyword);
    setIsSearchMode(true);
  };

  // * 최근검색어 삭제
  const filterRecentKeyword = (filterIndex: number) => {
    AsyncStorage.setItem("recentKeyword", JSON.stringify(recentKeywords.filter((text, keywordIndex) => keywordIndex !== filterIndex)));
    setRecentKeyWords(recentKeywords.filter((text, keywordIndex) => keywordIndex !== filterIndex));
  };

  const handleBackClick = () => {
    if (isSearchMode) {
      setKeyword("");
      setIsSearchMode(false);
    }
    else {
      navigation.goBack();
    }
  };

  // * 검색모드 초기화
  // useFocusEffect(
  //   useCallback(() => {
  //     setIsSearchMode(false);
  //   }, []));

  // * 최근 검색어 asyn스토리지에서 가져오기
  useEffect(() => {
    const getRecentKeyWords = async () => {
      const localKeyword = await AsyncStorage.getItem("recentKeyword") || "[]";
      setRecentKeyWords(JSON.parse(localKeyword));
    };
    getRecentKeyWords();
  }, []);

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon onBackClick={handleBackClick} imageStyle={{ width: 11, height: 25 }} />}
        customRight={
          <View style={{
            position: "relative",
            width: Dimensions.get("window").width - d2p(70),
            borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
            borderRadius: 15, height: h2p(30),
            marginLeft: d2p(20),
          }}>
            <TextInput
              autoFocus
              onFocus={() => setIsSearchMode(false)}
              autoCapitalize="none"
              style={[{
                color: theme.color.black,
                paddingLeft: d2p(10), paddingRight: d2p(40), paddingVertical: d2p(6),
                includeFontPadding: false, fontSize: 14,
              }, FONT.Regular]}
              value={keyword}
              onChangeText={(text) => setKeyword(text)}
              onSubmitEditing={() => handleSearch(keyword)}
              placeholderTextColor={theme.color.grayscale.d3d0d5}
              placeholder="검색어를 입력하세요" />
            <TouchableOpacity
              onPress={() => handleSearch(keyword)}
              style={{ position: "absolute", right: d2p(10), top: d2p(6), }}>
              <Image source={isSearchMode ? mainSearchIcon : searchIcon}
                style={{ width: d2p(16), height: d2p(16) }} />
            </TouchableOpacity>
          </View>
        }
      />
      {isSearchMode ?
        <SearchTabView
          reviewNext={() => {
            if (searchListQuery.data &&
              searchListQuery.data.pages.flat().length > 19) {
              searchListQuery.fetchNextPage();
            }
          }}
          userNext={() => {
            if (userListQuery.data &&
              userListQuery.data.pages.flat().length > 19) {
              userListQuery.fetchNextPage();
            }
          }}
          keyword={searchWords}
          userList={userListQuery.data?.pages.flat()}
          searchList={searchListQuery.data?.pages.flat()} />
        :
        <View style={styles.container}>
          <Text style={[{ fontSize: 12, color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>최근 검색어</Text>
          <ScrollView style={{ marginTop: h2p(15) }}>
            {React.Children.toArray(recentKeywords.map((recentKeyword, filterIndex) =>
              <View style={styles.recentKeyword}>
                <TouchableOpacity
                  onPress={() => {
                    setKeyword(recentKeyword);
                    handleSearch(recentKeyword);
                  }}
                  style={{ width: Dimensions.get("window").width - d2p(70) }}>
                  <Text style={[{ fontSize: 16 }, FONT.Regular]}>{recentKeyword}</Text>
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