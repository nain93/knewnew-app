import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { ReviewListType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import LinearGradient from 'react-native-linear-gradient';
import { whiteLeftArrow, whiteMoreIcon } from '~/assets/icons';
import { hitslop } from '~/utils/constant';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { useNavigation } from '@react-navigation/native';

interface ImageRenderItemProps {
  review: ReviewListType;
  onPress: (openIdx: number) => void;
  morePress: () => void;
  path: string
}

const ImageFlatlist = ({ review, onPress, morePress, path }: ImageRenderItemProps) => {
  const navigation = useNavigation<StackNavigationProp>();
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
              colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0)']} />
            <FastImage
              style={{
                aspectRatio: 1,
              }}
              source={{ uri: item.image, priority: "high" }} />
          </Pressable>
        )}
      />

      <View
        style={{
          position: "absolute",
          alignItems: "center",
          width: Dimensions.get("window").width,
          paddingHorizontal: d2p(30),
          marginTop: h2p(30),
          flexDirection: "row", justifyContent: "space-between"
        }}>
        <Pressable
          hitSlop={hitslop}
          onPress={() => {
            if (path) {
              // * 공유하기로 들어와서 뒤로가기 눌렀을 경우 home으로 reset
              //@ts-ignore
              navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
            }
            else {
              navigation.goBack();
            }
          }}>
          <Image source={whiteLeftArrow} style={{ width: d2p(8), height: d2p(16) }} />
        </Pressable>

        <Pressable
          hitSlop={hitslop}
          onPress={morePress}>
          <Image source={whiteMoreIcon} style={{ width: d2p(4), height: d2p(18) }} />
        </Pressable>
      </View>

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