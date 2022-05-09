import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { NavigationType } from '~/types';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import Header from '~/components/header';
import theme from '~/styles/theme';

const EditProfile = ({ navigation }: NavigationType) => {
  return (
    <>
      <Header
        isBorder={false}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} imageStyle={{ width: 11, height: 25 }} />}
        title="프로필 수정"
        headerRight={
          <TouchableOpacity>
            <Text style={{ color: theme.color.main }}>수정완료</Text>
          </TouchableOpacity>
        } />
      <View>
        <Text>EditProfile</Text>
      </View>
    </>
  );
};

export default EditProfile;

const styles = StyleSheet.create({});