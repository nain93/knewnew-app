import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { WriteImagesType } from '~/types/review';

interface ImageRenderItemProps {
  data: WriteImagesType[],
  onPress: (openIdx: number) => void;
}

const ImageFlatlist = ({ data, onPress }: ImageRenderItemProps) => {
  const [scrollIdx, setScrollIdx] = useState(0);
  return (
    <View>
      <FlatList
        data={data}
        horizontal
        pagingEnabled
        onScroll={e => {
          setScrollIdx(Math.min(
            data.length ?? 0,
            Math.max(0, Math.round(e.nativeEvent.contentOffset.x / (Dimensions.get("window").width - d2p(30))))));
        }}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(v) => String(v.id)}
        renderItem={({ item, index }) => <Pressable
          onPress={() => onPress(index)}
          style={{
            aspectRatio: 1.7,
            height: h2p(180),
            borderRadius: 18,
            marginHorizontal: d2p(15),
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec,
            width: Dimensions.get('window').width - d2p(30),
          }}
        >
          <FastImage
            style={{
              width: Dimensions.get('window').width - d2p(30),
              height: "100%",
              borderRadius: 18
            }}
            source={{ uri: item.image, priority: "high" }} />
        </Pressable>}
      />

      {(data.length || 0) > 1 &&
        <View style={{
          marginHorizontal: d2p(15),
          position: "absolute", backgroundColor: theme.color.white.concat("bb"),
          borderRadius: 5,
          paddingHorizontal: d2p(5),
          paddingVertical: h2p(2),
          right: d2p(10), bottom: d2p(10),
          borderWidth: 1,
          borderColor: theme.color.grayscale.e9e7ec
        }}>
          <Text>{scrollIdx + 1} / {data.length}</Text>
        </View>
      }
    </View>
  );
};


export default memo(ImageFlatlist);

const styles = StyleSheet.create({});