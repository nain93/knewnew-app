import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { myIdState } from '~/recoil/atoms';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';

interface MoreProps {
  userId: number,
  isMoreClick: boolean
}

const More = ({ userId, isMoreClick }: MoreProps) => {
  const myId = useRecoilValue(myIdState);
  return (
    <>
      {isMoreClick &&
        (myId === userId ?
          <View style={styles.clickBox}>
            <Pressable>
              <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>수정</Text>
            </Pressable>
            <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
            <Pressable>
              <Text style={[{ color: theme.color.main }, FONT.Regular]}>삭제</Text>
            </Pressable>
          </View>
          :
          <View style={styles.clickBox}>
            <Pressable>
              <Text style={[{ color: theme.color.grayscale.C_443e49 }, FONT.Regular]}>공유</Text>
            </Pressable>
            <View style={{ borderBottomWidth: 1, borderBottomColor: theme.color.grayscale.eae7ec, width: d2p(47) }} />
            <Pressable>
              <Text style={[{ color: theme.color.main }, FONT.Regular]}>신고</Text>
            </Pressable>
          </View>
        )}
    </>
  );
};

export default More;

const styles = StyleSheet.create({
  clickBox: {
    display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
    width: d2p(70),
    borderRadius: 5,
    position: 'absolute', right: d2p(36), top: h2p(5),
    shadowColor: '#000000',
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: (Platform.OS === 'android') ? 3 : 0,
    backgroundColor: theme.color.white,
    zIndex: 999,
  },
});