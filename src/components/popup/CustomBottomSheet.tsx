import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import React from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { d2p } from '~/utils';

interface BottomSheetProps {
  onOpen?: () => void
  sheetRef: React.RefObject<RBSheet>,
  height: number,
  children: JSX.Element,
  customStyles?: {
    wrapper?: StyleProp<ViewStyle>;
    container?: StyleProp<ViewStyle>;
    draggableIcon?: StyleProp<ViewStyle>;
  }
}

const CustomBottomSheet = ({ sheetRef, height, customStyles, children, onOpen }: BottomSheetProps) => {

  return (
    <RBSheet
      ref={sheetRef}
      onOpen={onOpen}
      closeOnDragDown
      dragFromTopOnly
      animationType="fade"
      height={height}
      openDuration={250}
      customStyles={
        {
          container: {
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
            padding: d2p(20)
          },
          draggableIcon: {
            display: "none"
          },
          ...customStyles
        }
      }
    >
      {children}
    </RBSheet>
  );
};

export default CustomBottomSheet;

const styles = StyleSheet.create({});