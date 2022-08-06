import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { WriteImagesType } from '~/types/review';
import { FONT } from '~/styles/fonts';

interface ImageRenderItemProps {
  data: WriteImagesType[],
  onPress: (openIdx: number) => void;
}

const ImageFlatlist = ({ data, onPress }: ImageRenderItemProps) => {
  const [scrollIdx, setScrollIdx] = useState(0);
  return (
    <View>
      <FlatList
        bounces={false}
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
            borderRadius: 10,
            marginHorizontal: d2p(20),
            borderWidth: 1,
            borderColor: theme.color.grayscale.e9e7ec,
            width: Dimensions.get("window").width - d2p(40),
            aspectRatio: 1,
          }}
        >
          <FastImage
            style={{
              width: Dimensions.get("window").width - d2p(40),
              aspectRatio: 1,
              borderRadius: 10
            }}
            source={{ uri: item.image, priority: "high" }} />
        </Pressable>}
      />

      {(data.length || 0) > 1 &&
        <>
          <View style={{
            marginHorizontal: d2p(15),
            position: "absolute",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 10.5,
            paddingHorizontal: d2p(5),
            paddingVertical: h2p(2),
            right: d2p(10),
            top: h2p(10),
            width: d2p(40),
            height: d2p(20),
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Text style={[FONT.Regular, {
              color: theme.color.white,
              fontSize: 12
            }]}>{scrollIdx + 1} / {data.length}</Text>
          </View>
          <View style={{
            position: "absolute", bottom: h2p(10),
            flexDirection: "row",
            alignSelf: "center"
          }}>
            {React.Children.toArray(data.map((v, i) => {
              if (i === scrollIdx) {
                return (
                  <View style={{
                    width: d2p(6), height: d2p(6),
                    borderRadius: 6,
                    backgroundColor: theme.color.main,
                    marginRight: d2p(10)
                  }} />
                );
              }
              return (
                <View style={{
                  width: d2p(6), height: d2p(6),
                  borderRadius: 6,
                  backgroundColor: theme.color.white,
                  marginRight: d2p(10)
                }} />
              );
            }))}
          </View>
        </>
      }
    </View>
  );
};

export default memo(ImageFlatlist);


const styles = StyleSheet.create({});