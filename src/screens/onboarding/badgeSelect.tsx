import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import { d2p } from '~/utils';
import theme from '~/styles/theme';
import BasicButton from '~/components/button/basicButton';
import PickerBadge from '~/components/badge/pickerBadge';

const BadgeSelect = () => {
    return (
        <View style={styles.container}>
            <View style={{ marginBottom: d2p(60) }}>
                <Text style={styles.title}>픽커님을 나타낼 뱃지를{"\n"}
                    <Text style={{ color: theme.color.main }}>2가지 이상</Text> 선택해주세요.</Text>
                <Text style={styles.subTitle}>최소 2개 최대 10개까지 고를 수 있고,{"\n"}
                    마이페이지에서 언제든지 수정할 수 있어요.</Text>
            </View>
            <ScrollView>
                <Text style={{ ...styles.menu, marginTop: 0 }}>소비스타일</Text>
                <ScrollView horizontal>
                    <PickerBadge text="가성비좋아😍" />
                    <PickerBadge text="비싸도FLEX💸" />
                </ScrollView>
                <Text style={styles.menu}>관심사</Text>
                <ScrollView horizontal>
                    <PickerBadge text="빵식가🥐" />
                    <PickerBadge text="애주가🍻" />
                    <PickerBadge text="디저트러버🍰" />
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <PickerBadge text="속편한식사🍚" />
                    <PickerBadge text="다이어터🥗" />
                    <PickerBadge text="캠핑족🏕" />
                    <PickerBadge text="비건" />
                </ScrollView>
                <Text style={styles.menu}>가족구성</Text>
                <ScrollView horizontal>
                    <PickerBadge text="자취생🙂" />
                    <PickerBadge text="애기가족👶" />
                    <PickerBadge text="가족한끼👪" />
                </ScrollView>
                <Text style={styles.menu}>입맛</Text>
                <ScrollView horizontal>
                    <PickerBadge text="맵찔이😣" />
                    <PickerBadge text="맵고수🌶" />
                    <PickerBadge text="느끼만렙😏" />
                </ScrollView>
                <Text style={styles.menu}>선호하는 재료</Text>
                <ScrollView horizontal>
                    <PickerBadge text="고기파🍖" />
                    <PickerBadge text="채소파🥦" />
                    <PickerBadge text="해산물파🦐" />
                </ScrollView>
                <Text style={styles.menu}>조리방법</Text>
                <ScrollView horizontal>
                    <PickerBadge text="간단조리파⏱" />
                    <PickerBadge text="직접요리파👨‍🍳" />
                </ScrollView>
                <BasicButton text="선택완료" color={theme.color.main} marginTop={40} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: d2p(20), marginTop: d2p(42.5),
        paddingBottom: isIphoneX() ? getBottomSpace() : d2p(40)
    },
    title: {
        fontSize: 26,
        fontWeight: '600'
    },
    subTitle: {
        fontSize: 14,
        color: theme.color.gray,
        marginTop: d2p(20)
    },
    menu: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: d2p(39)
    },
    select: {
        borderWidth: 1, borderColor: theme.color.lightgray,
        borderRadius: 16,
        marginTop: d2p(8), marginRight: d2p(5),
        paddingVertical: d2p(5), paddingHorizontal: d2p(15),
    },
});

export default BadgeSelect;