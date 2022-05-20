import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { MyPrfoileType } from '~/types/user';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import FeedReview from '~/components/review/feedReview';
import { FONT } from '~/styles/fonts';
import { ReviewListType } from '~/types/review';
import { longPressHandlerName } from 'react-native-gesture-handler/lib/typescript/handlers/LongPressGestureHandler';
import Reviews from '~/screens/mypage/reviews';
import Bookmarks from '~/screens/mypage/bookmarks';

interface MypageProps {
  reviews: ReviewListType[],
  bookmarks: ReviewListType[]
  initialIndex?: number
}

const MypageTabView = ({ reviews = [], bookmarks = [], initialIndex = 0 }: MypageProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [index, setIndex] = React.useState(initialIndex ?? 0);
  const [routes] = useState([
    { key: "write", title: `작성 글 ${reviews.length}` },
    { key: "bookmark", title: `담은 글 ${bookmarks.length}` }
  ]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [reviewHeight, setReviewHeight] = useState(0);
  const [bookmarkHeight, setBookmarkHeight] = useState(0);

  const getDiaryTabHeight = (n: number): number => {
    const divNH = Math.floor(n / 6) * d2p(654);
    switch (n % 6) {
      case 1:
        return divNH + d2p(165);
      case 2:
        return divNH + d2p(345);
      case 3:
        return divNH + d2p(345);
      case 4:
        return divNH + d2p(525);
      case 5:
        return divNH + d2p(785);
      case 0:
        return divNH;
      default:
        return 0;
    }
  };

  return (
    <TabView
      swipeEnabled
      style={[styles.container, { height: index === 0 ? reviewHeight : bookmarkHeight }]}
      onIndexChange={setIndex}
      navigationState={{ index, routes }}
      renderScene={({ route }) => {
        switch (route.key) {
          case "write":
            return (
              <Reviews setReviewHeight={(height: number) => setReviewHeight(height)}
                reviews={reviews} />
            );
          case "bookmark":
            return (
              <Bookmarks setBookmarkHeight={(height: number) => setBookmarkHeight(height)}
                bookmarks={bookmarks} />
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
            <Text style={[{
              fontSize: 16,
              color: focused ? theme.color.black : theme.color.grayscale.C_79737e
            }, focused ? FONT.Bold : FONT.Regular]}>{route.title}</Text>
          }
        />}
    />
  );
};

export default MypageTabView;

const styles = StyleSheet.create({
  container: {
    paddingBottom: h2p(20),
    paddingTop: h2p(5),
    backgroundColor: theme.color.grayscale.f7f7fc
  },
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    borderRadius: 10,
    marginHorizontal: d2p(10), marginTop: h2p(15),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15)
  },
});