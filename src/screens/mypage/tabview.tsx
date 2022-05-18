import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { TabBar, TabView } from 'react-native-tab-view';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';

const MypageTabView = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "write", title: "작성 글" },
    { key: "bookmark", title: "담은 글" }
  ]);

  return (
    <TabView
      onIndexChange={setIndex}
      navigationState={{ index, routes }}
      renderScene={({ route }) => {
        switch (route.key) {
          case "write":
            return (
              <View style={styles.container}>
                <Text>write</Text>
              </View>
            );
          case "bookmark":
            return (
              <View style={styles.container}>
                <Text>bookmark</Text>
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

export default MypageTabView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: d2p(10),
    paddingVertical: h2p(20),
    backgroundColor: theme.color.grayscale.f7f7fc
  }
});