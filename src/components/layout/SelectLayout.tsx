import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { RefObject } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { checkIcon } from '~/assets/icons';
import { InterestTagType } from '~/types';
import { FONT } from '~/styles/fonts';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import ResetButton from '~/components/button/resetButton';

interface SelectLayoutProps {
  interestTag: InterestTagType[];
  setInterestTag: (badgeProp: InterestTagType[]) => void;
  isInitial?: boolean;
  type?: "filter" | "write" | "normal",
  headerComponent?: JSX.Element,
  focusRef: RefObject<TextInput>
}

const SelectLayout = ({ focusRef, headerComponent, isInitial, interestTag, setInterestTag, type = "normal" }: SelectLayoutProps) => {
  const resetIsClick = () => {
    setInterestTag(interestTag.map(v => ({ title: v.title, isClick: false })));
  };

  return (
    <>
      <View
        style={{ position: "relative" }}>
        {headerComponent}
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {React.Children.toArray(interestTag.map((item, idx) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  if (type === "write") {
                    setInterestTag(interestTag.map((v, i) => {
                      if (idx === i) {
                        if (v.title.includes("기타") && !v.isClick) {
                          setTimeout(() => {
                            focusRef.current?.focus();
                          }, 100);
                        }
                        return { ...v, isClick: !v.isClick };
                      }
                      return v;
                    }));
                  }
                  else {
                    setInterestTag(
                      interestTag.map((v, i) => {
                        if (idx === i) {
                          return { ...v, isClick: true };
                        }
                        return { ...v, isClick: false };
                      })
                    );
                  }
                }}
                style={[styles.tags,
                { borderColor: item.isClick ? theme.color.main : theme.color.grayscale.eae7ec }]}>
                {item.isClick &&
                  <Image style={{ width: d2p(10), height: d2p(8), marginRight: d2p(5) }} source={checkIcon} />
                }
                <Text style={[FONT.Medium, { color: item.isClick ? theme.color.main : theme.color.black }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          }))}
        </View>
      </View>
      {isInitial &&
        <ResetButton
          resetClick={resetIsClick}
          viewStyle={{
            position: "absolute", right: d2p(30),
            bottom: headerComponent ? h2p(100) : (isIphoneX() ? getBottomSpace() : h2p(20))
          }}
        />
      }
    </>
  );
};

export default SelectLayout;

const styles = StyleSheet.create({
  guide: {
    marginLeft: d2p(15),
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
  },
  tags: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: d2p(10),
    marginRight: d2p(5),
    paddingVertical: d2p(5),
    paddingHorizontal: d2p(15),
  },
});