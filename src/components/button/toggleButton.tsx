import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';

interface ToggleButtonProps {
  isOn: boolean
  setIsOn: (isOn: boolean) => void
}

const ToggleButton = ({ isOn, setIsOn }: ToggleButtonProps) => {
  const moveAnim = useRef(new Animated.Value(2)).current;

  const moveOn = () => {
    Animated.timing(moveAnim, {
      toValue: h2p(20),
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  const moveOff = async () => {
    Animated.timing(moveAnim, {
      toValue: h2p(2),
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  useEffect(() => {
    if (isOn) {
      moveOn();
    }
    else {
      moveOff();
    }
  }, [isOn]);

  return (
    <Pressable
      onPress={() => setIsOn(!isOn)}
      style={[
        styles.container,
        {
          borderColor: isOn ? theme.color.main : theme.color.grayscale.eae7ec,
          backgroundColor: isOn ? theme.color.white : theme.color.grayscale.f7f7fc
        }]}>
      <Animated.View style={[styles.toggle, {
        // left: isOn ? d2p(2) : d2p(20),
        backgroundColor: isOn ? theme.color.main : theme.color.grayscale.eae7ec,
        transform: [{ translateX: moveAnim }]
      }]} />
    </Pressable>
  );
};

export default ToggleButton;

const styles = StyleSheet.create({
  container: {
    width: d2p(40),
    height: d2p(20),
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: d2p(3),
  },
  toggle: {
    position: "absolute",
    width: d2p(16),
    height: d2p(16),
    borderRadius: 16
  }
});