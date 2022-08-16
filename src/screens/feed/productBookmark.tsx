import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { hitslop } from '~/utils/constant';
import { FONT } from '~/styles/fonts';
import { bookmark, graybookmark } from '~/assets/icons';
import { ProductListType } from '~/types/product';
import { useMutation, useQueryClient } from 'react-query';
import { productBookmark } from '~/api/product';
import { useRecoilValue } from 'recoil';
import { tokenState } from '~/recoil/atoms';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { useNavigation } from '@react-navigation/native';

interface ProductBookmarkProps {
  product: ProductListType,
  apiBlock: boolean,
  setApiBlock: (isApi: boolean) => void
}

const ProductBookmark = ({ product, setApiBlock, apiBlock }: ProductBookmarkProps) => {
  const navigation = useNavigation<StackNavigationProp>();
  const token = useRecoilValue(tokenState);
  const queryClient = useQueryClient();
  const [isBookmark, setIsBookmark] = useState(false);

  const productBookmarkMutation = useMutation(["productBookmark"], async ({ isBookmarkProp, bookmarkId }: { isBookmarkProp: boolean, bookmarkId: number }) => {
    const bookmarkData = await productBookmark({ token, id: bookmarkId, isBookmark: isBookmarkProp });
    return bookmarkData;
  }, {
    onSuccess: () => {
      // queryClient.invalidateQueries(["myProfile", route.params?.id]);
      // queryClient.invalidateQueries(["userProductBookmark", route.params?.id]);
    },
    onSettled: () => setApiBlock(false)
  });

  useEffect(() => {
    setIsBookmark(product.isBookmark);
  }, []);

  return (
    <Pressable
      onPress={() => navigation.navigate("ProductDetail", { id: product.id })}
      style={{
        marginTop: h2p(30),
        flexDirection: "row",
        alignItems: "center"
      }}>
      <Image
        source={{ uri: product.image }}
        style={{
          width: d2p(70), height: d2p(70),
          borderRadius: 5, borderWidth: 1,
          borderColor: theme.color.grayscale.eae7ec,
          marginRight: d2p(10)
        }}
      />
      <View>
        <View style={{
          flexDirection: "row",
          width: Dimensions.get("window").width - d2p(120),
          alignItems: "center", justifyContent: "space-between"
        }}>
          <Text style={[FONT.Regular, { color: theme.color.grayscale.a09ca4 }]}>
            {product.brand}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (!apiBlock) {
                setApiBlock(true);
                setIsBookmark(!isBookmark);
                productBookmarkMutation.mutate({ bookmarkId: product.id, isBookmarkProp: !isBookmark });
              }
            }}
            hitSlop={hitslop}>
            <Image source={isBookmark ? graybookmark : bookmark} style={{ width: d2p(26), height: d2p(26) }} />
          </TouchableOpacity>
        </View>
        <Text style={[FONT.Bold, { fontSize: 16 }]}>{product.name}</Text>
        <Text style={[FONT.Regular, { marginTop: h2p(9), color: theme.color.grayscale.C_443e49 }]}>
          예상가격 {product.expectedPrice}원
        </Text>
      </View>
    </Pressable>
  );
};

export default ProductBookmark;

const styles = StyleSheet.create({});