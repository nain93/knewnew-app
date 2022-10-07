import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Platform, Pressable, Linking } from 'react-native';
import React, { useCallback, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import SearchTabView from '~/screens/search/tabView';
import { searchIcon } from '~/assets/icons';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';

import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationRoute } from 'react-navigation';
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
  const [reviewCount, setReviewCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const token = useRecoilValue(tokenState);

  const searchListQuery = useInfiniteQuery<ReviewListType[], Error>(["searchList", token, textForRefresh], async ({ pageParam = 0 }) => {
    const queryData: { result: ReviewListType[], totalLength: number } = await getSearchList({ token, keyword, offset: pageParam, limit: 5 });
    setReviewCount(queryData.totalLength);
    return queryData.result;
  }, {
    enabled: !!textForRefresh,
    getNextPageParam: (next, all) => all.flat().length
  });

  const userListQuery = useInfiniteQuery<userNormalType[], Error>(["userList", token, textForRefresh], async ({ pageParam = 0 }) => {
    const queryData: { result: userNormalType[], totalLength: number } = await getSearchUserList({ token, nickname: keyword, offset: pageParam });
    setUserCount(queryData.totalLength);
    return queryData.result;
  }, {
    enabled: !!textForRefresh,
    getNextPageParam: (next, all) => all.flat().length
  });

  const handleSearch = async (searchKeyword: string) => {
    if (searchKeyword === "") {
      return;
    }
    setSearchWords(searchKeyword);
    setTextForRefresh(searchKeyword);
    setIsSearchMode(true);
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

  const reviewNext = useCallback(() => {
    if (searchListQuery.data &&
      searchListQuery.data.pages.flat().length > 4) {
      searchListQuery.fetchNextPage();
    }
  }, [searchListQuery]);

  return (
    <>
      <Header
        type="search"
        isBorder={false}
        headerLeft={<LeftArrowIcon onBackClick={handleBackClick} />}
        customRight={
          <View style={{
            position: "relative",
            width: Dimensions.get("window").width - d2p(78),
            borderWidth: 1, borderColor: theme.color.grayscale.eae7ec,
            height: h2p(36),
            borderRadius: 20,
            marginTop: h2p(20),
          }}>
            <TextInput
              autoFocus
              onFocus={() => setIsSearchMode(false)}
              autoCapitalize="none"
              style={[{
                color: theme.color.black,
                paddingLeft: d2p(15), paddingRight: d2p(40),
                includeFontPadding: false, fontSize: 14,
              },
              Platform.OS === "ios" ? { paddingVertical: h2p(11) } : null,
              FONT.Regular]}
              value={keyword}
              onChangeText={(text) => setKeyword(text)}
              onSubmitEditing={() => handleSearch(keyword)}
              placeholderTextColor={theme.color.grayscale.d3d0d5}
              placeholder="검색어를 입력하세요" />
            <TouchableOpacity
              onPress={() => handleSearch(keyword)}
              style={{ position: "absolute", right: d2p(15), top: Platform.OS === "ios" ? h2p(11) : h2p(11), }}>
              <Image source={searchIcon}
                style={{ width: d2p(12), height: d2p(12) }} />
            </TouchableOpacity>
          </View>
        }
      />
      {isSearchMode ?
        <SearchTabView
          reviewNext={reviewNext}
          userNext={() => {
            if (userListQuery.data &&
              userListQuery.data.pages.flat().length > 19) {
              userListQuery.fetchNextPage();
            }
          }}
          keyword={searchWords}
          userList={userListQuery.data?.pages.flat()}
          searchList={searchListQuery.data?.pages.flat()}
          reviewCount={reviewCount}
          userCount={userCount}
        />
        :
        <View style={styles.container}>
          <Text style={[{
            marginLeft: d2p(20),
            marginTop: h2p(12),
            fontSize: 12, color: theme.color.grayscale.C_9F9CA3
          }, FONT.Regular]}>🔥 인기검색어</Text>
          <View style={{ marginLeft: d2p(20), marginTop: h2p(5), flexDirection: "row", flexWrap: "wrap" }}>
            {React.Children.toArray(["떡볶이", "마라탕", "비건빵", "밀키트"].map((v, i) => (
              <View style={{
                width: (Dimensions.get("window").width - d2p(45)) / 2,
                backgroundColor: theme.color.grayscale.f7f7fc,
                paddingHorizontal: d2p(10),
                paddingVertical: h2p(8),
                borderRadius: 5,
                marginRight: d2p(5),
                marginTop: h2p(5)
              }}>
                <Text style={FONT.Regular}>{v}</Text>
              </View>
            )))}
          </View>
          <Text style={[FONT.Regular, {
            fontSize: 12,
            color: theme.color.grayscale.C_9F9CA3,
            marginTop: h2p(60),
            marginLeft: d2p(20),
            marginBottom: h2p(10)
          }]}>
            📢 추천템 모아보기
          </Text>
          <Pressable
            onPress={() => {
              // todo banner 링크걸기
              // if (getBannerQuery.data?.link) {
              //   Linking.openURL(getBannerQuery.data?.link);
              // }
            }}
            style={styles.banner} />
          <Pressable
            onPress={() => {
              // if (getBannerQuery.data?.link) {
              //   Linking.openURL(getBannerQuery.data?.link);
              // }
            }}
            style={styles.banner} />
        </View>
      }
    </>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    paddingVertical: d2p(20),
  },
  recentKeyword: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: h2p(10)
  },
  banner: {
    width: Dimensions.get("window").width,
    height: h2p(130),
    marginBottom: h2p(2),
    backgroundColor: "red"
  }
});