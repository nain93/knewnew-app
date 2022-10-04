import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { whiteCheckIcon } from '~/assets/icons/notificationIcon';
import { hitslop } from '~/utils/constant';
import BasicButton from '~/components/button/basicButton';
import { NavigationStackProp } from 'react-navigation-stack';

export interface NavigationType {
  navigation: NavigationStackProp;
}


const Welcome = ({ navigation }: NavigationType) => {
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[FONT.Bold, { fontSize: 26, lineHeight: 36.4 }]}>
        {`🖐 잠깐,\n뉴뉴는 `}
        <Text style={{ color: theme.color.mainRed }}>
          협찬과 광고
        </Text>
        {`를\n엄격히 `}
        <Text style={{ color: theme.color.mainRed }}>금지</Text>
        {`합니다.`}</Text>
      <Text style={[FONT.Regular, { marginTop: h2p(60), lineHeight: 22.4 }]}>
        {`광고없는 공간을 위해\n뉴뉴가 실시간으로 광고를 추적하고 있습니다.\n`}
        <Text style={FONT.SemiBold}>
          광고글로 판정될 경우 <Text style={{ color: theme.color.mainRed }}>계정이 영구 정지</Text> 됩니다.
        </Text>
      </Text>
      <View style={{
        marginTop: h2p(20),
        paddingHorizontal: d2p(8.5),
        paddingVertical: h2p(7),
        backgroundColor: theme.color.grayscale.f7f7fc
      }}>
        <Text style={[FONT.Regular, { lineHeight: 19.6 }]}>
          {`※ 광고임을 밝히지 않는 이른바 '뒷광고'는\n`}
          표시광고법 제3조 제1항에 의거하여 <Text style={FONT.Bold}>엄연한 불법행위</Text>입니다.
        </Text>
      </View>
      <View style={{
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
        marginTop: h2p(160)
      }}>
        <Pressable
          hitSlop={hitslop}
          onPress={() => setToggleCheckBox(!toggleCheckBox)}
          style={[{
            width: d2p(16), height: d2p(16),
            borderRadius: 2, marginLeft: d2p(5)
          },
          toggleCheckBox ? {
            borderWidth: 1,
            borderColor: theme.color.grayscale.C_79737e
          } : {
            backgroundColor: theme.color.main,
            justifyContent: "center", alignItems: "center"
          }]}
        >
          <Image source={whiteCheckIcon} style={{ width: d2p(9), height: d2p(7) }} />
        </Pressable>
        <Text style={[FONT.Regular, { lineHeight: 19.6, marginRight: d2p(12) }]}>
          {`뉴뉴의 광고 금지 정책을 확인하였으며,\n서비스 이용시 협찬 및 광고 글을 게시하지 않겠습니다.`}
        </Text>
      </View>
      <BasicButton
        disabled={toggleCheckBox}
        onPress={() => {
          //@ts-ignore
          navigation.reset({ routes: [{ name: "TabNav" }] });
        }}
        text="후다닥 입장하기"
        textColor={theme.color.white}
        bgColor={theme.color.main}
        viewStyle={{ marginTop: h2p(30) }}
      />
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    paddingTop: h2p(128),
    paddingHorizontal: d2p(20)
  }
});