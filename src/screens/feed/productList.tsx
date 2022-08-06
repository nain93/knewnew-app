import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import FeedReview from '~/components/review/feedReview';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import { leftArrow, whiteClose } from '~/assets/icons';

interface ProductListProps {
  navigation: NavigationStackProp;
  route: NavigationRoute;
}

const ProductList = ({ navigation }: ProductListProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [sortReact, setSortReact] = useState<string[]>();

  const foodLogKey = useCallback((v) => v.id.toString(), []);
  const foodLogHeader = useCallback(() => (
    <View style={{ paddingHorizontal: d2p(20), marginTop: h2p(50) }}>
      <Text style={[FONT.Bold, { fontSize: 20, lineHeight: 25, marginBottom: h2p(33) }]}>
        {`뉴뉴 유저들이 남긴\n`}
        <Text style={{ color: theme.color.main }}>
          {`탄단지 고구마를 품은 닭가슴살\n`}
        </Text>
        푸드로그예요!
      </Text>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <TouchableOpacity
          onPress={() => console.log("filter")}
          style={[styles.filterTag, {
            backgroundColor: (sortReact && sortReact.length > 0) ? theme.color.grayscale.C_443e49 : theme.color.white,
          }]}>
          <Text style={[FONT.Regular, {
            marginRight: d2p(5), fontSize: 12,
            color: (sortReact && sortReact.length > 0) ? theme.color.white : theme.color.grayscale.C_443e49
          }]}>
            반응별
          </Text>
          {(sortReact && sortReact.length > 0) ?
            <Image source={whiteClose} style={{ width: d2p(7), height: d2p(7) }} />
            :
            <Image source={leftArrow} style={{ width: d2p(7), height: d2p(15), transform: [{ rotate: "270deg" }] }} />
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => console.log("filter")}
        >
          <Text style={[FONT.Regular, { fontSize: 12 }]}>{`최신순 >`}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), []);

  const foodLogRenderItem = useCallback(({ item, index }) =>
    <Pressable
      onPress={() => console.log("상세")}
      style={styles.review}>
      {/* <FeedReview
        idx={index}
        selectedIndex={selectedIndex}
        setSelectedIndex={(selectIdx: number) => setSelectedIndex(selectIdx)}
        review={item}
      /> */}
    </Pressable>
    , [selectedIndex]);

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon />}
        title="푸드로그 전체보기" />
      <FlatList
        ListHeaderComponent={foodLogHeader}
        renderItem={foodLogRenderItem}
        data={[{ id: 0, content: "11" }, { id: 1, content: "22" }, { id: 2, content: "33" }]}
        keyExtractor={foodLogKey}
        style={{ marginTop: 0, marginBottom: h2p(80), backgroundColor: theme.color.grayscale.f7f7fc }}
      />
    </>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    borderRadius: 15,
    marginHorizontal: d2p(10), marginTop: h2p(10),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15)
  },
  filterTag: {
    borderColor: theme.color.grayscale.e9e7ec,
    borderWidth: 1,
    width: d2p(70), height: h2p(25),
    borderRadius: 12.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: d2p(5),
    flexDirection: "row"
  },
});