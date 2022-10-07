import { Dimensions, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';

interface CategoryLayoutPropType {
  viewStyle?: ViewStyle
  category: {
    title: string,
    isClick: boolean,
  }[],
  setCategory: (cate: {
    title: string,
    isClick: boolean,
  }[]) => void
}

const CategoryLayout = ({ category, setCategory, viewStyle }: CategoryLayoutPropType) => {

  return (
    <View style={[styles.container, viewStyle]}>
      {React.Children.toArray(category.map((v, i) => {
        return (
          <TouchableOpacity
            onPress={() => {
              if (v.title === "전체") {
                setCategory(category.map((clickValue, clickIdx) => {
                  if (clickIdx === i) {
                    return { ...clickValue, isClick: !clickValue.isClick };
                  }
                  else {
                    return { ...clickValue, isClick: false };
                  }
                }));
              }
              else {
                setCategory(category.map((clickValue, clickIdx) => {
                  if (clickIdx === 0) {
                    return { ...clickValue, isClick: false };
                  }
                  else if (clickIdx === i) {
                    return { ...clickValue, isClick: !clickValue.isClick };
                  }
                  else {
                    return clickValue;
                  }
                }));
              }
            }}
            style={[styles.tagWrap, {
              marginRight: i % 4 === 3 ? 0 : d2p(5),
              backgroundColor: v.isClick ? theme.color.black : theme.color.white,
            }]}>
            <Text style={[FONT.Medium, {
              color: v.isClick ? theme.color.white : theme.color.black
            }]}>{v.title}</Text>
          </TouchableOpacity>
        );
      }))}
    </View>
  );
};

export default CategoryLayout;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  tagWrap: {
    borderWidth: 1,
    borderRadius: 30,
    width: (Dimensions.get("window").width - d2p(55)) / 4,
    height: h2p(30),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: h2p(9)
  }
});