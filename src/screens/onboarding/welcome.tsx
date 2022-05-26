import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationRoute } from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import { getMyProfile } from '~/api/user';
import BasicButton from '~/components/button/basicButton';
import Loading from '~/components/loading';
import { tokenState } from '~/recoil/atoms';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { InterestType } from '~/types';
import { MyPrfoileType } from '~/types/user';
import { d2p, h2p } from '~/utils';

export interface NavigationType {
  navigation: NavigationStackProp;
  route?: NavigationRoute<Array<InterestType>>;
}

const Welcome = ({ navigation, route }: NavigationType) => {
  const [masterBadge, setMasterBadge] = useState("");
  const [badge, setBadge] = useState<Array<string>>();
  const token = useRecoilValue(tokenState);

  const { data, isLoading } = useQuery<MyPrfoileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token
  });

  const handleSignIn = () => {
    // todo sigin api 연결
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
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={[styles.mainText, { color: theme.color.main }, { lineHeight: 28 }, FONT.SemiBold]}>{data?.nickname}</Text>
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
        <Text style={[{ color: theme.color.black, fontWeight: "500" }, FONT.Medium]}>{masterBadge}</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        {React.Children.toArray(badge?.map(v => <Text style={[styles.tag, FONT.SemiBold]}>#{v} </Text>))}
      </View>
      <Text style={[styles.subText, FONT.Regular]}>맛있는 정보 함께 나눠요.</Text>
      <BasicButton onPress={handleSignIn} text="입장하기" bgColor={theme.color.main} textColor={theme.color.white} />
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: d2p(40),
    paddingHorizontal: d2p(20)
  },
  main: {
    flexDirection: 'row',
    marginTop: d2p(173), marginBottom: d2p(40),
  },
  mainText: {
    fontSize: 26,
    fontWeight: '600',
  },
  tag: {
    color: theme.color.main,
    fontSize: 16, fontWeight: "600"
  },
  subText: {
    color: theme.color.grayscale.C_79737e,
    fontSize: 14,
    marginTop: d2p(10), marginBottom: "auto"
  }
});

export default Welcome;
