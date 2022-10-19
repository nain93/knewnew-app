import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { ReviewListType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import LinearGradient from 'react-native-linear-gradient';

interface ImageRenderItemProps {
  review: ReviewListType;
  onPress: (openIdx: number) => void;
}

const ImageFlatlist = ({ review, onPress }: ImageRenderItemProps) => {
  const [scrollIdx, setScrollIdx] = useState(0);

  return (
    <View>
      <FlatList
        bounces={false}
        data={review.images}
        horizontal
        pagingEnabled
        onScroll={e => {
          setScrollIdx(Math.min(
            review.images.length ?? 0,
            Math.max(0, Math.round(e.nativeEvent.contentOffset.x / (Dimensions.get("window").width - d2p(30))))));
        }}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(v) => String(v.id)}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onPress(index)}
            style={{
              width: Dimensions.get("window").width,
              aspectRatio: 1,
            }}
          >
            <LinearGradient
              style={{
                zIndex: 1,
                width: Dimensions.get("window").width,
                aspectRatio: 2,
                position: "absolute"
              }}
              colors={['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0)']} />
            <FastImage
              style={{
                aspectRatio: 1,
              }}
              source={{ uri: item.image, priority: "high" }} />
          </Pressable>
        )}
      />

      {(review.images.length || 0) > 1 &&
        <>
          <View style={{
            position: "absolute",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 10.5,
            paddingHorizontal: d2p(5),
            paddingVertical: h2p(2),
            right: d2p(20),
            bottom: h2p(15),
            width: d2p(40),
            height: d2p(20),
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Text style={[FONT.Regular, {
              color: theme.color.white,
              fontSize: 12
            }]}>{scrollIdx + 1} / {review.images.length}</Text>
          </View>
          <View style={{
            position: "absolute", bottom: h2p(10),
            flexDirection: "row",
            alignSelf: "center"
          }}>
            {React.Children.toArray(review.images.map((v, i) => {
              if (i === scrollIdx) {
                return (
                  <View style={{
                    width: d2p(6), height: d2p(6),
                    borderRadius: 6,
                    backgroundColor: theme.color.main,
                    marginRight: d2p(5)
                  }} />
                );
              }
              return (
                <View style={{
                  width: d2p(6), height: d2p(6),
                  borderRadius: 6,
                  backgroundColor: theme.color.white,
                  marginRight: d2p(5)
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