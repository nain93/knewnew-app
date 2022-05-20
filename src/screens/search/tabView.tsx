import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { TabBar, TabView } from 'react-native-tab-view';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { ReviewListType } from '~/types/review';
import FeedReview from '~/components/review/feedReview';
import { userNormalType } from '~/types/user';
import { noProfile } from '~/assets/images';
import { leftArrow } from '~/assets/icons';
import Loading from '~/components/loading';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';

interface SearchTabViewProps {
  searchList?: ReviewListType[],
  userList?: userNormalType[]
}

const SearchTabView = ({ searchList, userList }: SearchTabViewProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "menu", title: "메뉴" },
    { key: "user", title: "회원" }
  ]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

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
                <Text style={styles.searchResult}>검색결과 · {searchList.length}건</Text>
                <FlatList
                  style={{ marginBottom: h2p(80) }}
                  contentContainerStyle={{ paddingBottom: d2p(40) }}
                  keyExtractor={(review) => String(review.id)}
                  data={searchList}
                  ListEmptyComponent={() =>
                    <Text style={{ textAlign: "center", marginTop: h2p(115), color: theme.color.grayscale.C_79737e }}>
                      검색결과가 없습니다.</Text>}
                  renderItem={(review) => {
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
                          clickBoxStyle={{ right: d2p(26), top: h2p(-10) }}
                          idx={review.index}
                          selectedIndex={selectedIndex}
                          setSelectedIndex={(selectIdx: number) => setSelectedIndex(selectIdx)}
                          review={review.item} />
                      </Pressable>
                    );
                  }}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            );
          case "user":
            return (
              <View style={styles.container}>
                <Text style={[styles.searchResult, { marginBottom: h2p(30) }]}>검색결과 · {userList.length}건</Text>
                <FlatList
                  style={{ marginBottom: h2p(80) }}
                  contentContainerStyle={{ paddingBottom: d2p(40), paddingHorizontal: d2p(20) }}
                  keyExtractor={(review) => String(review.id)}
                  data={userList}
                  ListEmptyComponent={() =>
                    <Text style={{ textAlign: "center", marginTop: h2p(115), color: theme.color.grayscale.C_79737e }}>
                      검색결과가 없습니다.</Text>}
                  renderItem={(user) =>
                    <View style={{ marginBottom: h2p(30), flexDirection: "row", alignItems: "center" }}>
                      <Image source={user.item.profileImage ? { uri: user.item.profileImage } : noProfile}
                        style={{ marginRight: d2p(10), borderColor: theme.color.grayscale.e9e7ec, borderWidth: 1, width: d2p(24), height: d2p(24), borderRadius: 24 }} />
                      <Text style={{ fontSize: 16, width: Dimensions.get("window").width - d2p(84) }}>{user.item.nickname}</Text>
                      <Image source={leftArrow} style={{ marginLeft: "auto", width: d2p(11), height: h2p(25), transform: [{ rotate: "180deg" }] }} />
                    </View>
                  }
                  showsVerticalScrollIndicator={false}
                />
              </View>
            );
          default:
            return null;
        }
      }}
      renderTabBar={(p) =>
        <TabBar {...p}
          indicatorStyle={{
            height: 2,
            backgroundColor: theme.color.black,
            marginBottom: d2p(-1),
          }}
          style={{
            height: h2p(44.5),
            paddingTop: h2p(5),
            backgroundColor: theme.color.white,
            borderBottomColor: theme.color.grayscale.d3d0d5, borderBottomWidth: 1,
            elevation: 0
          }}
          renderLabel={({ route, focused }) =>
            <Text style={{
              fontSize: 16, fontWeight: focused ? "bold" : "normal",
              color: focused ? theme.color.black : theme.color.grayscale.C_79737e
            }}>{route.title}</Text>
          }
        />}
    />
  );
};

export default SearchTabView;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchResult: {
    marginTop: h2p(25),
    marginHorizontal: d2p(20),
    marginBottom: h2p(5),
    color: theme.color.grayscale.a09ca4,
    fontSize: 12
  }
});