import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Modal from "react-native-modal";
import theme from '~/styles/theme';
import { d2p } from '~/utils';
import { FONT } from '~/styles/fonts';

interface ShouldUpdatePopupProps {
  modalOpen: boolean;
}

const ShouldUpdatePopup = ({ modalOpen }: ShouldUpdatePopupProps) => {
  return (
    <Modal
      isVisible={modalOpen}
      style={{ alignItems: "center" }}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <View style={styles.modal}>
        <Text style={[FONT.Regular,
        { textAlign: "center", marginVertical: d2p(44), lineHeight: 20 }]}>
          {`앱을 사용하기 위해서는\n`}
          <Text style={[FONT.Bold, { color: theme.color.main }]}>업데이트</Text>
          <Text>가 필요합니다!</Text>
        </Text>
        <View style={styles.modalButton}>
          <TouchableOpacity onPress={() => {
            if (Platform.OS === "ios") {
              Linking.openURL("https://apps.apple.com/us/app/%EB%89%B4%EB%89%B4-%EA%B4%91%EA%B3%A0-%EC%97%86%EB%8A%94-%EC%B6%94%EC%B2%9C%ED%85%9C-%EA%B3%B5%EC%9C%A0-%EA%B3%B5%EA%B0%84-%EC%9E%A5%EB%B3%B4%EA%B8%B0-%EC%A0%84-%ED%95%84%EC%88%98-%EC%95%B1/id1626766280");
            }
            if (Platform.OS === "android") {
              Linking.openURL("https://play.google.com/store/apps/details?id=com.mealing.knewnnew");
            }
          }}
            style={{ paddingVertical: d2p(15), width: "100%" }}>
            <Text style={[FONT.Regular, {
              textAlign: "center"
            }]}>업데이트 하러가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ShouldUpdatePopup;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.color.white,
    width: d2p(285),
    minHeight: d2p(164),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButton: {
    width: "100%",
    flexDirection: "row",
    borderTopColor: theme.color.grayscale.d3d0d5,
    borderTopWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: d2p(56),
  }
});