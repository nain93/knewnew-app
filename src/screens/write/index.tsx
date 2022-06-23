import { Dimensions, Image, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import theme from '~/styles/theme';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { BadgeType } from '~/types';
import { blackclose, cart, circle, graycircle, grayclose, grayheart, heart, maincart, maintag, tag } from '~/assets/icons';
import { photo, photoClose } from '~/assets/images';
import { d2p, h2p } from '~/utils';

import ImageCropPicker from 'react-native-image-crop-picker';
import RBSheet from "react-native-raw-bottom-sheet";
import SelectLayout from '~/components/selectLayout';
import CloseIcon from '~/components/icon/closeIcon';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import { MarketType, ReviewListType, WriteImagesType, WriteReviewType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { editReview, writeReview } from '~/api/review';
import { initialBadgeData } from '~/utils/data';
import FeedReview from '~/components/review/feedReview';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import Loading from '~/components/loading';
import { preSiginedImages, uploadImage } from '~/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getMyProfile } from '~/api/user';
import { MyProfileType } from '~/types/user';
import { marketList } from '~/utils/constant';

interface WriteProp {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    review?: ReviewListType,
    type?: "reknew" | "reKnewWrite",
    filterBadge?: string,
    nickname?: string,
    loading?: boolean,
    isEdit: boolean
  }>;
}

const today = new Date();

const Write = ({ navigation, route }: WriteProp) => {
  let parentId: number | undefined;
  if (route.params?.type === "reKnewWrite") {
    parentId = route.params.review?.id;
  }
  if (route.params?.review?.parent && route.params?.type === "reknew") {
    parentId = route.params.review?.parent.id;
  }
  const [writeData, setWriteData] = useState<WriteReviewType>({
    images: [],
    content: "",
    satisfaction: "",
    market: MarketType["판매처 선택"],
    parent: parentId,
    tags: {
      interest: [],
      household: [],
      taste: []
    }
  });

  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const inputRef = useRef<TextInput>(null);
  const tagRefRBSheet = useRef<RBSheet>(null);
  const marketRefRBSheet = useRef<RBSheet>(null);
  const [imageList, setImageList] = useState<string[]>([]);
  const [keyboardHeight, setKeyBoardHeight] = useState(0);
  const queryClient = useQueryClient();
  const token = useRecoilValue(tokenState);
  const setIspopupOpen = useSetRecoilState(popupState);
  const [presignImg, setPresignImg] = useState<WriteImagesType[]>([]);
  const [blockSubmit, setBlockSubmit] = useState(false);
  const setModalOpen = useSetRecoilState(okPopupState);
  const myId = useRecoilValue(myIdState);
  const [uploadBody, setUploadBody] = useState<{
    uri: string,
    name: string | undefined,
    type: string
  }[]>([]);

  const getMyProfileQuery = useQuery<MyProfileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token
  });

  const addReviewMutation = useMutation(["addReview", token],
    (writeProps: WriteReviewType) => writeReview({ token, ...writeProps }), {
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries("userReviewList");
        queryClient.setQueriesData("myProfile", (profileQuery: any) => {
          return {
            ...profileQuery, reviewCount: profileQuery?.reviewCount + 1
          };
        });
        queryClient.setQueriesData("reviewList", (reviewQuery: any) => {
          if (reviewQuery && getMyProfileQuery.data) {
            return {
              ...reviewQuery, pages: [[{
                author: {
                  id: getMyProfileQuery.data.id,
                  profileImage: getMyProfileQuery.data.profileImage,
                  representBadge: getMyProfileQuery.data.representBadge,
                  nickname: getMyProfileQuery.data.nickname,
                  household: getMyProfileQuery.data.household
                },
                ...writeData,
                tags: route.params?.type === "reKnewWrite" ? route.params.review?.tags : writeData.tags,
                parent: route.params?.type === "reKnewWrite" ? { ...route.params?.review, isActive: true } : null,
                market: (writeData.market === "판매처 선택" || writeData.market === "선택 안함") ? undefined : writeData.market,
                bookmarkCount: 0,
                likeCount: 0,
                childCount: 0,
                commentCount: 0,
                created: new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString(),
                id: data.id,
                images: presignImg.length > 0 ?
                  presignImg.map(img => ({ ...img, image: "https://knewnnew-s3.s3.amazonaws.com/" + img.image }))
                  :
                  writeData.images?.map(img => ({ ...img, image: "https://knewnnew-s3.s3.amazonaws.com/" + img.image }))
              }, ...reviewQuery.pages.flat()]]
            };
          }
        });
        navigation.goBack();
        navigation.navigate("FeedDetail", { id: data.id, authorId: myId });
      }
    },
    onSettled: () => setBlockSubmit(false)
  });

  const editReviewMutation = useMutation(["editReview", token],
    ({ writeProps, id }: { writeProps: WriteReviewType, id: number }) =>
      editReview({ token, id, ...writeProps }), {
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueriesData("reviewList", (reviewQuery: any) => {
          if (reviewQuery && getMyProfileQuery.data) {
            return {
              //@ts-ignore
              ...reviewQuery, pages: [reviewQuery.pages.flat().map(v => {
                if (!route.params?.type && route.params?.review &&
                  (v.parent?.id === route.params?.review.id)) {
                  return { ...v, parent: { ...v.parent, content: writeData.content, satisfaction: writeData.satisfaction } };
                }
                if (v.id === route.params?.review?.id) {
                  return {
                    author: route.params?.review?.author,
                    created: route.params?.review?.created,
                    bookmarkCount: route.params?.review?.bookmarkCount,
                    likeCount: route.params?.review?.likeCount,
                    childCount: route.params?.review?.childCount,
                    commentCount: route.params?.review?.commentCount,
                    ...writeData, id: v.id,
                    parent:
                      route.params?.review?.parent ?
                        (route.params?.review?.parent?.isActive ? { ...route.params?.review?.parent, isActive: true }
                          :
                          { ...route.params?.review?.parent, isActive: false })
                        :
                        null,
                    market: (writeData.market === "판매처 선택" || writeData.market === "선택 안함") ? undefined : writeData.market,
                    images: presignImg.length > 0 ?
                      presignImg.map(img => ({ ...img, image: "https://knewnnew-s3.s3.amazonaws.com/" + img.image }))
                      :
                      writeData.images?.map(img => ({ ...img, image: "https://knewnnew-s3.s3.amazonaws.com/" + img.image }))
                  };
                }
                return v;
              })]
            };
          }
        });
        navigation.goBack();
        navigation.navigate("FeedDetail", { id: data.id, authorId: myId });
      }
    },
    onSettled: () => setBlockSubmit(false)
  });

  const presignMutation = useMutation("presignImages",
    (fileName: Array<string>) => preSiginedImages({ token, fileName, route: "review" }),
    {
      onSuccess: (data) => {
        uploadBody.map(async (v, i) => {
          await uploadImage(v, data[i]);
        });
        //@ts-ignore
        const images = data.reduce<Array<{ priority: number, image: string }>>((acc, cur, idx) => {
          acc = acc.concat({ priority: idx, image: cur.fields.key });
          return acc;
        }, []);
        setPresignImg(images);
        if (route.params?.isEdit && route.params.review?.id) {
          editReviewMutation.mutate({
            writeProps:
              { ...writeData, parent: route.params.review.parent?.isActive ? writeData.parent : undefined, images },
            id: route.params.review?.id
          });
        }
        else {
          addReviewMutation.mutate({ ...writeData, images });
        }
      }
    });

  const pickImage = () => {
    if (imageList.length >= 5) {
      return;
    }

    ImageCropPicker.openPicker({
      mediaType: "photo",
      crop: "true",
      includeBase64: true,
      compressImageMaxWidth: 720,
      compressImageMaxHeight: 720
    }).then(v => {
      setUploadBody(uploadBody.concat(
        {
          uri: v.path,
          type: v.mime,
          name: Platform.OS === 'ios' ? v.filename : `${Date.now()}.${v.mime === 'image/jpeg' ? 'jpg' : 'png'}`,
        }
      ));
      setImageList(imageList.concat(`data:${v.mime};base64,${v.data}`));
    }
    );
  };
  const handleAddWrite = async () => {
    if (writeData.satisfaction === "") {
      setIspopupOpen({ isOpen: true, content: "선호도를 표시해주세요", popupStyle: { bottom: keyboardHeight + h2p(20) } });
      return;
    }
    if (writeData.content === "") {
      setIspopupOpen({ isOpen: true, content: "내용을 입력해주세요", popupStyle: { bottom: keyboardHeight + h2p(20) } });
      return;
    }
    if (route.params && route.params.type !== "reknew" && route.params?.type !== "reKnewWrite") {
      if (writeData.tags.interest.length === 0 ||
        writeData.tags.household.length === 0) {
        setIspopupOpen({ isOpen: true, content: "태그를 선택해주세요", popupStyle: { bottom: keyboardHeight + h2p(20) } });
        return;
      }
    }
    setBlockSubmit(true);
    // * 이미지 업로드할때
    if (uploadBody.length > 0) {
      presignMutation.mutate(imageList);
    }
    else {
      // * 수정할때 (이미지 업로드x)
      if (route.params?.isEdit && route.params.review?.id) {
        editReviewMutation.mutate({
          writeProps:
            { ...writeData, parent: route.params.review.parent?.isActive ? writeData.parent : undefined },
          id: route.params.review?.id
        });
      }
      else {
        addReviewMutation.mutate(writeData);
      }
    }
  };

  useEffect(() => {
    if (route.params?.review && route.params.type !== "reKnewWrite") {
      setImageList(route.params.review.images.map(v => v.image));
      setUserBadge({
        interest: userBadge.interest.map(v => {
          if (route.params?.review?.tags.interest.includes(v.title)) {
            return { isClick: true, title: v.title };
          }
          return { isClick: false, title: v.title };
        }),
        household: userBadge.household.map(v => {
          if (route.params?.review?.tags.household.includes(v.title)) {
            return { isClick: true, title: v.title };
          }
          return { isClick: false, title: v.title };
        }),
        taste: userBadge.taste.map(v => {
          if (route.params?.review?.tags.taste &&
            route.params?.review?.tags.taste.includes(v.title)) {
            return { isClick: true, title: v.title };
          }
          return { isClick: false, title: v.title };
        }),
      });
      setWriteData({
        ...writeData,
        images: route.params.review.images.map(v => ({ ...v, image: "review" + v.image?.split("review")[1] })),
        content: route.params.review.content,
        satisfaction: route.params.review.satisfaction,
        market: route.params.review.market ? route.params.review.market : MarketType['선택 안함'],
        tags: {
          ...route.params.review.tags,
          taste: route.params.review.tags.taste || []
        },
      });
    }
    else {
      setUserBadge(initialBadgeData);
      setUploadBody([]);
      setImageList([]);
      setWriteData({
        images: [],
        content: "",
        satisfaction: "",
        market: MarketType['판매처 선택'],
        parent: parentId,
        tags: {
          interest: [],
          household: [],
          taste: []
        }
      });
    }
  }, [route.params]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      Keyboard.addListener("keyboardWillShow", (e) => {
        setKeyBoardHeight(e.endCoordinates.height);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setKeyBoardHeight(h2p(20));
      });
    }
    else {
      Keyboard.addListener("keyboardDidShow", (e) => {
        if ((route.params?.type === "reKnewWrite" || route.params?.type === "reknew")) {
          setKeyBoardHeight(e.endCoordinates.height - 50);
        }
        else {
          setKeyBoardHeight(e.endCoordinates.height);
        }
      });
      Keyboard.addListener("keyboardDidHide", () => {
        setKeyBoardHeight(h2p(20));
      });
    }
  }, [route.params?.type]);

  if ((route.params?.loading && !writeData.satisfaction) || addReviewMutation.isLoading || editReviewMutation.isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => {
          if (writeData.content
            || writeData.satisfaction
            || writeData.images && writeData.images.length > 0
            || writeData.market && (writeData.market !== "판매처 선택")
            || writeData.tags.interest.length > 0
            || writeData.tags.household.length > 0
            || writeData.tags.taste.length > 0) {
            setModalOpen({
              isOpen: true,
              content: "앗! 지금까지 작성하신 내용이 사라져요",
              okButton: () => {
                navigation.goBack();
                setWriteData({
                  images: [],
                  content: "",
                  satisfaction: "",
                  market: MarketType['판매처 선택'],
                  parent: parentId,
                  tags: {
                    interest: [],
                    household: [],
                    taste: []
                  }
                });
              }
            });
          }
          else {
            navigation.goBack();
          }
        }}
          imageStyle={{ width: d2p(11), height: h2p(25) }} />}
        title="작성하기"
        headerRightPress={() => {
          if (blockSubmit) {
            return;
          }
          else {
            handleAddWrite();
          }
        }}
        headerRight={<Text style={[{ color: theme.color.main }, FONT.Regular]}>완료</Text>} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.reviewIconWrap}>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "best" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "best") ? heart : grayheart} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={[{ color: (writeData.satisfaction === "best") ? theme.color.main : theme.color.grayscale.a09ca4, marginLeft: d2p(5) },
            (writeData.satisfaction === "best") ? FONT.Bold : FONT.Regular]}>최고에요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "good" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "good") ? circle : graycircle} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={[{ color: (writeData.satisfaction === "good") ? theme.color.yellow : theme.color.grayscale.a09ca4, marginLeft: d2p(5) },
            (writeData.satisfaction === "good") ? FONT.Bold : FONT.Regular]}>괜찮아요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "bad" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "bad") ? blackclose : grayclose} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={[{ color: (writeData.satisfaction === "bad") ? theme.color.black : theme.color.grayscale.a09ca4, marginLeft: d2p(5) },
            (writeData.satisfaction === "bad") ? FONT.Bold : FONT.Regular]}>별로에요</Text>
          </TouchableOpacity>
        </View>
        {(route.params?.type === "reknew" || route.params?.type === "reKnewWrite") ?
          <View
            style={{ marginTop: h2p(30), paddingHorizontal: d2p(20), marginBottom: "auto" }}>
            <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>이 글을 인용하고 있어요.</Text>
            <View style={{
              borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
              paddingHorizontal: d2p(15),
              paddingTop: h2p(15),
              paddingBottom: h2p(10),
              marginVertical: h2p(15),
              borderRadius: 5
            }}>
              {route.params.review &&
                (
                  (route.params.review.parent?.isActive || !route.params.review.parent) ?
                    <FeedReview
                      filterBadge={route.params.filterBadge}
                      type="reKnewWrite"
                      //@ts-ignore
                      review={route.params?.review.parent ? route.params?.review.parent : route.params?.review} />
                    :
                    <Text style={[FONT.Regular, { color: theme.color.grayscale.C_79737e }]}>
                      원문 글이 삭제되었습니다.
                    </Text>
                )
              }
            </View>
            <Pressable onPress={() => inputRef.current?.focus()}
              style={{
                height: h2p(290)
              }}
            >
              <TextInput
                value={writeData.content}
                maxLength={301}
                onChangeText={(e) => {
                  if (e.length > 300) {
                    setWriteData({ ...writeData, content: e.slice(0, e.length - 1) });
                  }
                  else {
                    setWriteData({ ...writeData, content: e });
                  }
                }}
                autoCapitalize="none"
                ref={inputRef}
                multiline
                // onContentSizeChange={e => setNumberLine(Math.round(e.nativeEvent.contentSize.height / 20))}
                placeholder={`${route.params?.nickname}님은 어떻게 생각하세요?`}
                placeholderTextColor={theme.color.grayscale.a09ca4}
                style={[{
                  paddingTop: 0, padding: 0, fontSize: 16, color: theme.color.black,
                }, FONT.Regular]} />
            </Pressable>
          </View>
          :
          <>
            <Pressable onPress={() => inputRef.current?.focus()}
              style={{ height: h2p(446) }}>
              <TextInput
                ref={inputRef}
                value={writeData.content}
                autoCapitalize="none"
                multiline
                maxLength={301}
                textAlignVertical="top"
                onChangeText={(e) => {
                  if (e.length > 300) {
                    setWriteData({ ...writeData, content: e.slice(0, e.length - 1) });
                  }
                  else {
                    setWriteData({ ...writeData, content: e });
                  }
                }}
                style={[styles.textInput, FONT.Regular]}
                placeholder="내용을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
            </Pressable>
            <View style={styles.selectWrap}>
              <TouchableOpacity
                onPress={() => tagRefRBSheet.current?.open()}
                style={[styles.select, { marginRight: d2p(10) }]}>
                <View style={{ position: "relative" }}>
                  <Image source={((
                    writeData.tags.interest.length +
                    writeData.tags.household.length +
                    writeData.tags.taste.length) === 0) ? tag : maintag} style={{ width: d2p(14), height: h2p(14), marginRight: d2p(5) }} />
                  {(writeData.tags.interest.length +
                    writeData.tags.household.length +
                    writeData.tags.taste.length) !== 0 &&
                    <Text style={{ fontSize: 8, color: theme.color.white, top: h2p(3), left: "22%", position: "absolute" }}>
                      {(writeData.tags.interest.length +
                        writeData.tags.household.length +
                        writeData.tags.taste.length)}</Text>}
                </View>
                <Text style={FONT.Medium}>태그 선택</Text>
                <Text style={[{ fontSize: 12, color: theme.color.main }, FONT.Medium]}> *</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => marketRefRBSheet.current?.open()}
                style={styles.select}>
                <Image source={(writeData.market !== "선택 안함" && writeData.market !== "판매처 선택") ? maincart : cart} style={{ width: d2p(14), height: h2p(14), marginRight: d2p(5) }} />
                <Text style={FONT.Medium}>{writeData.market}</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      </KeyboardAwareScrollView>
      <View style={{
        position: "absolute", flexDirection: "row", alignItems: "center",
        bottom: 0,
        paddingBottom: isIphoneX() ? getBottomSpace() : h2p(30),
        paddingTop: h2p(20),
        backgroundColor: theme.color.white
      }}>
        {(!route.params?.isEdit || !route.params.review?.id) &&
          <Pressable onPress={pickImage} style={[styles.images, { marginLeft: d2p(20), marginRight: d2p(15) }]}>
            <View style={{ alignItems: "center" }}>
              <Image source={photo} style={{ width: d2p(20), height: h2p(20), marginTop: h2p(12) }} />
              <Text style={[{ fontSize: 12, color: theme.color.grayscale.d3d0d5, marginVertical: h2p(8) }, FONT.Regular]}>{imageList.length}/5</Text>
            </View>
          </Pressable>
        }
        <ScrollView
          style={{ paddingLeft: (!route.params?.isEdit || !route.params.review?.id) ? 0 : d2p(20) }}
          horizontal showsHorizontalScrollIndicator={false}>
          {React.Children.toArray(imageList.map((image, idx) => {
            return (
              <View style={[styles.images, { marginRight: (idx === imageList.length - 1) ? d2p(20) : d2p(5) }]}>
                <View style={{ alignItems: "center" }}>
                  <Image source={{ uri: image }} style={{ width: d2p(96), height: h2p(64), borderRadius: 4 }} />
                  <Pressable onPress={() => {
                    setWriteData({ ...writeData, images: writeData.images?.filter((_, filterIdx) => idx !== filterIdx) });
                    setImageList(imageList.filter((_, filterIdx) => idx !== filterIdx));
                    setUploadBody(uploadBody.filter((_, filterIdx) => idx !== filterIdx));
                  }}
                    style={{ position: "absolute", right: 0, top: 0 }}>
                    <Image source={photoClose} style={{ width: d2p(16), height: h2p(16) }} />
                  </Pressable>
                </View>
              </View>
            );
          }))}
        </ScrollView>
      </View>
      <View style={{
        position: "absolute", right: d2p(10),
        bottom: keyboardHeight > 100 ? keyboardHeight + h2p(20) :
          ((route.params?.type === "reKnewWrite" || route.params?.type === "reknew") ? h2p(94) : h2p(184)),
        backgroundColor: "rgba(0,0,0,0.1)",
        padding: d2p(5),
        borderRadius: 5
      }}>
        <Text style={[FONT.Regular, {
          color: writeData.content.length === 300 ? theme.color.main : theme.color.grayscale.a09ca4
        }]}>{writeData.content.length}/300</Text>
      </View>

      {/* 태그 선택 바텀시트 */}
      <RBSheet
        animationType="fade"
        ref={tagRefRBSheet}
        closeOnDragDown
        dragFromTopOnly
        onOpen={() => {

        }}
        height={(!isIphoneX() && Platform.OS !== "android") ?
          Dimensions.get("window").height - h2p(204) : Dimensions.get("window").height - h2p(264)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: d2p(20),
            paddingVertical: h2p(20)
          }, draggableIcon: {
            display: "none"
          }
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: d2p(10), marginBottom: h2p(34) }}>
          <CloseIcon onPress={() => tagRefRBSheet.current?.close()}
            imageStyle={{ width: d2p(15), height: h2p(15) }} />
          <Text style={[{ fontSize: 16 }, FONT.Bold]}>태그 선택</Text>
          <TouchableOpacity onPress={() => {
            setWriteData({
              ...writeData, tags: {
                interest: userBadge.interest.filter(v => v.isClick).map(v => v.title),
                household: userBadge.household.filter(v => v.isClick).map(v => v.title),
                taste: userBadge.taste.filter(v => v.isClick).map(v => v.title)
              }
            });
            tagRefRBSheet.current?.close();
          }}>
            <Text style={[{ color: theme.color.grayscale.ff5d5d }, FONT.Regular]}>완료</Text>
          </TouchableOpacity>
        </View>
        <SelectLayout isInitial={true} userBadge={userBadge} setUserBadge={setUserBadge} />
      </RBSheet>

      {/* 판매처 선택 바텀시트 */}
      <RBSheet
        animationType="fade"
        ref={marketRefRBSheet}
        closeOnDragDown
        dragFromTopOnly
        height={Dimensions.get("window").height - h2p(380)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            overflow: "visible"
          }, draggableIcon: {
            display: "none"
          }
        }}
      >
        <View style={{
          flexDirection: "row", justifyContent: "space-between",
          paddingHorizontal: d2p(30), paddingVertical: h2p(20)
        }}>
          <CloseIcon onPress={() => marketRefRBSheet.current?.close()}
            imageStyle={{ width: d2p(15), height: h2p(15) }} />
          <Text style={[{ fontSize: 16 }, FONT.Bold]}>판매처 선택</Text>
          <View />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: d2p(20) }}>
          {React.Children.toArray(marketList.map((market) =>
            <TouchableOpacity
              onPress={() => {
                setWriteData({ ...writeData, market });
                marketRefRBSheet.current?.close();
              }}
              style={{
                paddingVertical: h2p(12.5), paddingHorizontal: d2p(10),
                borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc
              }}>
              <Text style={FONT.Medium}>{market}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </RBSheet>
    </>
  );
};

export default Write;

const styles = StyleSheet.create({
  container: {
    minHeight: Dimensions.get("window").height - h2p(94)
  },
  textInput: {
    paddingHorizontal: d2p(20),
    marginTop: h2p(30),
    paddingTop: 0,
    includeFontPadding: false,
    fontSize: 16,
    color: theme.color.black,
  },
  reviewIconWrap: {
    marginTop: h2p(20),
    paddingHorizontal: d2p(20),
    flexDirection: "row"
  },
  reviewIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: d2p(20)
  },
  selectWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    marginBottom: Platform.OS === "ios" ? h2p(114) : h2p(94)
  },
  select: {
    flexDirection: "row",
    paddingVertical: h2p(13),
    justifyContent: "center",
    width: (Dimensions.get("window").width - d2p(50)) / 2,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: theme.color.grayscale.e9e7ec
  },
  images: {
    width: d2p(96),
    height: h2p(64),
    borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 4
  }
});