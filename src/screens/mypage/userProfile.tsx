import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import theme from '~/styles/theme';
import Header from '~/components/header';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import { d2p, h2p } from '~/utils';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import FeedReview from '~/components/review/feedReview';
import { useQuery } from 'react-query';
import { MyPrfoileType } from '~/types/user';
import { getUserProfile } from '~/api/user';
import { FONT } from '~/styles/fonts';
import { noProfile } from '~/assets/images';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';

interface UserProfileProps {
  navigation: NavigationStackProp
  route: NavigationRoute<{
    id: number,
  }>;
}

const UserProfile = ({ navigation, route }: UserProfileProps) => {
  const token = useRecoilValue(tokenState);
  const getUserProfileQuery = useQuery<MyPrfoileType, Error>(["userProfile", token, route.params?.id], async () => {
    if (route.params) {
      const queryData = await getUserProfile(token, route.params?.id);
      return queryData;
    }
  }
    , { enabled: !!token });

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <>
      <View
        onLayout={e => {
          if (e.nativeEvent.layout) {
            const height = e.nativeEvent.layout.height;
            if (height) {
              setHeaderHeight(height);
            }
          }
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 999,
          width: Dimensions.get("window").width
        }}>
        {isIphoneX() &&
          <View style={{
            width: "100%",
            height: getStatusBarHeight(),
            backgroundColor: theme.color.white,
          }} />}
        <Header
          title="회원 프로필"
          isBorder={true}
          headerLeft={<LeftArrowIcon onBackClick={() => {
            navigation.goBack();
          }} imageStyle={{ width: 11, height: 25 }} />}
          bgColor={theme.color.white}
          viewStyle={{
            marginTop: 0,
          }}
        />
      </View>
      <Tabs.Container
        containerStyle={styles.container}
        headerContainerStyle={{ marginTop: headerHeight }}
        renderTabBar={(props) => <MaterialTabBar
          contentContainerStyle={{ paddingBottom: h2p(4.5), paddingTop: h2p(20) }}
          indicatorStyle={{
            height: 2,
            backgroundColor: theme.color.black,
            marginBottom: d2p(-1),
          }} TabItemComponent={({ label, index }) => (
            <Pressable
              onPress={() => props.onTabPress(label)}
              style={{ width: Dimensions.get("window").width / 2 }}>
              <Text style={[{
                fontSize: 16,
                textAlign: "center"
              }, FONT.Bold]}>{label}
              </Text>
            </Pressable>
          )} {...props} />}
        renderHeader={() => (
          <View pointerEvents="none">
            <View style={styles.profileImage} >
              <Image style={{ width: d2p(60), height: d2p(60), borderRadius: 60 }}
                source={getUserProfileQuery.data?.profileImage ? { uri: getUserProfileQuery.data?.profileImage } : noProfile} />
            </View>
            <View style={styles.profileInfo}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", marginRight: d2p(10) }}>{getUserProfileQuery.data?.nickname}</Text>
                <View style={{
                  height: h2p(20), minWidth: d2p(55),
                  marginRight: d2p(5),
                  justifyContent: "center", alignItems: "center",
                  paddingHorizontal: d2p(10), paddingVertical: h2p(3),
                  borderRadius: 10, backgroundColor: theme.color.grayscale.f7f7fc, borderWidth: 1, borderColor: theme.color.grayscale.d2d0d5
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '500' }}>{getUserProfileQuery.data?.representBadge}</Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4 }}>{getUserProfileQuery.data?.household}</Text>
              </View>
              <View style={styles.occupation}>
                <Text style={{ fontWeight: "500" }}>{getUserProfileQuery.data?.occupation}</Text>
              </View>
              {React.Children.toArray(getUserProfileQuery.data?.tags.map(v =>
                <Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4 }}>#{v}</Text>
              ))}
            </View>
          </View>
        )}
      >
        <Tabs.Tab
          name={`작성 글 ${getUserProfileQuery.data?.reviews.length}`}>
          <Tabs.FlatList
            contentContainerStyle={{ paddingBottom: h2p(100), paddingTop: Platform.OS === "ios" ? h2p(90) : h2p(370) }}
            showsVerticalScrollIndicator={false}
            data={getUserProfileQuery.data?.reviews}
            renderItem={(review) => (
              <Pressable
                onPress={() => navigation.navigate("FeedDetail",
                  { id: review.item.id, isLike: review.item.isLike })}
                style={styles.review}
              >
                <FeedReview
                  clickBoxStyle={{ right: d2p(26), top: h2p(-10) }}
                  idx={review.index}
                  selectedIndex={selectedIndex}
                  setSelectedIndex={(selectIdx: number) => setSelectedIndex(selectIdx)}
                  review={review.item} />
              </Pressable>
            )}
            keyExtractor={(v) => String(v.id)}
          />
        </Tabs.Tab>
        <Tabs.Tab name={`담은 글 ${getUserProfileQuery.data?.bookmarks.length}`}>
          <Tabs.FlatList
            contentContainerStyle={{ paddingBottom: h2p(100), paddingTop: Platform.OS === "ios" ? h2p(90) : h2p(370) }}
            showsVerticalScrollIndicator={false}
            data={getUserProfileQuery.data?.bookmarks}
            renderItem={(bookmarks) => (
              <Pressable
                onPress={() => navigation.navigate("FeedDetail",
                  { id: bookmarks.item.id, isLike: bookmarks.item.isLike })}
                style={styles.review}
              >
                <FeedReview
                  clickBoxStyle={{ right: d2p(26), top: h2p(-10) }}
                  idx={bookmarks.index}
                  selectedIndex={selectedIndex}
                  setSelectedIndex={(selectIdx: number) => setSelectedIndex(selectIdx)}
                  review={bookmarks.item} />
              </Pressable>
            )}
            keyExtractor={(v) => String(v.id)}
          />
        </Tabs.Tab>
      </Tabs.Container>
    </>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    paddingBottom: h2p(20),
    paddingTop: h2p(5),
    backgroundColor: theme.color.grayscale.f7f7fc
  },

  profileImage: {
    width: d2p(60),
    height: d2p(60),
    borderRadius: 60,
    marginBottom: h2p(25),
    marginTop: h2p(30),
    borderWidth: 1,
    alignSelf: "center",
    borderColor: theme.color.grayscale.eae7ec
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: h2p(30)
  },
  occupation: {
    width: Dimensions.get("window").width - d2p(40),
    borderWidth: 1,
    minHeight: h2p(40),
    paddingVertical: h2p(10),
    paddingHorizontal: d2p(10),
    borderColor: theme.color.grayscale.ec6863,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    marginTop: h2p(20),
    marginBottom: h2p(15),
    justifyContent: "center",
    alignItems: "center"
  },
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    borderRadius: 10,
    marginHorizontal: d2p(10), marginTop: h2p(15),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15)
  }
});