import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationType } from '~/types';
import CloseIcon from '~/components/icon/closeIcon';

const Mypage = ({ navigation }: NavigationType) => {
  return (
    <>
      <Header headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} imageStyle={{ width: 11, height: 25 }} />}
        title="마이페이지"
        headerRight={<CloseIcon onPress={() => navigation.navigate("editProfile")} imageStyle={{ width: 16, height: 16, marginLeft: "auto" }} />} />
      <View>
        <Text>Mypage</Text>
      </View>
    </>
  );
};

export default Mypage;

const styles = StyleSheet.create({});