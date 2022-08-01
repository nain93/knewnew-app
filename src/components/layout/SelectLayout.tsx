import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { checkIcon } from '~/assets/icons';
import { InterestTagType } from '~/types';
import { FONT } from '~/styles/fonts';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import ResetButton from '~/components/button/resetButton';

interface SelectLayoutProps {
  interestTag: InterestTagType;
  setInterestTag: (badgeProp: InterestTagType) => void;
  isInitial?: boolean;
  type?: "filter" | "write" | "normal",
  headerComponent?: JSX.Element,
  remainingPeriod?: number
  setIsPopupOpen?: (popup: { isOpen: boolean, content: string }) => void
}

const SelectLayout = ({ setIsPopupOpen, remainingPeriod, headerComponent, isInitial, interestTag, setInterestTag, type = "normal" }: SelectLayoutProps) => {
  const resetIsClick = () => {
    setInterestTag({
      interest: interestTag.interest.map(v => ({ title: v.title, isClick: false }))
    });
  };

  return (
    <>
      <ScrollView
        bounces={false}
        style={{ flex: 1, position: "relative" }}
        showsVerticalScrollIndicator={false}>
        {headerComponent}
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.menu, { marginTop: 0 }, FONT.Regular]}>관심사 </Text>
        </View>
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {React.Children.toArray(interestTag.interest.map((item, idx) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  if (type === "write") {
                    setInterestTag({
                      interest: interestTag.interest.map((v, i) => {
                        if (idx === i) {
                          return { ...v, isClick: !v.isClick };
                        }
                        return v;
                      })
                    });
                  }
                  else {
                    setInterestTag({
                      interest: interestTag.interest.map((v, i) => {
                        if (idx === i) {
                          return { ...v, isClick: true };
                        }
                        return { ...v, isClick: false };
                      })
                    });
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
      </ScrollView>
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
  menu: {
    marginTop: h2p(40),
    marginBottom: h2p(5)
  },
  guide: {
    marginLeft: d2p(15),
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
  },
  tags: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: d2p(15), marginRight: d2p(5),
    paddingVertical: d2p(5),
    paddingHorizontal: d2p(15),
  },
});