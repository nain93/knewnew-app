import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import FeedReview from '~/components/review/feedReview';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { ReviewListType } from '~/types/review';

interface BookmarksType {
  setBookmarkHeight: (height: number) => void
  bookmarks: ReviewListType[]
}


const Bookmarks = ({ bookmarks, setBookmarkHeight }: BookmarksType) => {
  const navigation = useNavigation<StackNavigationProp>();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <View
      onLayout={e => {
        if (e.nativeEvent.layout) {
          const height = e.nativeEvent.layout.height;
          console.log(height, 'height');
          if (height) {
            setBookmarkHeight(height + h2p(100));
          }
        }
      }}
      style={{ paddingBottom: h2p(100) }}>
      {React.Children.toArray(bookmarks.map((bookmark, bookmarkIdx) =>
        <Pressable
          onPress={() => navigation.navigate("FeedDetail",
            { id: bookmark.id, isLike: bookmark.isLike })}
          style={styles.review}
        >
          <FeedReview
            clickBoxStyle={{ right: d2p(26), top: h2p(-10) }}
            idx={bookmarkIdx}
            selectedIndex={selectedIndex}
            setSelectedIndex={(selectIdx: number) => setSelectedIndex(selectIdx)}
            review={bookmark} />
        </Pressable>
      ))}
    </View>
  );
};

export default React.memo(Bookmarks);

const styles = StyleSheet.create({
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    borderRadius: 10,
    marginHorizontal: d2p(10), marginTop: h2p(15),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15)
  },
});