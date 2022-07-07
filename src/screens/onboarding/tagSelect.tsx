import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Pressable, TextInput } from 'react-native';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from "react-navigation-stack";
import { NavigationRoute } from "react-navigation";
import { BadgeType } from '~/types';
import { popupState, tokenState } from '~/recoil/atoms';
import { useSetRecoilState } from 'recoil';
import { UserInfoType } from '~/types/user';
import { FONT } from '~/styles/fonts';
import { initialBadgeData } from '~/utils/data';
import SelectTag from '~/components/selectTag';
import { checkIcon } from '~/assets/icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface BadgeSelectProps {
  navigation: NavigationStackProp
  route: NavigationRoute<UserInfoType>;
}

const TagSelect = ({ route, navigation }: BadgeSelectProps) => {
  const [userInfo, setUserInfo] = useState<UserInfoType>();
  const [userBadge, setUserBadge] = useState<BadgeType>(initialBadgeData);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [dataSourceCords, setDataSourceCords] = useState<number[]>([]);
  const [isStepFocus, setIsStepFocus] = useState({
    step2: false,
    step3: false
  });

  const setToken = useSetRecoilState(tokenState);
  const setIspopupOpen = useSetRecoilState(popupState);

  const handleNext = async () => {
    // if (userBadge.household.every(v => !v.isClick) ||
    //   userBadge.interest.every(v => !v.isClick)) {
    //   setIspopupOpen({ isOpen: true, content: "관심사(or가족구성)을 선택해주세요" });
    //   return;
    // }
    // const copy: { [index: string]: Array<{ isClick: boolean, title: string }> } = { ...userBadge };
    // const badge = Object.keys(userBadge).reduce<Array<{ isClick: boolean, title: string }>>((acc, cur) => {
    //   acc = acc.concat(copy[cur].filter(v => v.isClick));
    //   return acc;
    // }, []);
    // if (badge.length > 10) {
    //   setIspopupOpen({ isOpen: true, content: "태그는 10개까지만 선택할 수 있어요" });
    //   return;
    // }
    // todo 유효성 체크, 회원가입, 토큰 설정 
    navigation.navigate("Welcome", {
      userBadge: {
        foodLife: userBadge.foodLife.filter(v => v.isClick)[0].title,
        lifeStyle: userBadge.lifeStyle.filter(v => v.isClick)[0].title,
        household: userBadge.household.filter(v => v.isClick)[0].title
      }, userInfo
    });
  };

  useEffect(() => {
    setUserInfo(route.params);
  }, [route.params]);


  return (
    <KeyboardAwareScrollView
      ref={scrollRef}
      style={styles.container}
      // contentContainerStyle={{ flex: 1 }}
      showsVerticalScrollIndicator={false} >
      <View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: h2p(30) }}>
          <Text style={[FONT.SemiBold, { fontSize: 26, color: theme.color.main }]}>
            {userInfo?.nickname}</Text>
          <Text style={[FONT.SemiBold, { fontSize: 26 }]}>님</Text>
          <Text style={[FONT.SemiBold, { fontSize: 26 }]}> 반가워요!</Text>
        </View>
        <Text style={[FONT.Bold, { marginTop: h2p(40) }]}>
          슬기로운 뉴뉴생활을 위해 나를 소개해주세요.
        </Text>
        <Text style={[FONT.Regular, { marginTop: h2p(20) }]}>
          {`작성하신 정보는 다른 유저들에게 보여지며,
7일에 한 번 마이페이지에서 수정할 수 있습니다.`}
        </Text>
      </View>
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
              {React.Children.toArray(userBadge.foodLife.map((badge, badgeIdx) => (
                <Pressable onPress={() => {
                  setUserBadge({
                    ...userBadge, foodLife: userBadge.foodLife.map((v, i) => {
                      if (badgeIdx === i) {
                        return { ...v, isClick: true };
                      }
                      return { ...v, isClick: false };
                    })
                  });
                  scrollRef.current?.scrollToPosition(0, dataSourceCords[1], true);
                  setIsStepFocus({ ...isStepFocus, step2: true });
                }}>
                  <SelectTag viewStyle={{ paddingVertical: h2p(5) }} name={badge.title} isSelected={badge.isClick} />
                </Pressable>
              )))}
            </View>
          </View>
          {
            !userBadge.foodLife.every(v => !v.isClick) &&
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
            <Text style={[FONT.Bold, { fontSize: 16, color: isStepFocus.step2 ? theme.color.grayscale.C_443e49 : theme.color.grayscale.eae7ec }]}>
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
                  scrollRef.current?.scrollToPosition(0, dataSourceCords[2], true);
                  setIsStepFocus({ ...isStepFocus, step3: true });
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
        style={[styles.select, { marginTop: h2p(10), marginBottom: h2p(40) }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={[FONT.Bold, styles.step]}>Step.3</Text>
          <View>
            <Text style={[FONT.Bold, { fontSize: 16, color: isStepFocus.step3 ? theme.color.grayscale.C_443e49 : theme.color.grayscale.eae7ec }]}>
              무슨 일을 하시나요?
            </Text>
            <View style={{ paddingTop: h2p(10) }}>
              {React.Children.toArray(userBadge.lifeStyle.map((badge, badgeIdx) => (
                <>
                  <Pressable onPress={() => {
                    setUserBadge({
                      ...userBadge, lifeStyle: userBadge.lifeStyle.map((v, i) => {
                        if (badgeIdx === i) {
                          return { ...v, isClick: true };
                        }
                        if (v.content) {
                          return { ...v, isClick: false, content: "" };
                        }
                        return { ...v, isClick: false };
                      })
                    });
                  }}>
                    <SelectTag viewStyle={{ paddingVertical: h2p(5) }} name={badge.title} isSelected={badge.isClick} />
                  </Pressable>
                  {badge.title === "기타" &&
                    <TextInput
                      autoCapitalize="none"
                      placeholder="직접 입력해주세요" placeholderTextColor={theme.color.grayscale.d3d0d5}
                      value={badge.content}
                      onChangeText={(e) => {
                        setUserBadge({
                          ...userBadge, lifeStyle: userBadge.lifeStyle.map((v) => {
                            if (v.title === "기타") {
                              return { ...v, content: e, isClick: true };
                            }
                            return { ...v, isClick: false };
                          })
                        });
                      }}
                      style={{
                        marginTop: h2p(5),
                        width: Dimensions.get("window").width - d2p(140),
                        paddingVertical: h2p(6),
                        borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec
                      }}
                    />
                  }
                </>
              )))}
            </View>
          </View>
          {
            (!userBadge.lifeStyle.every(v => !v.isClick) && userBadge.lifeStyle.every(v => {
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
      <BasicButton onPress={handleNext} text="다음으로" bgColor={theme.color.white}
        textColor={theme.color.main}
        viewStyle={{ marginBottom: h2p(40) }} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: d2p(20)
  },
  title: {
    color: theme.color.black,
    fontSize: 26,
    includeFontPadding: false,
  },
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

export default TagSelect;