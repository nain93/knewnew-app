import { ActivityIndicator, Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { eventImage } from '~/assets/images';
import { d2p, h2p } from '~/utils';
import FastImage from 'react-native-fast-image';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { getBottomSpace, getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationRoute } from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import Modal from "react-native-modal";
import { close } from '~/assets/icons';
import Share from 'react-native-share';
import CheckBoxButton from '~/components/button/checkBoxButton';
import BasicButton from '~/components/button/basicButton';
import { hitslop } from '~/utils/constant';
import { useMutation } from 'react-query';
import { phoneEvent } from '~/api';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { popupState, tokenState } from '~/recoil/atoms';
import axios from 'axios';
import Loading from '~/components/loading';

interface EventPagePropType {
  navigation: NavigationStackProp
  route: NavigationRoute
}

const EventPage = ({ navigation }: EventPagePropType) => {
  const token = useRecoilValue(tokenState);
  const [modalOpen, setModalOpen] = useState(false);
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [number, setNumber] = useState("");
  const setIspopupOpen = useSetRecoilState(popupState);

  const eventMutation = useMutation("eventMutation", (phone: string) =>
    phoneEvent({ token, phone }), {
    onSuccess: () => {
      setModalOpen(false);
      setTimeout(() => {
        //@ts-ignore
        navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
        setIspopupOpen({ isOpen: true, content: "응모가 완료 되었습니다." });
      }, 200);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        setModalOpen(false);
        setTimeout(() => {
          //@ts-ignore
          if (error.response.data[0] === "already submitted") {
            //@ts-ignore
            navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
            setIspopupOpen({ isOpen: true, content: "이미 응모가 완료 되었습니다." });
          }
        }, 200);
      }
    }
  });

  useEffect(() => {
    if (number.length === 10) {
      setNumber(number.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'));
    }
    if (number.length === 13) {
      setNumber(number.replace(/-/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'));
    }
  }, [number]);

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon onBackClick={() => {
          //@ts-ignore
          navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
        }} />}
        title="이벤트"
      />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => setModalOpen(true)}
          style={[styles.button, {
            position: "absolute",
            zIndex: 10,
            left: d2p(30),
            top: isIphoneX() ? h2p(547) - getStatusBarHeight() : h2p(550),
          }]}>
          <Text style={[FONT.Bold, styles.text]}>
            드로우 응모하기
          </Text>
        </Pressable>
        <FastImage source={eventImage}
          resizeMode={"contain"}
          style={{
            width: Dimensions.get("window").width,
            height: isIphoneX() ? h2p(1590) : h2p(1700),
          }} />

        <View style={{
          marginTop: h2p(40),
          alignSelf: "center",
          marginHorizontal: d2p(30),
          marginBottom: getBottomSpace() + h2p(20)
        }}>
          <TouchableOpacity
            onPress={() => setModalOpen(true)}
            style={styles.button}>
            <Text style={[FONT.Bold, styles.text]}>
              드로우 응모하기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Share.open({
                title: "뉴뉴",
                url: __DEV__ ?
                  "https://dlink.knewnew.co.kr/event"
                  :
                  "https://link.knewnew.co.kr/event"
              });
            }}
            style={{
              backgroundColor: theme.color.grayscale.e9e7ec,
              width: Dimensions.get("window").width - d2p(60),
              paddingVertical: h2p(19), borderRadius: 10,
              marginTop: h2p(10)
            }}>
            <Text style={[FONT.Bold, styles.text]}>
              친구에게 공유하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        isVisible={modalOpen}
        style={{ alignItems: "center" }}
        animationIn="fadeIn"
        animationOut="fadeOut"
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setModalOpen(false)}
        backdropTransitionOutTiming={0}
        onBackButtonPress={() => setModalOpen(false)}
      >
        <View style={{
          width: Dimensions.get("window").width - d2p(40),
          backgroundColor: theme.color.white,
          borderRadius: 10,
          height: h2p(250),
        }}>
          <Pressable
            hitSlop={hitslop}
            style={{
              marginRight: d2p(20),
              marginTop: h2p(20),
              marginLeft: "auto"
            }}
            onPress={() => setModalOpen(false)}>
            <Image source={close} style={{ width: d2p(14), height: d2p(14) }} />
          </Pressable>
          <View style={{ paddingHorizontal: d2p(20) }}>
            <Text style={[FONT.Medium, { marginTop: h2p(4), fontSize: 16 }]}>
              연락받으실 휴대폰 번호를 입력해주세요.
            </Text>
            <TextInput
              value={number}
              onChangeText={e => {
                const numberCheck = /^[0-9\b -]{0,13}$/;
                if (numberCheck.test(e)) {
                  setNumber(e);
                }
              }}
              keyboardType="phone-pad"
              placeholder="휴대폰번호 입력"
              placeholderTextColor={theme.color.grayscale.d2d0d5}
              style={[FONT.Regular, {
                borderWidth: 1,
                borderColor: theme.color.grayscale.e9e7ec,
                borderRadius: 5,
                fontSize: 16, color: theme.color.black,
                marginVertical: h2p(10),
                paddingHorizontal: d2p(10),
                paddingVertical: h2p(12)
              }]}
            />
            <Pressable
              onPress={() => setToggleCheckBox(!toggleCheckBox)}
              style={{ flexDirection: "row" }}>
              <CheckBoxButton
                imageStyle={{ width: d2p(16), height: d2p(16) }}
                toggleCheckBox={toggleCheckBox}
                setToggleCheckBox={(toggle: boolean) => setToggleCheckBox(toggle)} />
              <Text style={[FONT.Regular, {
                flexWrap: "wrap",
                width: Dimensions.get('window').width - d2p(100),
                marginLeft: d2p(5), color: theme.color.grayscale.C_9F9CA3
              }]}>
                이벤트 당첨시 개별 연락을 위한 연락처 정보 제공에 동의합니다.
              </Text>
            </Pressable>
          </View>

          <BasicButton
            loading={eventMutation.isLoading}
            disabled={number.length < 12 || !toggleCheckBox}
            onPress={() => {
              eventMutation.mutate(number);
            }}
            text="응모 완료" bgColor={theme.color.main}
            textColor={theme.color.white}
            boxStyle={{ marginTop: "auto", alignSelf: "center", marginBottom: h2p(10) }}
            viewStyle={{ width: Dimensions.get("window").width - d2p(60) }}
          />
        </View>
      </Modal>
    </>
  );
};

export default EventPage;

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.color.black,
    width: Dimensions.get("window").width - d2p(60),
    paddingVertical: h2p(19), borderRadius: 10
  },
  text: {
    textAlign: "center",
    fontSize: 18, color: theme.color.white
  }
});