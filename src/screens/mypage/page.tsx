import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { myIdState, tokenState } from '~/recoil/atoms';
import { getMyProfile, getUserBookmarkList, getUserReviewList, userFollow } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { MyProfileType } from '~/types/user';
import { noProfile } from '~/assets/images';
import Loading from '~/components/loading';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import FeedReview from '~/components/review/feedReview';
import { FONT } from '~/styles/fonts';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import BasicButton from '~/components/button/basicButton';
import { ReviewListType } from '~/types/review';
import { bookmark, commentMore, graybookmark, graywrite, more, tasteMoreIcon } from '~/assets/icons';
import FastImage from 'react-native-fast-image';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomBottomSheet from '~/components/popup/CustomBottomSheet';
import FollowBottomTab from '~/screens/mypage/followBottomTab';
import CloseIcon from '~/components/icon/closeIcon';
import { productBookmark, productBookmarkList } from '~/api/product';
import { ProductListType } from '~/types/product';
import ProductBookmark from '~/screens/feed/productBookmark';
import { blogImage, instaImage, youtubeImage } from '~/assets/icons/sns';

interface MypageProps {
  navigation: NavigationStackProp;
  route: NavigationRoute;
}

const Mypage = ({ navigation }: MypageProps) => {
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [followIndex, setFollowIndex] = useState(0);
  const [apiBlock, setApiBlock] = useState(false);
  const followRef = useRef<RBSheet>(null);
  const [isTasteMore, setIsTasteMore] = useState(false);
  const [isTwoLine, setIsTwoLine] = useState(false);

  const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", myId], async () => {
    const queryData = await getMyProfile(token);
    queryClient.setQueryData("myProfile", queryData);
    return queryData;
  }, {
    onSuccess: (data) => {
      queryClient.setQueryData("myProfile", data);
    },
  });

  const userReviewListQuery = useInfiniteQuery<ReviewListType[], Error>(["userReviewList", myId], async ({ pageParam = 0 }) => {
    const queryData = await getUserReviewList({ token, id: myId, offset: pageParam, limit: 5 });
    return queryData;
  }, {
    getNextPageParam: (next, all) => all.flat().length
  });

  const userBookmarkListQuery = useInfiniteQuery<ReviewListType[], Error>(["userBookmarkList"], async ({ pageParam = 0 }) => {
    const queryData = await getUserBookmarkList({ token, id: myId, offset: pageParam, limit: 5 });
    return queryData;
  }, {
    getNextPageParam: (next, all) => all.flat().length
  });

  const userProductBookmarkQuery = useInfiniteQuery<ProductListType[], Error>(["userProductBookmark"], async ({ pageParam }) => {
    const queryData = await productBookmarkList({ token, id: myId, offset: pageParam, limit: 5 });
    return queryData;
  }, {
    getNextPageParam: (next, all) => all.flat().length
  });

  const followMutation = useMutation("userFollow", ({ userId, isFollow }: { userId: number, isFollow: boolean }) =>
    userFollow({ token, userId, isFollow }), {
    onSuccess: () => {
      queryClient.invalidateQueries("myProfile");
    }
  });

  const tabHeader = useCallback(() => (
    <>
      <View pointerEvents="box-none" >
        <View style={styles.profileImage}>
          <View style={{ flexDirection: "row", width: d2p(80) }}>
            <Image source={youtubeImage} style={{ width: d2p(24), height: d2p(24) }} />
            <Image source={instaImage} style={{ width: d2p(24), height: d2p(24) }} />
            <Image source={blogImage} style={{ width: d2p(24), height: d2p(24) }} />
          </View>
          <View style={{
            alignItems: "center", position: "absolute",
            width: Dimensions.get("window").width,
            borderBottomWidth: 1,
            borderColor: theme.color.grayscale.f7f7fc,
            paddingBottom: h2p(14.5)
          }}>
            <FastImage style={{
              width: d2p(70), height: d2p(70), borderRadius: 70,
              borderWidth: 1,
              borderColor: theme.color.grayscale.eae7ec
            }}
              source={getMyProfileQuery.data?.profileImage ? { uri: getMyProfileQuery.data?.profileImage } : noProfile} />
            <Text style={[FONT.Bold, {
              fontSize: 20, marginTop: h2p(10), marginHorizontal: d2p(20),
              textAlign: "center"
            }]}>
              {getMyProfileQuery.data?.nickname}
              <Text style={{ color: theme.color.grayscale.a09ca4 }}>님</Text>
            </Text>
            <View style={{ flexDirection: "row", marginTop: h2p(8) }}>
              <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, fontSize: 12 }]}>
                팔로잉 <Text style={{ color: theme.color.black }}>193</Text>
              </Text>
              <Text> ・ </Text>
              <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, fontSize: 12 }]}>
                팔로워 <Text style={{ color: theme.color.black }}>60</Text>
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              navigation.navigate("editProfile",
                {
                  profile:
                  {
                    nickname: getMyProfileQuery?.data?.nickname,
                    headline: getMyProfileQuery?.data?.headline,
                    profileImage: getMyProfileQuery?.data?.profileImage,
                    tags: {
                      foodStyle: getMyProfileQuery?.data?.tags.foodStyle.map(v => ({ title: v, isClick: true })),
                      household: getMyProfileQuery?.data?.tags.household.map(v => ({ title: v, isClick: true })),
                      occupation: getMyProfileQuery?.data?.tags.occupation.map(v => ({ title: v, isClick: true })),
                      taste: getMyProfileQuery.data?.tags.taste
                    },
                    representBadge: getMyProfileQuery?.data?.representBadge,
                    remainingPeriod: getMyProfileQuery?.data?.remainingPeriod
                  }
                });
            }}
            style={{
              paddingHorizontal: d2p(8), paddingVertical: h2p(4),
              flexDirection: "row",
              borderWidth: 1,
              borderRadius: 12,
              borderColor: theme.color.grayscale.a09ca4,
              marginLeft: "auto"
            }}
          >
            <Image source={graywrite} style={{ width: d2p(12), height: d2p(12) }} />
            <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4, fontSize: 12 }]}>
              {` 프로필 수정`}</Text>
          </Pressable>
          {/* 뱃지 기능 추가후 주석해제 */}
          {/* <View style={{
              marginLeft: d2p(10),
              borderWidth: 1,
              borderRadius: 10, height: d2p(20),
              backgroundColor: "#fff8db",
              borderColor: "#ffd991",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: d2p(10)
            }}>
              <Text style={[FONT.Medium, { fontSize: 10, color: "rgb(255,107,41)" }]}>{`다이어터 >`}</Text>
            </View> */}
        </View>

        <View
          onLayout={(e) => {
            // todo 2줄 파악해서 더보기 버튼 나와야함 (높이가 고정되어있슴)
            if (e.nativeEvent.layout.height > 30) {
              setIsTwoLine(true);
            }
            else {
              setIsTwoLine(false);
            }
          }}
          style={styles.profileInfo}>
          {React.Children.toArray(getMyProfileQuery.data?.tags.taste?.map(v => (
            <View style={{
              borderWidth: 1,
              borderColor: theme.color.grayscale.C_443e49,
              paddingHorizontal: d2p(10),
              paddingVertical: h2p(4),
              borderRadius: 12,
              marginRight: d2p(5)
            }}>
              <Text
                style={[FONT.Medium, { fontSize: 10, color: theme.color.grayscale.C_443e49 }]}>
                {v}
              </Text>
            </View>
          )))}
          <View style={{
            borderWidth: 1,
            borderColor: theme.color.grayscale.C_443e49,
            paddingHorizontal: d2p(10),
            paddingVertical: h2p(4),
            borderRadius: 12,
            marginRight: d2p(5)
          }}>
            <Text style={[FONT.Medium, { fontSize: 10, color: theme.color.grayscale.C_443e49 }]}>
              zxzxcbzxcb
            </Text>
          </View>
          {isTwoLine &&
            <Pressable
              onPress={() => setIsTasteMore(true)}
              style={{ marginLeft: "auto" }}>
              <Image source={tasteMoreIcon} style={{ width: d2p(32), height: d2p(20) }} />
            </Pressable>
          }
        </View>
      </View>

      {/* 팔로우 바텀시트 */}
      <CustomBottomSheet
        customStyles={{
          container: {
            padding: 0,
            paddingTop: h2p(20),
            borderRadius: 30,
          }
        }}
        sheetRef={followRef}
        height={Dimensions.get("window").height - h2p(60)}
      >
        <>
          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            paddingHorizontal: d2p(30), marginBottom: h2p(20)
          }}>
            <CloseIcon onPress={() => followRef.current?.close()}
              imageStyle={{ width: d2p(15), height: h2p(15) }} />
            <Text style={[{ fontSize: 16, marginRight: d2p(15) }, FONT.Bold]}>{getMyProfileQuery.data?.nickname}</Text>
            <View />
          </View>
          {/* 팔로우 바텀 시트 */}
          {/* {route.params?.id &&
            <FollowBottomTab
              followIndex={followIndex}
              id={route.params.id} />
          } */}
        </>
      </CustomBottomSheet>
    </>
  ), [getMyProfileQuery.data, followIndex, isTwoLine]);

  // * 작성글
  const reviewKey = useCallback((v) => String(v.id), []);
  const reviewEmpty = useCallback(() => {
    if (!userReviewListQuery.isLoading) {
      return (
        <View style={{ paddingTop: h2p(100) }}>
          <View style={{ marginBottom: h2p(180) }}>
            <Text style={[FONT.Regular,
            {
              color: theme.color.grayscale.C_79737e,
              textAlign: "center",
            }]}>
              작성한 글이 없습니다.</Text>
          </View>
          <BasicButton
            viewStyle={{ marginHorizontal: d2p(20) }}
            onPress={() => navigation.navigate('BeforeWrite', { loading: false, isEdit: false })}
            text="작성하기" textColor={theme.color.main} bgColor={theme.color.white} />
        </View>
      );
    }
    return null;
  }, [userReviewListQuery.isLoading]);

  const reviewHeader = useCallback(() => {
    if (userReviewListQuery.isLoading) {
      return (
        <Loading viewStyle={{
          position: "relative",
          top: h2p(90)
        }} />
      );
    }
    return null;
  }, [userReviewListQuery.isLoading]);

  const reviewRenderItem = useCallback(
    (review) => {
      if (userReviewListQuery.isLoading) {
        return null;
      }
      return (
        <Pressable
          onPress={() => navigation.push("FeedDetail",
            { id: review.item.id, isLike: review.item.isLike, authorId: review.item.author.id })}
          style={styles.review}
        >
          <FeedReview
            review={review.item} />
        </Pressable>
      );
    }
    , [userReviewListQuery.isLoading]);

  const reviewEndReached = useCallback(() => {
    if (userReviewListQuery.data &&
      userReviewListQuery.data.pages.flat().length > 4) {
      userReviewListQuery.fetchNextPage();
    }
  }, [userReviewListQuery]);

  const reviewRefresh = useCallback(() => {
    userReviewListQuery.refetch();
    getMyProfileQuery.refetch();
  }, []);
  const reviewFooter = useCallback(() => <View style={{ height: h2p(100) }} />, []);

  // * 리뷰 담은글
  const bookmarkKey = useCallback((v) => (v.id).toString(), []);
  const bookmarkEmpty = useCallback(() => {
    if (!userBookmarkListQuery.isLoading) {
      return (
        <View style={{ paddingTop: h2p(100) }}>
          <View style={{ marginBottom: h2p(180) }}>
            <Text style={[FONT.Regular,
            {
              color: theme.color.grayscale.C_79737e,
              textAlign: "center",
            }]}>
              담은 글이 없습니다.</Text>
          </View>
          <BasicButton
            viewStyle={{ marginHorizontal: d2p(20) }}
            onPress={() => navigation.navigate('Feed')}
            text="담으러 가기" textColor={theme.color.main} bgColor={theme.color.white} />
        </View>
      );
    }
    return null;
  }, [userBookmarkListQuery.isLoading]);

  const bookmarkHeader = useCallback(() => {
    if (userBookmarkListQuery.isLoading) {
      return (
        <Loading viewStyle={{
          position: "relative",
          top: h2p(90)
        }} />
      );
    }
    return null;
  }, [userBookmarkListQuery.isLoading]);

  const bookmarkRenderItem = useCallback((bookmarks) => {
    if (userBookmarkListQuery.isLoading) {
      return null;
    }
    return (
      <Pressable
        onPress={() => navigation.push("FeedDetail",
          { id: bookmarks.item.id, isLike: bookmarks.item.isLike, authorId: bookmarks.item.author.id })}
        style={styles.review}
      >
        <FeedReview
          review={bookmarks.item} />
      </Pressable>
    );
  }, [userBookmarkListQuery.isLoading]);

  const bookmarkEndReached = useCallback(() => {
    if (userBookmarkListQuery.data &&
      userBookmarkListQuery.data?.pages.flat().length > 4) {
      userBookmarkListQuery.fetchNextPage();
    }
  }, [userBookmarkListQuery]);

  const bookmarkRefresh = useCallback(() => {
    userBookmarkListQuery.refetch();
    getMyProfileQuery.refetch();
  }, []);

  const bookmarkFooter = useCallback(() => <View style={{ height: h2p(100) }} />, []);


  // * 상품 담은 글 //
  const productHeader = useCallback(() => {
    if (userProductBookmarkQuery.isLoading) {
      return (
        <Loading viewStyle={{
          position: "relative",
          top: h2p(90)
        }} />
      );
    }
    return null;
  }, [userProductBookmarkQuery.isLoading]);

  const productEmpty = useCallback(() => {
    if (!userProductBookmarkQuery.isLoading) {
      return (
        <View style={{ paddingTop: h2p(100) }}>
          <View style={{ marginBottom: h2p(180) }}>
            <Text style={[FONT.Regular,
            {
              color: theme.color.grayscale.C_79737e,
              textAlign: "center",
            }]}>
              담은 상품이 없습니다.</Text>
          </View>
          <BasicButton
            onPress={() => navigation.navigate('Feed')}
            text="담으러 가기" textColor={theme.color.main} bgColor={theme.color.white} />
        </View>
      );
    }
    return null;
  }, [userProductBookmarkQuery.isLoading]);

  const proudctRenderItem = useCallback((products) =>
    <ProductBookmark
      apiBlock={apiBlock}
      setApiBlock={(isApi: boolean) => setApiBlock(isApi)}
      product={products.item} />, [userProductBookmarkQuery.isLoading]);

  const productEndReached = useCallback(() => {
    if (userProductBookmarkQuery.data &&
      userProductBookmarkQuery.data?.pages.flat().length > 4) {
      userProductBookmarkQuery.fetchNextPage();
    }
  }, [userProductBookmarkQuery]);

  const productRefresh = useCallback(() => {
    userProductBookmarkQuery.refetch();
    getMyProfileQuery.refetch();
  }, []);

  const productFooter = useCallback(() => <View style={{ height: h2p(100) }} />, []);

  useEffect(() => {
    // * 로그아웃시 온보딩화면으로
    if (!token) {
      //@ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
  }, [token]);

  if (getMyProfileQuery.isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Tabs.Container
        onIndexChange={setIndex}
        initialTabName={`작성 글 ${getMyProfileQuery.data?.reviewCount}`}
        containerStyle={styles.container}
        renderTabBar={(props) => <MaterialTabBar
          contentContainerStyle={{ paddingBottom: h2p(4.5), paddingTop: h2p(20) }}
          indicatorStyle={{
            height: 2,
            backgroundColor: theme.color.black,
            marginBottom: d2p(-1)
          }} TabItemComponent={(tabs) => (
            <Pressable
              onPress={() => props.onTabPress(tabs.label)}
              style={{ width: Dimensions.get("window").width / 3 }}>
              <Text style={[{
                fontSize: 16,
                textAlign: "center"
              }, tabs.index === index ? FONT.Bold : FONT.Regular]}>{tabs.label}
              </Text>
            </Pressable>
          )} {...props} />}
        renderHeader={tabHeader}
      >
        <Tabs.Tab
          name={`작성 글 ${getMyProfileQuery.data?.reviewCount}`}>
          <Tabs.FlatList
            ListHeaderComponent={Platform.OS === "android" ? reviewHeader : null}
            ListEmptyComponent={reviewEmpty}
            onEndReached={reviewEndReached}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            refreshing={userReviewListQuery.isLoading}
            onRefresh={reviewRefresh}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={reviewFooter}
            data={userReviewListQuery.data?.pages.flat()}
            renderItem={reviewRenderItem}
            keyExtractor={reviewKey}
          />

        </Tabs.Tab>
        <Tabs.Tab name={`담은 글 ${getMyProfileQuery.data?.reviewBookmarkCount}`}>
          <Tabs.FlatList
            ListHeaderComponent={Platform.OS === "android" ? bookmarkHeader : null}
            ListEmptyComponent={bookmarkEmpty}
            onEndReached={bookmarkEndReached}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            refreshing={userBookmarkListQuery.isLoading}
            onRefresh={bookmarkRefresh}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={bookmarkFooter}
            data={userBookmarkListQuery.data?.pages.flat()}
            renderItem={bookmarkRenderItem}
            keyExtractor={bookmarkKey}
          />
        </Tabs.Tab>
        <Tabs.Tab name={`담은 상품 ${getMyProfileQuery.data?.productBookmarkCount}`}>
          <Tabs.FlatList
            ListHeaderComponent={Platform.OS === "android" ? productHeader : null}
            ListEmptyComponent={productEmpty}
            onEndReached={productEndReached}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            refreshing={userProductBookmarkQuery.isLoading}
            onRefresh={productRefresh}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={productFooter}
            style={{ paddingHorizontal: d2p(20) }}
            data={userProductBookmarkQuery.data?.pages.flat()}
            keyExtractor={bookmarkKey}
            renderItem={proudctRenderItem}
          />
        </Tabs.Tab>
      </Tabs.Container>
    </>
  );
};

export default Mypage;

const styles = StyleSheet.create({
  container: {
    paddingBottom: h2p(20),
    paddingTop: h2p(5),
    backgroundColor: theme.color.grayscale.f7f7fc
  },
  profileImage: {
    marginVertical: h2p(30),
    flexDirection: "row",
    alignItems: "flex-start",
    height: h2p(123),
    paddingHorizontal: d2p(20)
  },
  profileInfo: {
    flexDirection: "row",
    paddingHorizontal: d2p(20),
    alignItems: "center",
    flexWrap: "wrap",
    height: h2p(20),
    overflow: "hidden"
  },
  headline: {
    width: Dimensions.get("window").width - d2p(40),
    borderWidth: 1,
    minHeight: h2p(40),
    paddingVertical: h2p(10),
    paddingHorizontal: d2p(10),
    borderColor: theme.color.grayscale.ec6863,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    marginBottom: h2p(15),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  review: {
    backgroundColor: theme.color.white,
    width: Dimensions.get('window').width - d2p(20),
    borderRadius: 10,
    marginHorizontal: d2p(10), marginTop: h2p(15),
    paddingHorizontal: d2p(10), paddingVertical: d2p(15)
  },
});