import { Dimensions, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import Modal from "react-native-modal";
import theme from '~/styles/theme';
import { FONT } from '~/styles/fonts';

interface OkPopupProps {
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  title: string;
  handleOkayButton: () => void;
  children?: JSX.Element;
  isBackdrop?: boolean;
  isCancleButton?: boolean
}

const OkPopup = ({ modalOpen, setModalOpen, title, handleOkayButton, children,
  isBackdrop = true
  , isCancleButton = true
}: OkPopupProps) => {
  return (
    <Modal
      isVisible={modalOpen}
      style={{ alignItems: "center" }}
      hideModalContentWhileAnimating={true}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={() => isBackdrop ? setModalOpen(false) : null}
      backdropTransitionOutTiming={0}
      onBackButtonPress={() => isBackdrop ? setModalOpen(false) : null}
    >
      <View style={styles.modal}>
        <Text style={[FONT.Regular,
        { textAlign: "center", marginVertical: d2p(44) }]}>{title}</Text>
        <View style={styles.modalButton}>
          {isCancleButton &&
            <TouchableOpacity onPress={() => setModalOpen(false)} style={{
              width: "50%",
              paddingVertical: d2p(18),
              borderRightColor: theme.color.grayscale.e9e7ec,
              borderRightWidth: 1,
            }}>
              <Text style={[FONT.Regular, {
                textAlign: "center",
                color: theme.color.grayscale.d3d0d5
              }]}>취소</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity onPress={() => {
            handleOkayButton();
            setModalOpen(false);
          }}
            style={{ width: "50%", paddingVertical: d2p(15) }}>
            <Text style={[FONT.Regular, {
              textAlign: "center",
              color: theme.color.main
            }]}>확인</Text>
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </Modal>
  );
};

export default OkPopup;

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
