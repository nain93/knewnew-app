import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { TabView } from 'react-native-tab-view';
//@ts-ignore
import Highlighter from 'react-native-highlight-words';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { ReviewListType } from '~/types/review';
import FeedReview from '~/components/review/feedReview';
import { userNormalType } from '~/types/user';
import { noProfile } from '~/assets/images';
import { blackRightSmallArrow, leftArrow, rightArrow } from '~/assets/icons';
import Loading from '~/components/loading';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { FONT } from '~/styles/fonts';
import FastImage from 'react-native-fast-image';
import { useRecoilValue } from 'recoil';
import { myIdState } from '~/recoil/atoms';
import TopScrollButton from '~/components/button/topScrollButton';

interface SearchTabViewProps {
  searchList?: ReviewListType[],
  userList?: userNormalType[],
  keyword: string,
  reviewNext: () => void,
  userNext: () => void,
  reviewCount: number,
  userCount: number
}

const SearchTabView = ({ reviewCount, userCount, searchList, userList, keyword, reviewNext, userNext }: SearchTabViewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "menu", title: "푸드로그" },
    { key: "user", title: "유저 닉네임" },
    // { key: "product", title: "상품명" }
  ]);

  const foodLogRef = useRef<FlatList>(null);
  const userRef = useRef<FlatList>(null);

  const menuKey = useCallback((review) => String(review.id), []);
  const menuRenderItem = useCallback((review) => {
    return (
      <Pressable onPress={() => navigation.navigate("FeedDetail",
        { id: review.item.id, isLike: review.item.isLike })}
        style={{
          marginHorizontal: d2p(20), marginTop: h2p(25),
          paddingBottom: h2p(14.5),
          borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc
        }}
      >
        <FeedReview
          keyword={keyword}
          review={review.item} />
      </Pressable>
    );
  }, [keyword]);

  const menuEmpty = useCallback(() =>
    <Text style={[{
      marginTop: h2p(25), marginLeft: d2p(20),
      color: theme.color.grayscale.C_79737e
    }, FONT.Regular]}>
      {`검색결과가 없습니다.\n다른 검색어로 다시 시도해주세요!`}
    </Text>, []);

  if (!searchList) {
    return <Loading />;
  }
  if (!userList) {
    return <Loading />;
  }

  return (
    <TabView
      onIndexChange={setIndex}
      navigationState={{ index, routes }}
      renderScene={({ route }) => {
        switch (route.key) {
          case "menu":
            return (
              <View style={styles.container}>
                <Text style={[styles.searchResult, FONT.Regular]}>검색결과 · {reviewCount}건</Text>
                <FlatList
                  ref={foodLogRef}
                  onEndReached={reviewNext}
                  onEndReachedThreshold={0.5}
                  maxToRenderPerBatch={5}
                  windowSize={5}
                  removeClippedSubviews={true}
                  style={{ marginBottom: h2p(80) }}
                  contentContainerStyle={{ paddingBottom: d2p(40) }}
                  keyExtractor={menuKey}
                  data={searchList}
                  ListEmptyComponent={menuEmpty}
                  renderItem={menuRenderItem}
                  showsVerticalScrollIndicator={false}
                />
                <TopScrollButton scrollRef={foodLogRef} />
              </View>
            );
          // case "product":
          //   return (
          //     <View>
          //       <Text>상품명</Text>
          //     </View>
          //   );
          case "user":
            return (
              <View style={styles.container}>
                <Text style={[styles.searchResult, FONT.Regular]}>검색결과 · {userCount}건</Text>
                <FlatList
                  ref={userRef}
                  onEndReached={userNext}
                  onEndReachedThreshold={0.5}
                  style={{ marginBottom: h2p(80), marginTop: h2p(20) }}
                  contentContainerStyle={{ paddingBottom: d2p(40), paddingHorizontal: d2p(20) }}
                  keyExtractor={(review) => String(review.id)}
                  data={userList}
                  ListEmptyComponent={() =>
                    <Text style={[{
                      color: theme.color.grayscale.C_79737e
                    }, FONT.Regular]}>
                      {`검색결과가 없습니다.\n다른 검색어로 다시 시도해주세요!`}
                    </Text>}
                  renderItem={(user) =>
                    <TouchableOpacity
                      onPress={() => navigation.push('UserPage', { id: user.item.id })}
                      style={{ marginBottom: h2p(15), flexDirection: "row", alignItems: "center" }}>
                      <View style={{
                        borderColor: theme.color.grayscale.e9e7ec, borderWidth: 1,
                        overflow: "hidden", borderRadius: 24, width: d2p(40), height: d2p(40), marginRight: d2p(10)
                      }}>
                        <FastImage resizeMode="cover" source={user.item.profileImage ? { uri: user.item.profileImage } : noProfile}
                          style={{ width: d2p(40), height: d2p(40) }} />
                      </View>
                      <View style={{ flexDirection: "row", width: Dimensions.get("window").width - d2p(84) }}>
                        <Highlighter
                          highlightStyle={[FONT.Medium, { fontSize: 16, color: theme.color.main }]}
                          searchWords={[keyword]}
                          textToHighlight={user.item.nickname}
                          style={[FONT.Medium, { fontSize: 16 }]}
                        />
                      </View>
                      <Image source={blackRightSmallArrow} style={{ marginLeft: "auto", width: d2p(16), height: d2p(16) }} />
                    </TouchableOpacity>
                  }
                  showsVerticalScrollIndicator={false}
                />
                <TopScrollButton scrollRef={userRef} />
              </View>
            );
          default:
            return null;
        }
      }}
      renderTabBar={(p) =>
      (
        <View style={{
          flexDirection: "row", marginTop: h2p(20), paddingHorizontal: d2p(20),
          paddingBottom: h2p(10),
          borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.e9e7ec
        }}>
          {React.Children.toArray(routes.map((v, i) => (
            <TouchableOpacity
              onPress={() => setIndex(i)}
              style={{
                width: (Dimensions.get("window").width - d2p(45)) / 2,
                borderWidth: 1, borderRadius: 30, paddingVertical: h2p(6),
                marginRight: i % 2 === 0 ? d2p(5) : 0,
                backgroundColor: index === i ? theme.color.black : theme.color.white,
              }}>
              <Text style={[FONT.Medium, {
                color: index === i ? theme.color.white : theme.color.black,
                textAlign: "center"
              }]}>{v.title}</Text>
            </TouchableOpacity>
          )))}
        </View>
      )
      }
    />
  );
};

export default SearchTabView;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchResult: {
    marginTop: h2p(20),
    marginHorizontal: d2p(20),
    color: theme.color.grayscale.a09ca4,
    fontSize: 12
  }
});