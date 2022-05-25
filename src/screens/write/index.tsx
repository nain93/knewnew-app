import { Dimensions, Image, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useMutation, useQueryClient } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { popupState, tokenState } from '~/recoil/atoms';
import { ReviewListType, WriteReviewType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { useFocusEffect } from '@react-navigation/native';
import { writeReview } from '~/api/review';
import { initialBadgeData } from '~/utils/data';

const marketList: Array<"선택 안함" | "마켓컬리" | "쿠팡프레시" | "SSG" | "B마트" | "윙잇" | "쿠캣마켓"> =
  ["선택 안함", "마켓컬리", "쿠팡프레시", "SSG", "B마트", "윙잇", "쿠캣마켓"];

interface WriteProp {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    type?: "reKnew" | "default",
    review?: ReviewListType
  }>;
}

const Write = ({ navigation, route }: WriteProp) => {
  const [writeData, setWriteData] = useState<WriteReviewType>({
    images: [],
    content: "",
    satisfaction: "",
    market: "선택 안함",
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

  useFocusEffect(
    useCallback(() => {
      if (route.params?.review) {
        setWriteData({
          ...writeData, content: route.params.review.content, satisfaction: route.params.review.satisfaction,
          market: route.params.review.market ? route.params.review.market : "선택 안함", tags: route.params.review.tags
        });
      }
      else {
        setWriteData({
          images: [],
          content: "",
          satisfaction: "",
          market: "선택 안함",
          tags: {
            interest: [],
            household: [],
            taste: []
          }
        });
      }
    }, []));

  const token = useRecoilValue(tokenState);
  const setIspopupOpen = useSetRecoilState(popupState);
  const addReviewMutation = useMutation(["addReview", token],
    (writeProps: WriteReviewType) => writeReview({ token, ...writeProps }), {
    onSuccess: () => {
      queryClient.invalidateQueries("reviewList");
      navigation.goBack();
    }
  });
  const [selectMarket, setIsSelectMarket] = useState(false);

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
    }).then(v => setImageList(imageList.concat(`data:${v.mime};base64,${v.data}`)));
  };
  const handleAddWrite = () => {
    if (writeData.satisfaction === "") {
      setIspopupOpen({ isOpen: true, content: "선호도를 표시해주세요", popupStyle: { bottom: keyboardHeight + h2p(20) } });
      return;
    }
    if (writeData.content === "") {
      setIspopupOpen({ isOpen: true, content: "내용을 입력해주세요", popupStyle: { bottom: keyboardHeight + h2p(20) } });
      return;
    }
    if (writeData.tags.interest.length === 0 ||
      writeData.tags.household.length === 0) {
      setIspopupOpen({ isOpen: true, content: "태그를 선택해주세요", popupStyle: { bottom: keyboardHeight + h2p(20) } });
      return;
    }

    const images = imageList.reduce<Array<{ priority: number, image: string }>>((acc, cur, idx) => {
      acc = acc.concat({ priority: idx, image: cur });
      return acc;
    }, []);
    addReviewMutation.mutate({ ...writeData, images });
  };

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", (e) => {
      if (Platform.OS === "ios") {
        setKeyBoardHeight(e.endCoordinates.height);
      }
      else {
        setKeyBoardHeight(0);
      }
    });
    Keyboard.addListener("keyboardDidHide", (e) => {
      if (Platform.OS === "ios") {
        setKeyBoardHeight(e.endCoordinates.height);
      }
      else {
        setKeyBoardHeight(h2p(20));
      }
    });
  }, []);


  return (
    <>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => {
          navigation.goBack();
        }} imageStyle={{ width: 11, height: 25 }} />}
        title="작성하기"
        headerRightPress={handleAddWrite}
        headerRight={<Text style={[{ color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>완료</Text>} />
      <View style={styles.container}>
        <View style={styles.reviewIconWrap}>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "best" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "best") ? heart : grayheart} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={[{ color: (writeData.satisfaction === "best") ? theme.color.main : theme.color.grayscale.a09ca4, marginLeft: d2p(5) }, FONT.Bold]}>최고에요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "good" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "good") ? circle : graycircle} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={[{ color: (writeData.satisfaction === "good") ? theme.color.yellow : theme.color.grayscale.a09ca4, marginLeft: d2p(5) }, FONT.Bold]}>괜찮아요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "bad" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "bad") ? blackclose : grayclose} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={[{ color: (writeData.satisfaction === "bad") ? theme.color.black : theme.color.grayscale.a09ca4, marginLeft: d2p(5) }, FONT.Bold]}>별로에요</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          ref={inputRef}
          value={writeData.content}
          autoCapitalize="none"
          multiline
          textAlignVertical="top"
          onChangeText={(e) => setWriteData({ ...writeData, content: e })}
          style={[styles.textInput, FONT.Regular]}
          placeholder="내용을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />

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
            <Image source={(writeData.market !== "선택 안함") ? maincart : cart} style={{ width: d2p(14), height: h2p(14), marginRight: d2p(5) }} />
            {selectMarket ?
              <Text style={FONT.Medium}>{writeData.market ? writeData.market : "유통사 선택"}</Text>
              :
              <Text style={FONT.Medium}>유통사 선택</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={pickImage} style={[styles.images, { marginLeft: d2p(20), marginRight: d2p(15) }]}>
            <View style={{ alignItems: "center" }}>
              <Image source={photo} style={{ width: d2p(20), height: h2p(20), marginTop: h2p(12) }} />
              <Text style={[{ fontSize: 12, color: theme.color.grayscale.d3d0d5, marginVertical: h2p(8) }, FONT.Regular]}>{imageList.length}/5</Text>
            </View>
          </Pressable>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {React.Children.toArray(imageList.map((image, idx) => {
              return (
                <View style={[styles.images, { marginRight: (idx === imageList.length - 1) ? d2p(20) : d2p(5) }]}>
                  <View style={{ alignItems: "center" }}>
                    <Image source={{ uri: image }} style={{ width: d2p(96), height: h2p(64), borderRadius: 4 }} />
                    <Pressable onPress={() => setImageList(imageList.filter((_, filterIdx) => idx !== filterIdx))}
                      style={{ position: "absolute", right: 0, top: 0 }}>
                      <Image source={photoClose} style={{ width: d2p(16), height: h2p(16) }} />
                    </Pressable>
                  </View>
                </View>
              );
            }))}
          </ScrollView>
        </View>
      </View >

      {/* 태그 선택 바텀시트 */}
      <RBSheet
        animationType="fade"
        ref={tagRefRBSheet}
        closeOnDragDown
        dragFromTopOnly
        onOpen={() => {

        }}
        height={Dimensions.get("window").height - h2p(264)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: d2p(20),
            paddingVertical: h2p(20)
            // paddingTop: isIphoneX() ? getStatusBarHeight() + d2p(15) : d2p(15),
          }, draggableIcon: {
            display: "none"
          }
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: d2p(10), marginBottom: h2p(34) }}>
          <CloseIcon onPress={() => tagRefRBSheet.current?.close()}
            imageStyle={{ width: d2p(15), height: h2p(15) }} />
          <Text style={[{ fontSize: 16, fontWeight: "bold" }, FONT.Bold]}>태그 선택</Text>
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

      {/* 유통사 선택 바텀시트 */}
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: d2p(30), paddingVertical: h2p(20) }}>
          <CloseIcon onPress={() => marketRefRBSheet.current?.close()}
            imageStyle={{ width: d2p(15), height: h2p(15) }} />
          <Text style={[{ fontSize: 16, fontWeight: "bold" }, FONT.Bold]}>유통사 선택</Text>
          <View />
        </View>
        <ScrollView style={{ paddingHorizontal: d2p(20) }}>
          {React.Children.toArray(marketList.map((market, marketIdx) =>
            <TouchableOpacity
              onPress={() => {
                setIsSelectMarket(true);
                setWriteData({ ...writeData, market });
                marketRefRBSheet.current?.close();
              }}
              style={{
                paddingVertical: h2p(12.5), paddingHorizontal: d2p(10),
                borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc
              }}>
              <Text style={[{ fontWeight: "500" }, FONT.Medium]}>{market}</Text>
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
    flex: 1,
  },
  textInput: {
    paddingHorizontal: d2p(20),
    marginTop: h2p(30),
    paddingTop: 0,
    includeFontPadding: false,
    fontSize: 16,
    color: theme.color.black,
    minHeight: Dimensions.get("window").height * (436 / 760)
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
    marginBottom: h2p(20)
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