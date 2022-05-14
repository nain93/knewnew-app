import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '~/components/header';
import { MyPrfoileType, NavigationType } from '~/types';
import { d2p, h2p } from '~/utils';
import { write } from '~/assets/icons';
import theme from '~/styles/theme';
import { tokenState } from '~/recoil/atoms';
import { getMyProfile } from '~/api/user';
import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import MypageTabView from '~/screens/mypage/tabview';

const Mypage = ({ navigation }: NavigationType) => {
  const token = useRecoilValue(tokenState);
  const getMyProfileQuery = useQuery<MyPrfoileType, Error>(["myProfile", token], () => getMyProfile(token), {
    enabled: !!token
  });
  const [profile, setProfile] = useState<MyPrfoileType>();

  useEffect(() => {
    if (getMyProfileQuery.data) {
      setProfile(getMyProfileQuery.data);
    }
  }, [getMyProfileQuery.data]);

  return (
    <>
      <Header
        title="마이페이지"
        headerRight={<Image source={write} style={{ width: d2p(15), height: h2p(15) }} />}
        headerRightPress={() => navigation.navigate("editProfile")}
      />
      <View style={styles.container}>
        <View style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginRight: d2p(10) }}>{profile?.nickname}</Text>
            <View style={{
              height: h2p(20), minWidth: d2p(55),
              marginRight: d2p(5),
              justifyContent: "center", alignItems: "center",
              paddingHorizontal: d2p(10), paddingVertical: h2p(3),
              borderRadius: 10, backgroundColor: theme.color.grayscale.f7f7fc, borderWidth: 1, borderColor: theme.color.grayscale.d2d0d5
            }}>
              <Text style={{ fontSize: 10, fontWeight: '500' }}>다이어터</Text>
            </View>
            <Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4 }}>자취생</Text>
          </View>
          <View style={styles.occupation}>
            <Text style={{ fontWeight: "500" }}>{profile?.occupation}</Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.color.grayscale.a09ca4 }}>#비건 #간편식 #한끼식사 #애주가</Text>
        </View>
        <MypageTabView />
      </View>
    </>
  );
};

export default Mypage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: h2p(30)
  },
  profileImage: {
    width: d2p(60),
    height: d2p(60),
    borderRadius: 60,
    marginBottom: h2p(25),
    borderWidth: 1,
    alignSelf: "center",
    borderColor: theme.color.grayscale.eae7ec
  },
  profileInfo: {
    alignItems: "center",
    paddingBottom: h2p(40)
  },
  occupation: {
    width: Dimensions.get("window").width - d2p(40),
    borderWidth: 1,
    minHeight: h2p(40),
    paddingVertical: h2p(10),
    paddingHorizontal: d2p(10),
    borderColor: theme.color.grayscale.ec6863,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    marginTop: h2p(20),
    marginBottom: h2p(15),
    justifyContent: "center",
    alignItems: "center"
  }
});