import { Dimensions, Image, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import React, { useRef, useState } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { checkIcon } from '~/assets/icons';
import SelectTag from '~/components/selectTag';
import { BadgeType } from '~/types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface UserTagLayoutProp {
  userBadge: BadgeType,
  setUserBadge: (badge: BadgeType) => void,
  scrollRef: React.RefObject<KeyboardAwareScrollView>
  viewStyle?: ViewStyle
}

const UserTagLayout = ({ viewStyle, scrollRef, userBadge, setUserBadge }: UserTagLayoutProp) => {
  const [dataSourceCords, setDataSourceCords] = useState<number[]>([]);
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={{ paddingTop: h2p(40), ...viewStyle }}>
      <Text style={FONT.Bold}>
        슬기로운 뉴뉴생활을 위해 나를 소개해주세요.
      </Text>
      <Text style={[FONT.Regular, { marginTop: h2p(20) }]}>
        {`작성하신 정보는 다른 유저들에게 보여지며,
7일에 한 번 마이페이지에서 수정할 수 있습니다.`}
      </Text>
      <View
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          dataSourceCords[0] = layout.y;
          setDataSourceCords(dataSourceCords);
        }}
        style={[styles.select, { marginTop: h2p(30) }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={[FONT.Bold, styles.step]}>Step.1</Text>
          <View>
            <Text style={[FONT.Bold, { fontSize: 16, color: theme.color.grayscale.C_443e49 }]}>
              푸드 스타일을 알려주세요!
            </Text>
            <View style={{ paddingTop: h2p(10) }}>
              {React.Children.toArray(userBadge.foodStyle.map((badge, badgeIdx) => (
                <Pressable onPress={() => {
                  setUserBadge({
                    ...userBadge, foodStyle: userBadge.foodStyle.map((v, i) => {
                      if (badgeIdx === i) {
                        return { ...v, isClick: true };
                      }
                      return { ...v, isClick: false };
                    })
                  });
                  if (userBadge.foodStyle.every(v => !v.isClick)) {
                    scrollRef.current?.scrollToPosition(0, dataSourceCords[1], true);
                  }
                }}>
                  <SelectTag viewStyle={{ paddingVertical: h2p(5) }} name={badge.title} isSelected={badge.isClick} />
                </Pressable>
              )))}
            </View>
          </View>
          {
            !userBadge.foodStyle.every(v => !v.isClick) &&
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto" }}>
              <Image source={checkIcon} style={{ width: d2p(10), height: d2p(8), marginRight: d2p(5) }} />
              <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.main }]}>완료</Text>
            </View>
          }
        </View>
      </View>
      <View
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          dataSourceCords[1] = layout.y;
          setDataSourceCords(dataSourceCords);
        }}
        style={[styles.select, { marginTop: h2p(10) }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={[FONT.Bold, styles.step]}>Step.2</Text>
          <View>
            <Text style={[FONT.Bold, { fontSize: 16, color: theme.color.grayscale.C_443e49 }]}>
              몇명이서 살고 계신가요?
            </Text>
            <View style={{ paddingTop: h2p(10) }}>
              {React.Children.toArray(userBadge.household.map((badge, badgeIdx) => (
                <Pressable onPress={() => {
                  setUserBadge({
                    ...userBadge, household: userBadge.household.map((v, i) => {
                      if (badgeIdx === i) {
                        return { ...v, isClick: true };
                      }
                      return { ...v, isClick: false };
                    })
                  });
                  if (userBadge.household.every(v => !v.isClick)) {
                    scrollRef.current?.scrollToPosition(0, dataSourceCords[2], true);
                  }
                }}>
                  <SelectTag viewStyle={{ paddingVertical: h2p(5) }} name={badge.title} isSelected={badge.isClick} />
                </Pressable>
              )))}
            </View>
          </View>
          {
            !userBadge.household.every(v => !v.isClick) &&
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto" }}>
              <Image source={checkIcon} style={{ width: d2p(10), height: d2p(8), marginRight: d2p(5) }} />
              <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.main }]}>완료</Text>
            </View>
          }
        </View>
      </View>
      <View
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          dataSourceCords[2] = layout.y;
          setDataSourceCords(dataSourceCords);
        }}
        style={[styles.select, { marginTop: h2p(10) }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={[FONT.Bold, styles.step]}>Step.3</Text>
          <View>
            <Text style={[FONT.Bold, { fontSize: 16, color: theme.color.grayscale.C_443e49 }]}>
              무슨 일을 하시나요?
            </Text>
            <View style={{ paddingTop: h2p(10) }}>
              {React.Children.toArray(userBadge.occupation.map((badge, badgeIdx) => (
                <>
                  <Pressable onPress={() => {
                    setUserBadge({
                      ...userBadge, occupation: userBadge.occupation.map((v, i) => {
                        if (badgeIdx === i) {
                          return { ...v, isClick: true };
                        }
                        if (v.content) {
                          return { ...v, isClick: false, content: "" };
                        }
                        return { ...v, isClick: false };
                      })
                    });
                    if (badge.title === "기타") {
                      inputRef.current?.focus();
                    }
                    else {
                      if (userBadge.occupation.every(v => !v.isClick)) {
                        scrollRef.current?.scrollToEnd();
                      }
                    }
                  }}>
                    <SelectTag viewStyle={{ paddingVertical: h2p(5) }} name={badge.title} isSelected={badge.isClick} />
                  </Pressable>
                  {badge.title === "기타" &&
                    <TextInput
                      ref={inputRef}
                      autoCapitalize="none"
                      placeholder="직접 입력해주세요" placeholderTextColor={theme.color.grayscale.d3d0d5}
                      value={badge.content}
                      onChangeText={(e) => {
                        setUserBadge({
                          ...userBadge, occupation: userBadge.occupation.map((v) => {
                            if (v.title === "기타") {
                              return { ...v, content: e, isClick: true };
                            }
                            return { ...v, isClick: false };
                          })
                        });
                      }}
                      style={[FONT.Regular, {
                        marginTop: h2p(5),
                        color: theme.color.black,
                        width: Dimensions.get("window").width - d2p(140),
                        paddingVertical: h2p(6),
                        borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec
                      }]}
                    />
                  }
                </>
              )))}
            </View>
          </View>
          {
            (!userBadge.occupation.every(v => !v.isClick) && userBadge.occupation.every(v => {
              if (v.title === "기타" && v.isClick && !v.content) {
                return false;
              }
              return true;
            })) &&
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto" }}>
              <Image source={checkIcon} style={{ width: d2p(10), height: d2p(8), marginRight: d2p(5) }} />
              <Text style={[FONT.Bold, { fontSize: 12, color: theme.color.main }]}>완료</Text>
            </View>
          }
        </View>
      </View>
    </View>
  );
};

export default UserTagLayout;

const styles = StyleSheet.create({
  select: {
    width: Dimensions.get("window").width - d2p(40),
    borderColor: theme.color.grayscale.f7f7fc,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: h2p(50),
    paddingHorizontal: d2p(20),
    paddingVertical: h2p(15)
  },
  step: {
    fontSize: 12,
    color: theme.color.grayscale.C_443e49,
    marginRight: d2p(17),
    marginTop: h2p(2)
  }
});