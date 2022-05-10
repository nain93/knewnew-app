import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Header from '~/components/header';
import theme from '~/styles/theme';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { NavigationType } from '~/types';

import SelectDropdown from "react-native-select-dropdown";
import { leftArrow } from '~/assets/icons';
import { d2p, h2p } from '~/utils';

const Write = ({ navigation }: NavigationType) => {
  const countries = ["Egypt", "Canada", "Australia", "Ireland"];
  const [writeData, setWriteData] = useState<{ name: string, content: string }>({
    name: "",
    content: ""
  });

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
        <View style={styles.dropdown}>
          <SelectDropdown
            data={countries}
            defaultButtonText="추천템"
            dropdownStyle={{ backgroundColor: theme.color.white, elevation: 0 }}
            buttonTextStyle={{ textAlign: "left", marginHorizontal: 0, fontSize: 16, fontWeight: "500" }}
            buttonStyle={{ paddingHorizontal: d2p(20), backgroundColor: theme.color.white }}
            rowTextStyle={{ textAlign: "left", marginHorizontal: 0, fontSize: 16, fontWeight: "500" }}
            rowStyle={{ paddingHorizontal: d2p(20), borderBottomWidth: 0 }}
            dropdownOverlayColor="rgba(0,0,0,0)"
            onSelect={(selectedItem, index) => {
              console.log(selectedItem, index);
            }}
            renderDropdownIcon={(isOpened) =>
              <Image
                source={leftArrow}
                resizeMode="contain"
                style={{ height: 10, width: 20, transform: [{ rotate: isOpened ? "90deg" : "270deg" }] }}
              />}
            buttonTextAfterSelection={(selectedItem, _) => {
              return selectedItem;
            }}
            rowTextForSelection={(item, _) => {
              return item;
            }}
          />
          <SelectDropdown
            data={countries}
            defaultButtonText="유통사 선택안함"
            dropdownStyle={{ backgroundColor: theme.color.white, elevation: 0 }}
            buttonTextStyle={{ textAlign: "left", marginHorizontal: 0, fontSize: 16, fontWeight: "500" }}
            buttonStyle={{ paddingHorizontal: d2p(20), backgroundColor: theme.color.white }}
            rowTextStyle={{ textAlign: "left", marginHorizontal: 0, fontSize: 16, fontWeight: "500" }}
            rowStyle={{ paddingHorizontal: d2p(20), borderBottomWidth: 0 }}
            dropdownOverlayColor="rgba(0,0,0,0)"
            onSelect={(selectedItem, index) => {
              console.log(selectedItem, index);
            }}
            renderDropdownIcon={(isOpened) =>
              <Image
                source={leftArrow}
                resizeMode="contain"
                style={{ height: 10, width: 20, transform: [{ rotate: isOpened ? "90deg" : "270deg" }] }}
              />}
            buttonTextAfterSelection={(selectedItem, _) => {
              return selectedItem;
            }}
            rowTextForSelection={(item, _) => {
              return item;
            }}
          />
        </View>
        <View style={styles.textInputWrap}>
          <TextInput value={writeData.name}
            autoCapitalize="none"
            onChangeText={(e) => setWriteData({ ...writeData, name: e })}
            style={[styles.textInput, { paddingVertical: h2p(14.5), width: Dimensions.get("window").width - d2p(40) }]} placeholder="상품명을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
          <View style={[styles.textInput, { flexDirection: "row" }]}>
            <TextInput value={writeData.content}
              autoCapitalize="none"
              onChangeText={(e) => setWriteData({ ...writeData, content: e })}
              style={{ paddingVertical: h2p(14.5), fontSize: 16, includeFontPadding: false, width: Dimensions.get("window").width - d2p(40) }} placeholder="내용을 입력해주세요." placeholderTextColor={theme.color.grayscale.a09ca4} />
            {!writeData?.content &&
              <Text style={{ fontSize: 12, color: theme.color.main, marginTop: h2p(2) }}> (필수)</Text>}
          </View>
        </View>
      </View>
    </>
  );
};

export default Write;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdown: {
    flexDirection: "row"
  },
  textInputWrap: {
    paddingHorizontal: d2p(20),
    marginTop: h2p(22.5)
  },
  textInput: {
    fontSize: 16,
    borderTopWidth: 1,
    borderTopColor: theme.color.grayscale.f7f7fc
  }
});