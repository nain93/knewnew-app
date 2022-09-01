import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import FeedReview from '~/components/review/feedReview';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import { leftArrow, whiteClose } from '~/assets/icons';
import { ReviewListType, SatisfactionType } from '~/types/review';
import { useInfiniteQuery } from 'react-query';
import { getReviewList } from '~/api/review';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { bottomDotSheetState, tokenState } from '~/recoil/atoms';
import { hitslop, reactList } from '~/utils/constant';
import { loading } from '~/assets/gif';
import Loading from '~/components/loading';
import CustomBottomSheet from '~/components/popup/CustomBottomSheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import CloseIcon from '~/components/icon/closeIcon';
import ReactionLayout from '~/components/layout/ReactionLayout';
import ResetButton from '~/components/button/resetButton';
import BasicButton from '~/components/button/basicButton';

interface ProductListProps {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    product: string
  }>;
}

const ProductList = ({ navigation, route }: ProductListProps) => {
  const token = useRecoilValue(tokenState);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const reactRefRBSheet = useRef<RBSheet>(null);
  const [isBottomDotSheet, setIsBottomDotSheet] = useRecoilState(bottomDotSheetState);
  const [sort, setSort] = useState<"0" | "1">("0");
  const [sortReact, setSortReact] = useState<string[]>();
  const [clickedReact, setClickReact] = useState<Array<{
    title: SatisfactionType,
    isClick: boolean
  }>>(reactList.map(v => {
    return { title: v, isClick: false };
  }));

  const reviewListQuery = useInfiniteQuery<ReviewListType[], Error>(["reviewList", sort, sortReact], ({ pageParam = 0 }) =>
    getReviewList({
      token,
      product: route.params?.product,
      satisfaction: (clickedReact.filter(v => v.isClick)).map(v => v.title).toString(),
      offset: pageParam, limit: 5, sort
    }), {
    getNextPageParam: (next, all) => all.flat().length ?? undefined,
    enabled: !!route.params?.product
  });

  const reviewFooter = useCallback(() => <View style={{ height: h2p(117) }} />, []);

  const footerLoading = useCallback(() =>
    <View style={{ height: h2p(117) }}>
      <Image source={loading} style={{ alignSelf: "center", width: d2p(70), height: d2p(70) }} />
    </View>, []);

  const foodLogKey = useCallback((v) => v.id.toString(), []);
  const foodLogHeader = useCallback(() => (
    <View style={{ paddingHorizontal: d2p(20), marginTop: h2p(50) }}>
      <Text style={[FONT.Bold, { fontSize: 20, lineHeight: 25, marginBottom: h2p(33) }]}>
        {`뉴뉴 유저들이 남긴\n`}
        <Text style={{ color: theme.color.main }}>
          {`${route.params?.product}\n`}
        </Text>
        푸드로그예요!
      </Text>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <TouchableOpacity
          onPress={() => {
            if (sortReact && sortReact.length > 0) {
              setClickReact(clickedReact.map(v => ({ ...v, isClick: false })));
              setSortReact([]);
            }
            else {
              reactRefRBSheet.current?.open();
            }
          }}
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
          hitSlop={hitslop}
          onPress={() => {
            setSelectedIndex(-1);
            setIsBottomDotSheet({
              isOpen: true,
              topTitle: "최신순 보기",
              topPress: () => setSort("0"),
              middleTitle: "인기순 보기",
              middlePress: () => setSort("1"),
              bottomTitle: "닫기"
            });
          }}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Text style={[FONT.Regular, { fontSize: 12, marginRight: d2p(5) }]}>
            {sort === "0" ? "최신순" : "인기순"}
          </Text>
          <Image source={leftArrow} style={{ width: d2p(7), height: d2p(15), transform: [{ rotate: "270deg" }] }} />
        </TouchableOpacity>
      </View>
    </View>
  ), [sortReact]);

  const foodLogRenderItem = useCallback(({ item, index }) =>
    <Pressable
      onPress={() =>
        navigation.navigate("FeedDetail", {
          authorId: item.author.id,
          id: item.id,
          isLike: item.isLike, isBookmark: item.isBookmark
        })}
      style={styles.review}>
      <FeedReview
        review={item}
      />
    </Pressable>
    , [selectedIndex]);

  if (reviewListQuery.isLoading) {
    return (
      <>
        <Header
          headerLeft={<LeftArrowIcon />}
          title="푸드로그 전체보기" />
        <Loading />
      </>
    );

  }

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon />}
        title="푸드로그 전체보기" />
      <Pressable onPress={() => setSelectedIndex(-1)}>
        <FlatList
          ListHeaderComponent={foodLogHeader}
          renderItem={foodLogRenderItem}
          data={reviewListQuery.data?.pages.flat()}
          keyExtractor={foodLogKey}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={reviewListQuery.isFetchingNextPage ? footerLoading : reviewFooter}
          style={{
            marginTop: 0,
            // marginBottom: h2p(80),
            backgroundColor: theme.color.grayscale.f7f7fc
          }}
        />
      </Pressable>
      {/* 반응별 sheet */}
      <CustomBottomSheet
        height={Dimensions.get("window").height - h2p(480)}
        sheetRef={reactRefRBSheet}
        onOpen={() => {
          setSelectedIndex(-1);
          setClickReact(clickedReact.map(v => {
            if (sortReact?.includes(v.title)) {
              return { ...v, isClick: true };
            }
            return { ...v, isClick: false };
          }));
        }
        }
      >
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: d2p(10), marginBottom: h2p(30) }}>
            <CloseIcon onPress={() => reactRefRBSheet.current?.close()}
              imageStyle={{ width: d2p(15), height: h2p(15) }} />
            <Text style={[{ fontSize: 16, marginRight: d2p(15) }, FONT.Bold]}>반응별로 보기</Text>
            <View />
          </View>
          <ReactionLayout
            clickedReact={clickedReact}
            setClickReact={(react: {
              title: SatisfactionType,
              isClick: boolean
            }[]) => setClickReact(react)}
          />
          <ResetButton resetClick={() => setClickReact(clickedReact.map(v => ({
            title: v.title, isClick: false
          })))}
            viewStyle={{ marginTop: h2p(40), marginBottom: "auto" }} />
          <BasicButton text="필터 저장하기"
            onPress={() => {
              setSortReact(clickedReact.filter(v => v.isClick).map(v => v.title));
              reviewListQuery.refetch();
              reactRefRBSheet.current?.close();
            }}
            bgColor={theme.color.main}
            textColor={theme.color.white}
          />
        </>
      </CustomBottomSheet>
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