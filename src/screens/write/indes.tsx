import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Header from '~/components/header';
import theme from '~/styles/theme';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationType } from '~/types';

const Write = ({ navigation }: NavigationType) => {
  return (
    <>
      <Header
        isBorder={false}
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} imageStyle={{ width: 11, height: 25 }} />}
        title="작성하기"
        headerRight={
          <TouchableOpacity>
            <Text style={{ color: theme.color.grayscale.a09ca4 }}>완료</Text>
          </TouchableOpacity>
        } />
      <View style={styles.container}>
        <Text>Write</Text>
      </View>
    </>
  );
};

export default Write;

const styles = StyleSheet.create({
  container: {

  }
});