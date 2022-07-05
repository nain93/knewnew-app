import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationRoute } from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import { getMyProfile } from '~/api/user';
import { handIcon } from '~/assets/icons';
import BasicButton from '~/components/button/basicButton';
import Header from '~/components/header';
import CloseIcon from '~/components/icon/closeIcon';
import Loading from '~/components/loading';
import { tokenState } from '~/recoil/atoms';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { InterestType } from '~/types';
import { MyProfileType } from '~/types/user';
import { d2p, h2p } from '~/utils';

export interface NavigationType {
  navigation: NavigationStackProp;
  route?: NavigationRoute<Array<InterestType>>;
}

const Welcome = ({ navigation, route }: NavigationType) => {
  const [masterBadge, setMasterBadge] = useState("");
  const [badge, setBadge] = useState<Array<string>>();
  const token = useRecoilValue(tokenState);

  const { data, isLoading } = useQuery<MyProfileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token
  });

  const handleSignIn = () => {
    //@ts-ignore
    navigation.reset({ routes: [{ name: "TabNav" }] });
  };

  useEffect(() => {
    if (route?.params) {
      setMasterBadge(route.params.filter(v => v.masterBadge)[0].title);
      setBadge((route?.params.filter(v => !v.masterBadge)).map(v => v.title));
    }
  }, [route?.params]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header isBorder={false}
        headerLeft={<CloseIcon onPress={() => {
          //@ts-ignore
          navigation.reset({ index: 0, routes: [{ name: "TabNav" }] });
        }} />}
      />
      <View style={styles.container}>
        <View style={styles.main}>
          <Text style={[styles.mainText, { color: theme.color.main }, { lineHeight: 28 }, FONT.SemiBold]}>
            {data?.nickname}</Text>
          <Text style={[styles.mainText, { lineHeight: 29 }, FONT.SemiBold]}>님 반가워요!</Text>
        </View>
        <View style={{
          marginBottom: h2p(10),
          justifyContent: "center",
          alignItems: "center",
          width: d2p(96),
          borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
          paddingHorizontal: d2p(15), paddingVertical: h2p(5), height: h2p(28), borderRadius: 14
        }}>
          <Text style={[{ color: theme.color.black }, FONT.Medium]}>{masterBadge}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          {React.Children.toArray(badge?.map(v => <Text style={[styles.tag, FONT.SemiBold]}>#{v} </Text>))}
        </View>
      </View >
      <View style={styles.alertContainer}>
        <Image source={handIcon} style={{ width: d2p(39), height: d2p(39) }} />
        <Text style={[FONT.Bold, { color: theme.color.main, fontSize: 30, marginTop: h2p(5), marginBottom: h2p(10) }]}>
          잠깐!</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={[FONT.Bold, { fontSize: 20 }]}>뉴뉴 시작 전,</Text>
          <Text style={[FONT.Bold, { fontSize: 20, color: theme.color.main }]}> 꼭 </Text>
          <Text style={[FONT.Bold, { fontSize: 20 }]}>읽어주세요!</Text>
        </View>
        <View style={{ marginVertical: h2p(40), marginBottom: "auto" }}>
          <View style={{ flexDirection: "row", marginBottom: h2p(20) }}>
            <Text style={FONT.Regular}>
              뉴뉴는 오로지
            </Text>
            <Text style={FONT.Bold}> 찐소비자</Text>
            <Text style={FONT.Regular}>들을 위한 공간입니다.</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[FONT.Regular, { lineHeight: 20 }]}>광고, 협찬 등 홍보 목적의 활동은 </Text>
            <Text style={[FONT.Bold, { lineHeight: 20 }]}>엄격히 금지</Text>
            <Text style={[FONT.Regular, { lineHeight: 20 }]}>합니다.</Text>
          </View>
          <Text style={[FONT.Regular, { lineHeight: 20 }]}>특히 뒷광고는 표시광고법 제3조 제1항에 의거하여</Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={[FONT.Bold, { lineHeight: 20 }]}>엄연한 불법행위</Text>
            <Text style={[FONT.Regular, { lineHeight: 20 }]}>임을 알려드립니다.</Text>
          </View>
        </View>
        <BasicButton
          viewStyle={{ marginBottom: h2p(40) }}
          onPress={handleSignIn} text="확인하고 입장하기" bgColor={theme.color.main} textColor={theme.color.white} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: d2p(20)
  },
  main: {
    flexDirection: 'row',
    marginBottom: d2p(30),
    marginTop: h2p(83),
    flexWrap: "wrap"
  },
  mainText: {
    fontSize: 26
  },
  tag: {
    color: theme.color.main,
    fontSize: 16
  },
  subText: {
    color: theme.color.grayscale.C_79737e,
    fontSize: 14,
    marginTop: d2p(10), marginBottom: "auto"
  },
  alertContainer: {
    flex: 1,
    backgroundColor: theme.color.grayscale.f7f7fc,
    paddingHorizontal: d2p(20),
    paddingTop: h2p(40),
    marginTop: h2p(60)
  }
});

export default Welcome;
