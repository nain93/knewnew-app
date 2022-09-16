import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { ReviewListType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import ReviewIcon from '~/components/icon/reviewIcon';

interface ImageRenderItemProps {
  review: ReviewListType,
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
              aspectRatio: 1,
              borderRadius: 10
            }}
            source={{ uri: item.image, priority: "high" }} />
        </Pressable>}
      />
      {review.images.length === 0 ?
        <>
          <ReviewIcon
            type="image"
            viewStyle={{
              position: "absolute",
              left: d2p(20),
              top: h2p(-15),
              backgroundColor: theme.color.white,
              paddingHorizontal: d2p(10),
              paddingVertical: h2p(2),
              width: d2p(82),
              height: h2p(22),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.color.grayscale.eae7ec,
              opacity: 0.9,
            }}
            review={review.satisfaction} />
        </>
        :
        <>
          <ReviewIcon
            type="image"
            viewStyle={{
              position: "absolute",
              left: d2p(30),
              top: h2p(10),
              backgroundColor: theme.color.white,
              paddingHorizontal: d2p(10),
              paddingVertical: h2p(2),
              width: d2p(82),
              height: h2p(22),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.color.grayscale.eae7ec,
              opacity: 0.9
            }}
            review={review.satisfaction} />
        </>
      }

      {(review.images.length || 0) > 1 &&
        <>
          <View style={{
            position: "absolute",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 10.5,
            paddingHorizontal: d2p(5),
            paddingVertical: h2p(2),
            right: d2p(30),
            top: h2p(10),
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
                    marginRight: d2p(10)
                  }} />
                );
              }
              return (
                <View style={{
                  width: d2p(6), height: d2p(6),
                  borderRadius: 6,
                  backgroundColor: theme.color.grayscale.eae7ec,
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