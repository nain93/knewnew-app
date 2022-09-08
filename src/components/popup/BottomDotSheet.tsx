import { Dimensions, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import React from 'react';
import theme from '~/styles/theme';
import { d2p, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import Modal from "react-native-modal";

interface BottomDotSheetType {
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void,
  topTitle: string,
  topPress: () => void,
  topTextStyle?: TextStyle,
  middleTitle?: string,
  middlePress?: () => void,
  middleTextStyle?: TextStyle,
  bottomTitle: string
}

const BottomDotSheet = ({
  topTitle, topPress, middleTitle,
  middlePress, bottomTitle, topTextStyle,
  modalOpen, setModalOpen, middleTextStyle }: BottomDotSheetType) => {
  return (
    <>
      <Modal
        isVisible={modalOpen}
        hideModalContentWhileAnimating={true}
        animationIn="fadeIn"
        animationOut="fadeOut"
        onBackdropPress={() => setModalOpen(false)}
        backdropTransitionOutTiming={0}
        onBackButtonPress={() => setModalOpen(false)}
      >
        <View style={[styles.buttonWrap, { height: middleTitle ? h2p(100) : h2p(50) }]}>
          <TouchableOpacity
            onPress={() => {
              topPress();
              setModalOpen(false);
            }}
            style={{ width: "100%", alignItems: "center" }}>
            <Text style={[FONT.Regular, topTextStyle, { fontSize: 16, marginVertical: h2p(15) }]}>{topTitle}</Text>
          </TouchableOpacity>
          {
            (middleTitle && middlePress) &&
            <>
              <View style={{
                height: 1,
                width: Dimensions.get("window").width - d2p(60),
                backgroundColor: theme.color.grayscale.e9e7ec,
                alignSelf: "center"
              }} />
              <TouchableOpacity
                onPress={() => {
                  middlePress();
                  setModalOpen(false);
                }}
                style={{ width: "100%", alignItems: "center" }}>
                <Text style={[FONT.Regular, middleTextStyle, { fontSize: 16, marginVertical: h2p(15) }]}>{middleTitle}</Text>
              </TouchableOpacity>
            </>
          }
        </View>

        <TouchableOpacity
          onPress={() => setModalOpen(false)}
          style={{
            height: h2p(50),
            width: Dimensions.get("window").width - d2p(20),
            justifyContent: "center", alignItems: "center",
            alignSelf: "center",
            backgroundColor: theme.color.white, borderRadius: 10,
            marginBottom: h2p(30)
          }}>
          <Text style={[FONT.Regular, { fontSize: 16 }]}>{bottomTitle}</Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default BottomDotSheet;

const styles = StyleSheet.create({
  buttonWrap: {
    backgroundColor: theme.color.white,
    borderRadius: 10,
    width: Dimensions.get("window").width - d2p(20),
    alignSelf: "center",
    marginTop: "auto",
    marginBottom: h2p(10)
  }
});