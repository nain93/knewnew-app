import { StyleSheet, Text } from 'react-native';
import React, { useState } from 'react';
import { TabBar, TabView } from 'react-native-tab-view';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';

const SearchTabView = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "menu", title: "메뉴" },
    { key: "user", title: "회원" }
  ]);

  return (
    <TabView
      onIndexChange={setIndex}
      navigationState={{ index, routes }}
      renderScene={({ route }) => {
        switch (route.key) {
          case "menu":
            return <Text>menu</Text>;
          case "user":
            return <Text>user</Text>;
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
          renderLabel={({ route }) =>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{route.title}</Text>}
        />}
    />
  );
};

export default SearchTabView;

const styles = StyleSheet.create({});