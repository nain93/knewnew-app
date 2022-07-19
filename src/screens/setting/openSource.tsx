import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';

interface OpenSourceProps {
  navigation: NavigationStackProp;
  route: NavigationRoute;
}

const OpenSource = ({ navigation }: OpenSourceProps) => {
  return (
    <>
      <Header title="오픈소스 라이선스"
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} />}
      />
    </>
  );
};

export default OpenSource;

const styles = StyleSheet.create({});