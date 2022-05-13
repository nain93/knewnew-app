import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import Header from '~/components/header';
import theme from '~/styles/theme';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { BadgeType, NavigationType } from '~/types';
import { cart, grayclose, grayheart, graytriangle, tag } from '~/assets/icons';
import { photo, photoClose } from '~/assets/images';
import { d2p, h2p } from '~/utils';

import ImageCropPicker from 'react-native-image-crop-picker';
import RBSheet from "react-native-raw-bottom-sheet";
import SelectLayout from '~/components/selectLayout';
import CloseIcon from '~/components/icon/closeIcon';

const marketList = ["선택 안함", "마켓컬리", "쿠팡프레시", "SSG", "B마트", "윙잇", "쿠캣마켓"];

const Write = ({ navigation }: NavigationType) => {
  const [writeData, setWriteData] = useState<{ name: string, content: string }>({
    name: "",
    content: ""
  });
  const [userBadge, setUserBadge] = useState<BadgeType>({
    interest: [],
    household: [],
    taste: []
  });
  const inputRef = useRef<TextInput>(null);
  const tagRefRBSheet = useRef<RBSheet>(null);
  const marketRefRBSheet = useRef<RBSheet>(null);
  const [imageList, setImageList] = useState<string[]>([]);

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

  return (
    <>
      <Header
        isBorder={false}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} imageStyle={{ width: 11, height: 25 }} />}
        title="작성하기"
        headerRight={
          <TouchableOpacity>
            <Text style={{ color: theme.color.grayscale.a09ca4 }}>완료</Text>
          </TouchableOpacity>
        } />
      <View style={styles.container}>
        <View style={styles.reviewIconWrap}>
          <TouchableOpacity style={styles.reviewIcon}>
            <Image source={grayheart} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={{ color: theme.color.grayscale.a09ca4, marginLeft: d2p(5) }}>최고에요</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reviewIcon}>
            <Image source={graytriangle} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={{ color: theme.color.grayscale.a09ca4, marginLeft: d2p(5) }}>그저그래요</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reviewIcon}>
            <Image source={grayclose} style={{ width: d2p(20), height: h2p(20) }} />
            <Text style={{ color: theme.color.grayscale.a09ca4, marginLeft: d2p(5) }}>별로에요</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          ref={inputRef}
          value={writeData.content}
          autoCapitalize="none"
          multiline
          textAlignVertical="top"
          onChangeText={(e) => setWriteData({ ...writeData, content: e })}
          style={styles.textInput}
          placeholder="내용을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />

        <View style={styles.selectWrap}>
          <TouchableOpacity
            onPress={() => tagRefRBSheet.current?.open()}
            style={[styles.select, { marginRight: d2p(10) }]}>
            <Image source={tag} style={{ width: d2p(14), height: h2p(14), marginRight: d2p(5) }} />
            <Text>태그 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => marketRefRBSheet.current?.open()}
            style={styles.select}>
            <Image source={cart} style={{ width: d2p(14), height: h2p(14), marginRight: d2p(5) }} />
            <Text>유통사 선택</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={pickImage} style={[styles.images, { marginLeft: d2p(20), marginRight: d2p(15) }]}>
            <View style={{ alignItems: "center" }}>
              <Image source={photo} style={{ width: d2p(20), height: h2p(20), marginTop: h2p(12) }} />
              <Text style={{ fontSize: 12, color: theme.color.placeholder, marginVertical: h2p(8) }}>{imageList.length}/5</Text>
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
        height={Dimensions.get("window").height - d2p(264)}
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
          <CloseIcon onPress={() => tagRefRBSheet.current?.close()}
            imageStyle={{ width: d2p(15), height: h2p(15) }} />
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>태그 선택</Text>
          <TouchableOpacity onPress={() => {
            // todo 태그 상태 적용
            tagRefRBSheet.current?.close();
          }}>
            <Text style={{ color: theme.color.grayscale.ff5d5d }}>완료</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: d2p(20), marginTop: h2p(14) }}>
          <SelectLayout isInitial={true} userBadge={userBadge} setUserBadge={setUserBadge} />
        </View>
      </RBSheet>

      {/* 유통사 선택 바텀시트 */}
      <RBSheet
        animationType="fade"
        ref={marketRefRBSheet}
        closeOnDragDown
        dragFromTopOnly
        height={Dimensions.get("window").height - d2p(380)}
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
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>유통사 선택</Text>
          <View />
        </View>
        <ScrollView style={{ paddingHorizontal: d2p(20) }}>
          {React.Children.toArray(marketList.map((market, marketIdx) =>
            <TouchableOpacity
              onPress={() => {
                marketRefRBSheet.current?.close();
              }}
              style={{
                paddingVertical: h2p(12.5), paddingHorizontal: d2p(10),
                borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc
              }}>
              <Text style={{ fontWeight: "500" }}>{market}</Text>
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