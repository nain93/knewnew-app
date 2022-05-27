import {
  Dimensions, Image, Keyboard, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import theme from '~/styles/theme';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { blackclose, cart, circle, graycircle, grayclose, grayheart, heart } from '~/assets/icons';
import { photo, photoClose } from '~/assets/images';
import { d2p, h2p } from '~/utils';

import ImageCropPicker from 'react-native-image-crop-picker';
import { useMutation, useQuery } from 'react-query';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { popupState, tokenState } from '~/recoil/atoms';
import { ReviewListType, WriteReviewType } from '~/types/review';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import FeedReview from '~/components/review/feedReview';
import { MyPrfoileType } from '~/types/user';
import { getMyProfile } from '~/api/user';
import { writeReview } from '~/api/review';


interface ReKnewProp {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    review: ReviewListType,
    nickname: string,
    filterBadge: string
  }>;
}

const ReKnewWrite = ({ navigation, route }: ReKnewProp) => {
  const [writeData, setWriteData] = useState<WriteReviewType>({
    images: [],
    content: "",
    satisfaction: "",
    market: "선택 안함",
    parent: route.params?.review.id,
    tags: {
      interest: [],
      household: [],
      taste: []
    }
  });

  const [imageList, setImageList] = useState<string[]>([]);
  const [keyboardHeight, setKeyBoardHeight] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<TextInput>(null);
  const token = useRecoilValue(tokenState);
  const setIspopupOpen = useSetRecoilState(popupState);
  const addReviewMutation = useMutation(["addReview", token],
    (writeProps: WriteReviewType) => writeReview({ token, ...writeProps }), {
    onSuccess: (data) => {
      navigation.goBack();
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
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()}
          imageStyle={{ width: 11, height: 25 }} />}
        title="작성하기"
        headerRightPress={handleAddWrite}
        headerRight={<Text style={{ color: theme.color.grayscale.a09ca4 }}>완료</Text>} />
      <View style={styles.container}>
        <View style={styles.reviewIconWrap}>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "best" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "best") ? heart : grayheart} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={{ color: (writeData.satisfaction === "best") ? theme.color.main : theme.color.grayscale.a09ca4, marginLeft: d2p(5) }}>최고에요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "good" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "good") ? circle : graycircle} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={{ color: (writeData.satisfaction === "good") ? theme.color.yellow : theme.color.grayscale.a09ca4, marginLeft: d2p(5) }}>괜찮아요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWriteData({ ...writeData, satisfaction: "bad" })}
            style={styles.reviewIcon}>
            <Image source={(writeData.satisfaction === "bad") ? blackclose : grayclose} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={{ color: (writeData.satisfaction === "bad") ? theme.color.black : theme.color.grayscale.a09ca4, marginLeft: d2p(5) }}>별로에요</Text>
          </TouchableOpacity>
        </View>
        {/* height: h2p(506), */}
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: h2p(30), paddingHorizontal: d2p(20) }}>
          <Text style={{ color: theme.color.grayscale.C_443e49 }}>이 글을 인용하고 있어요.</Text>
          <View style={{
            borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
            paddingHorizontal: d2p(15),
            paddingTop: h2p(15),
            paddingBottom: h2p(10),
            marginVertical: h2p(15),
            borderRadius: 5,
          }}>
            {route.params &&
              <FeedReview
                filterBadge={route.params.filterBadge}
                setSelectedIndex={setSelectedIndex}
                type="reKnewWrite" review={route.params?.review} />
            }
          </View>
          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={{ height: h2p(295) }}>
            <TextInput
              value={writeData.content}
              onChangeText={(e) => setWriteData({ ...writeData, content: e })}
              autoCapitalize="none"
              ref={inputRef}
              multiline
              placeholder={`${route.params?.nickname}님은 어떻게 생각하세요?`}
              placeholderTextColor={theme.color.grayscale.a09ca4}
              style={{ paddingTop: 0, fontSize: 16 }} />
          </Pressable>
        </ScrollView>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={pickImage} style={[styles.images, { marginLeft: d2p(20), marginRight: d2p(15) }]}>
            <View style={{ alignItems: "center" }}>
              <Image source={photo} style={{ width: d2p(20), height: h2p(20), marginTop: h2p(12) }} />
              <Text style={{ fontSize: 12, color: theme.color.grayscale.d3d0d5, marginVertical: h2p(8) }}>{imageList.length}/5</Text>
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
    </>
  );
};

export default ReKnewWrite;

const styles = StyleSheet.create({
  container: {
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
  images: {
    width: d2p(96),
    height: h2p(64),
    borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 4
  }
});
