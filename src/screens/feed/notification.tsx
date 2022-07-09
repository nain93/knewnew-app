import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Header from '~/components/header';
import { NavigationStackProp } from 'react-navigation-stack';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p } from '~/utils';

export interface NotificationProps {
  navigation: NavigationStackProp;
}

const Notification = ({ navigation }: NotificationProps) => {
  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon onBackClick={() => navigation.goBack()} />}
        title="알림" />
      <View style={styles.container}>
        <Text>Notification</Text>
      </View>
    </>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    padding: d2p(20)
  }
});