import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import React, { useCallback } from 'react';
import Header from '~/components/header';
import { NavigationStackProp } from 'react-navigation-stack';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p, simpleDate } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { likeComment } from '~/assets/icons/notificationIcon';

export interface NotificationProps {
  navigation: NavigationStackProp;
}

const Notification = ({ navigation }: NotificationProps) => {

  const renderItem = useCallback(({ item, index }) => {
    return (
      <View style={{ flexDirection: "row" }}>
        <View style={{ marginRight: d2p(20), alignItems: "center", paddingVertical: h2p(20) }}>
          <Image source={likeComment} style={{ width: d2p(18), height: d2p(18) }} />
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.C_79737e, marginTop: h2p(5) }]}>
            활동
          </Text>
        </View>
        <View style={{
          width: Dimensions.get("window").width - d2p(70),
          borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.f7f7fc,
          paddingVertical: h2p(20)
        }}>
          <Text style={FONT.Regular}>{item.content}</Text>
          <Text style={[FONT.Regular, { fontSize: 12, color: theme.color.grayscale.a09ca4, marginTop: h2p(7) }]}>
            {/* {simpleDate()} */}
            2022.06.28
          </Text>
        </View>
      </View>
    );
  }, []);
  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} />}
        title="알림" />
      <View style={styles.container}>
        <FlatList
          data={[{
            id: 0,
            content: "지금 20명이 닉네임님의 푸드로그에 방문했어요!. 닉네임님 로그에 박수를!👏👏"
          },
          {
            id: 1,
            content: "열려라참깨님이 닉네임님의 푸드로그를 좋아해요."
          }, {
            id: 2,
            content: "12명이 닉네임임의 푸드로그를 담아갔어요."
          }]}
          renderItem={renderItem}
          keyExtractor={v => v.id.toString()}
        />
      </View>
    </>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: d2p(20)
  }
});