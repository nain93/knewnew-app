import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import { TabBar, TabView } from 'react-native-tab-view';
import FastImage from 'react-native-fast-image';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { noProfile } from '~/assets/images';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { deleteMyFollower, getFollowerList, getFollowingList, userFollow } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import Loading from '~/components/loading';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { grayKnewnew } from '~/assets/icons';
import BasicButton from '~/components/button/basicButton';

interface FollowBottomTabProps {
  id: number,
  followIndex: number
}

const FollowBottomTab = ({ id, followIndex }: FollowBottomTabProps) => {
  const token = useRecoilValue(tokenState);
  const navigation = useNavigation<StackNavigationProp>();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(followIndex);
  const [routes] = useState([
    { key: "following", title: "팔로잉" },
    { key: "follower", title: "팔로워" }
  ]);

  const getFollowingListQuery = useInfiniteQuery(["followingList", id], ({ pageParam = 0 }) => getFollowingList({
    token, id, offset: pageParam, limit: 10
  }));

  const getFollowerListQuery = useInfiniteQuery(["followerList", id], ({ pageParam = 0 }) => getFollowerList({
    token, id, offset: pageParam, limit: 10
  }));

  const followMutation = useMutation("userFollow", ({ userId, isFollow }: { userId: number, isFollow: boolean }) =>
    userFollow({ token, userId, isFollow }));

  const deleteMyFollowerMutation = useMutation("deleteMyFollower", ({ userId }: { userId: number }) =>
    deleteMyFollower({ token, userId }), {
    onSuccess: () => {
      queryClient.invalidateQueries("followerList");
    }
  });

  const followingKey = useCallback((follow) => String(follow.id), []);
  const followListEmpty = useCallback(() => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
      <Image source={grayKnewnew} style={{ width: d2p(60), height: d2p(60) }} />
      <Text style={[FONT.Regular, { fontSize: 16, marginTop: h2p(20), marginBottom: h2p(50) }]}>
        아직 팔로잉 중인 유저가 없어요!
      </Text>
      <BasicButton
        viewStyle={{ width: Dimensions.get("window").width - d2p(210), height: h2p(35) }}
        onPress={() => console.log("go Follow")}
        text="팔로우 하러가기" bgColor={theme.color.white} textColor={theme.color.main} />
    </View>
  ), []);
  const followingRenderItem = useCallback((list) => (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <TouchableOpacity
        onPress={() => navigation.push("UserPage", { id: list.item.id })}
        style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{
          borderRadius: 40,
          overflow: "hidden",
          borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
        }}>
          <FastImage source={list.item.profileImage ? { uri: list.item.profileImage } : noProfile}
            style={{ width: d2p(40), height: d2p(40) }} />
        </View>
        <View style={{ marginLeft: d2p(8) }}>
          <Text style={FONT.Medium}>{list.item.nickname}</Text>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, fontSize: 10 }]}>
            {list.item.tags.foodStyle[0]} {list.item.tags.household[0]} {list.item.tags.occupation[0]}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={{
        backgroundColor: theme.color.grayscale.eae7ec,
        width: d2p(60), height: h2p(25), borderRadius: 12.5,
        justifyContent: "center", alignItems: "center"
      }}>
        <Text style={[FONT.Medium, { color: theme.color.grayscale.C_79737e }]}>
          팔로잉
        </Text>
      </TouchableOpacity>
    </View>
  ), []);

  const followerKey = useCallback((follow) => String(follow.id), []);
  const followerListEmpty = useCallback(() => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
      <Image source={grayKnewnew} style={{ width: d2p(60), height: d2p(60) }} />
      <Text style={[FONT.Regular, {
        lineHeight: 24,
        fontSize: 16, marginTop: h2p(20), marginBottom: h2p(50), textAlign: "center"
      }]}>
        {`추천템 공유하고 
유저들과 소통해보세요!`}
      </Text>
      <BasicButton
        viewStyle={{ width: Dimensions.get("window").width - d2p(210), height: h2p(35) }}
        onPress={() => console.log("go Follow")}
        text="추천템 알려주기" bgColor={theme.color.white} textColor={theme.color.main} />
    </View>
  ), []);
  const followerRenderItem = useCallback((list) => (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <TouchableOpacity
        onPress={() => navigation.push("UserPage", { id: list.item.id })}
        style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{
          borderRadius: 40,
          overflow: "hidden",
          borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
        }}>
          <FastImage source={list.item.profileImage ? { uri: list.item.profileImage } : noProfile}
            style={{ width: d2p(40), height: d2p(40) }} />
        </View>
        <View style={{ marginLeft: d2p(8) }}>
          <Text style={FONT.Medium}>{list.item.nickname}</Text>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, fontSize: 10 }]}>
            {list.item.tags.foodStyle[0]} {list.item.tags.household[0]} {list.item.tags.occupation[0]}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteMyFollowerMutation.mutate({ userId: list.item.id })}
        style={{
          backgroundColor: theme.color.grayscale.eae7ec,
          width: d2p(60), height: h2p(25), borderRadius: 12.5,
          justifyContent: "center", alignItems: "center"
        }}>
        <Text style={[FONT.Medium, { color: theme.color.grayscale.C_79737e }]}>
          삭제
        </Text>
      </TouchableOpacity>
    </View>
  ), []);

  return (
    <>
      {deleteMyFollowerMutation.isLoading &&
        <View style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.1)"
        }}>
          <Loading />
        </View>
      }
      <TabView
        onIndexChange={setIndex}
        navigationState={{ index, routes }}
        renderScene={({ route }) => {
          switch (route.key) {
            case "following":
              return (
                <FlatList
                  contentContainerStyle={{ flex: 1 }}
                  style={styles.container}
                  data={getFollowingListQuery.data?.pages.flat()}
                  renderItem={followingRenderItem}
                  ListEmptyComponent={followListEmpty}
                  keyExtractor={followingKey}
                  showsVerticalScrollIndicator={false}
                />
              );
            case "follower":
              return (
                <FlatList
                  contentContainerStyle={{ flex: 1 }}
                  style={styles.container}
                  data={getFollowerListQuery.data?.pages.flat()}
                  renderItem={followerRenderItem}
                  ListEmptyComponent={followerListEmpty}
                  keyExtractor={followerKey}
                  showsVerticalScrollIndicator={false}
                />
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
            (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[focused ? FONT.Bold : FONT.Regular, {
                  fontSize: 16,
                  color: focused ? theme.color.black : theme.color.grayscale.C_79737e,
                }]}>{route.title} </Text>
                <Text style={[focused ? FONT.Bold : FONT.Regular, {
                  fontSize: 16,
                  color: focused ? theme.color.black : theme.color.grayscale.C_79737e
                }]}>192</Text>
              </View>
            )
            }
          />}
      />
    </>
  );
};

export default FollowBottomTab;

const styles = StyleSheet.create({
  container: {
    paddingVertical: h2p(20),
    paddingHorizontal: d2p(15)
  }
});