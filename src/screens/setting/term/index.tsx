import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';
import { rightArrow } from '~/assets/icons';

interface TermScreenProps {
  navigation: NavigationStackProp;
  route: NavigationRoute;
}

const TermScreen = ({ navigation }: TermScreenProps) => {
  return (
    <>
      <Header title="이용 약관"
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} />}
      />
      <View style={styles.container}>
        <Pressable
          onPress={() => navigation.navigate("term")}
          style={styles.list}>
          <Text style={[FONT.Regular, styles.listText]}>서비스 이용약관</Text>
          <Image source={rightArrow} style={{ width: d2p(12), height: d2p(25) }} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("privacy")}
          style={styles.list}>
          <Text style={[FONT.Regular, styles.listText]}>개인정보 처리방침</Text>
          <Image source={rightArrow} style={{ width: d2p(12), height: d2p(25) }} />
        </Pressable>
      </View>
    </>
  );
};

export default TermScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.grayscale.f7f7fc
  },
  list: {
    paddingHorizontal: d2p(30),
    paddingVertical: h2p(15),
    borderBottomWidth: 1,
    borderBottomColor: theme.color.grayscale.f7f7fc,
    backgroundColor: theme.color.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  listText: {
    fontSize: 16,
    color: theme.color.grayscale.C_443e49
  }
});