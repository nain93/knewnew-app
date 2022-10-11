import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { FONT } from '~/styles/fonts';
import { d2p, h2p } from '~/utils';
import { blackHeart, colorThumbDown, colorThumbUp, colorTriangle, heart, thumbDown, thumbUp, triangle } from '~/assets/icons';
import theme from '~/styles/theme';
import { SatisfactionType } from '~/types/review';

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
      <View style={{
        position: "absolute",
        top: "50%",
        borderTopWidth: 1,
        width: Dimensions.get("window").width - d2p(40)
      }} />
      {React.Children.toArray(clickedReact.map((v, i) => (
        <Pressable
          onPress={() => selectButton(i)}
          style={[styles.reaction, {
            backgroundColor: v.isClick ? theme.color.black : theme.color.white
          }]}>
          {(() => {
            switch (v.title) {
              case "best": {
                return (
                  <>
                    <Image source={v.isClick ? heart : blackHeart} style={{
                      width: d2p(14), height: d2p(13), marginBottom: h2p(7)
                    }} />
                    <Text style={[FONT.SemiBold, {
                      fontSize: 12,
                      color: v.isClick ? theme.color.main : theme.color.black
                    }]}>
                      최고예요
                    </Text>
                  </>
                );
              }
              case "good": {
                return (
                  <>
                    <Image source={v.isClick ? colorThumbUp : thumbUp} style={{
                      width: d2p(13), height: d2p(14), marginBottom: h2p(7)
                    }} />
                    <Text style={[FONT.SemiBold, {
                      fontSize: 12,
                      color: v.isClick ? theme.color.gold : theme.color.black
                    }]}>
                      좋아요
                    </Text>
                  </>
                );
              }
              case "bad": {
                return (
                  <>
                    <Image source={v.isClick ? colorTriangle : triangle} style={{
                      width: d2p(16), height: d2p(14), marginBottom: h2p(7)
                    }} />
                    <Text style={[FONT.SemiBold, {
                      fontSize: 12,
                      color: v.isClick ? "#1ED47D" : theme.color.black
                    }]}>
                      애매해요
                    </Text>
                  </>
                );
              }
              case "question": {
                return (
                  <>
                    <Image source={v.isClick ? colorThumbDown : thumbDown} style={{
                      width: d2p(13), height: d2p(14), marginBottom: h2p(7)
                    }} />
                    <Text style={[FONT.SemiBold, {
                      fontSize: 12,
                      color: v.isClick ? "#907DFF" : theme.color.black
                    }]}>
                      별로예요
                    </Text>
                  </>
                );
              }
              default:
                return null;
            }
          })()}
        </Pressable>
      )))}
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
  reaction: {
    width: (Dimensions.get("window").width - d2p(139)) / 4,
    aspectRatio: 1,
    borderRadius: (Dimensions.get("window").width - d2p(139)) / 4,
    borderWidth: 1, borderColor: theme.color.black,
    marginRight: d2p(33),
    alignItems: "center", justifyContent: "center"
  }
});