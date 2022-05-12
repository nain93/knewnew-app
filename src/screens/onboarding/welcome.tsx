import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationRoute } from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import BasicButton from '~/components/button/basicButton';
import theme from '~/styles/theme';
import { InterestType } from '~/types';
import { d2p, h2p } from '~/utils';

export interface NavigationType {
  navigation: NavigationStackProp;
  route?: NavigationRoute<Array<InterestType>>;
}

const Welcome = ({ navigation, route }: NavigationType) => {
  const [masterBadge, setMasterBadge] = useState("");
  const [badge, setBadge] = useState<Array<string>>();

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

  return (
    <View style={styles.container}>
      {/* eslint-disable-next-line react-native/no-raw-text */}
      <Text style={styles.mainText}><Text style={{ color: theme.color.main }}>여지아</Text>님 반가워요!</Text>
      <View style={{
        marginBottom: h2p(10),
        justifyContent: "center",
        alignItems: "center",
        width: d2p(96),
        borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
        paddingHorizontal: d2p(15), paddingVertical: h2p(5), height: h2p(28), borderRadius: 14
      }}>
        <Text style={{ color: theme.color.black, fontWeight: "500" }}>{masterBadge}</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        {React.Children.toArray(badge?.map(v => <Text style={{ color: theme.color.main, fontSize: 16, fontWeight: "600" }}>#{v} </Text>))}
      </View>
      <Text style={{ color: theme.color.grayscale.C_79737e, fontSize: 14, marginTop: d2p(10), marginBottom: "auto" }}>맛있는 정보 함께 나눠요.</Text>
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
  mainText: {
    fontSize: 26,
    fontWeight: '600',
    marginTop: d2p(173), marginBottom: d2p(40),
  }
});

export default Welcome;
