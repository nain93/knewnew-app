import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import Header from '~/components/header';
import theme from '~/styles/theme';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationType } from '~/types';

import { d2p, h2p } from '~/utils';
import ReviewIcon from '~/components/icon/reviewIcon';
import ImageCropPicker from 'react-native-image-crop-picker';
import { photo, photoClose } from '~/assets/images';

const Write = ({ navigation }: NavigationType) => {
  const [writeData, setWriteData] = useState<{ name: string, content: string }>({
    name: "",
    content: ""
  });
  const inputRef = useRef<TextInput>(null);
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
        <View style={styles.textInputWrap}>
          <TextInput value={writeData.name}
            autoCapitalize="none"
            multiline
            onChangeText={(e) => setWriteData({ ...writeData, name: e })}
            style={{ fontSize: 16, paddingBottom: h2p(14.5), paddingTop: h2p(14.5), width: Dimensions.get("window").width - d2p(40) }}
            placeholder="상품명을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={{ flexDirection: "row", minHeight: h2p(360) }}>
            <TextInput
              ref={inputRef}
              value={writeData.content}
              autoCapitalize="none"
              multiline
              textAlignVertical="top"
              onChangeText={(e) => setWriteData({ ...writeData, content: e })}
              style={{ paddingBottom: h2p(14.5), paddingTop: h2p(14.5), maxHeight: h2p(360), fontSize: 16, includeFontPadding: false }}
              placeholder="내용을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
            {!writeData?.content &&
              <Text style={{ fontSize: 12, color: theme.color.main, marginTop: h2p(14.5) }}> (필수)</Text>}
          </Pressable>
        </View>
        <View style={styles.reviewIconWrap}>
          <ReviewIcon imageStyle={{ ...styles.reviewIcon, marginLeft: d2p(8) }} review="heart" />
          <ReviewIcon imageStyle={styles.reviewIcon} review="triangle" />
          <ReviewIcon imageStyle={styles.reviewIcon} review="close" />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={pickImage} style={[styles.images, { marginLeft: d2p(20), marginRight: d2p(15) }]}>
            <View style={{ alignItems: "center" }}>
              <Image source={photo} style={{ width: d2p(20), height: h2p(20), marginTop: h2p(12) }} />
              <Text style={{ fontSize: 12, color: theme.color.placeholder, marginVertical: h2p(8) }}>{imageList.length}/5</Text>
            </View>
          </Pressable>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageWrap}>
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

export default Write;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputWrap: {
    paddingHorizontal: d2p(20),
    marginTop: h2p(22.5)
  },
  reviewIconWrap: {
    height: h2p(60),
    paddingVertical: h2p(9.5),
    paddingHorizontal: d2p(20),
    flexDirection: "row"
  },
  reviewIcon: {
    width: 40, height: 40,
    marginRight: d2p(15),
  },
  imageWrap: {
    paddingVertical: h2p(19.5),
  },
  images: {
    width: d2p(96),
    height: h2p(64),
    borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 4
  }
});