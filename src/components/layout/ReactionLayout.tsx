import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import { FONT } from '~/styles/fonts';
import { d2p, h2p } from '~/utils';
import { circle, graycircle, grayclose, grayheart, grayquestion, heart, question, smallClose } from '~/assets/icons';
import theme from '~/styles/theme';
import { SatisfactionType } from '~/types/review';
import { reactList } from '~/utils/constant';

interface ReactionLayoutProps {
  clickedReact: {
    title: SatisfactionType,
    isClick: boolean
  }[],
  setClickReact: (reactList: {
    title: SatisfactionType,
    isClick: boolean
  }[]) => void,
  multiSelect?: boolean
}

const ReactionLayout = ({ clickedReact, setClickReact, multiSelect = true }: ReactionLayoutProps) => {

  const selectButton = (index: number) => setClickReact(clickedReact.map((v, i) => {
    if (multiSelect) {
      if (i === index) {
        return { title: v.title, isClick: !v.isClick };
      }
      return v;
    }
    else {
      if (i === index) {
        return { title: v.title, isClick: !v.isClick };
      }
      return { title: v.title, isClick: false };
    }
  }));

  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={() => selectButton(0)}
        style={[styles.reactButton, {
          borderColor: clickedReact[0]?.isClick ? theme.color.main : theme.color.grayscale.eae7ec,
        }]}>
        <Image source={clickedReact[0]?.isClick ? heart : grayheart} style={{ width: d2p(20), height: d2p(20), marginBottom: h2p(5) }} />
        <Text style={[FONT.Regular, { color: clickedReact[0]?.isClick ? theme.color.main : theme.color.grayscale.a09ca4 }]}>
          최고예요
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => selectButton(1)}
        style={[styles.reactButton, {
          borderColor: clickedReact[1]?.isClick ? theme.color.grayscale.ffc646 : theme.color.grayscale.eae7ec,
        }]}>
        <Image source={clickedReact[1]?.isClick ? circle : graycircle} style={{ width: d2p(20), height: d2p(20), marginBottom: h2p(5) }} />
        <Text style={[FONT.Regular, {
          color: clickedReact[1]?.isClick ? theme.color.grayscale.ffc646 : theme.color.grayscale.a09ca4
        }]}>
          괜찮아요
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => selectButton(2)}
        style={[styles.reactButton, {
          borderColor: clickedReact[2]?.isClick ? theme.color.black : theme.color.grayscale.eae7ec,
        }]}>
        <Image source={clickedReact[2]?.isClick ? smallClose : grayclose} style={{ width: d2p(20), height: d2p(20), marginBottom: h2p(5) }} />
        <Text style={[FONT.Regular, { color: clickedReact[2]?.isClick ? theme.color.black : theme.color.grayscale.a09ca4 }]}>
          별로예요
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => selectButton(3)}
        style={[styles.reactButton, {
          borderColor: clickedReact[3]?.isClick ? theme.color.grayscale.C_79737e : theme.color.grayscale.eae7ec,
        }]}>
        <Image source={clickedReact[3]?.isClick ? question : grayquestion} style={{ width: d2p(20), height: d2p(20), marginBottom: h2p(5) }} />
        <Text style={[FONT.Regular, { color: clickedReact[3]?.isClick ? theme.color.grayscale.C_79737e : theme.color.grayscale.a09ca4 }]}>
          궁금해요
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReactionLayout;

const styles = StyleSheet.create({
  reactButton: {
    borderWidth: 1, borderRadius: 10,
    width: d2p(70), height: h2p(70),
    justifyContent: "center", alignItems: "center",
    marginRight: d2p(10)
  },
});