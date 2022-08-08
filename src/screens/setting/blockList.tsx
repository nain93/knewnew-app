import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p } from '~/utils';
import { noProfile } from '~/assets/images';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { blockList } from '~/api/setting';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import { UserInfoTagType } from '~/types/user';
import { blockUser } from '~/api/user';

interface BlockListType {
  id: number,
  nickname: string,
  profileImage: string,
  tags: UserInfoTagType,
  isBlock: boolean
}

const BlockList = () => {
  const token = useRecoilValue(tokenState);
  const myId = useRecoilValue(myIdState);
  const queryClient = useQueryClient();

  const blockListQuery = useQuery<BlockListType[], Error>("blockList", () => blockList({ token, id: myId }));
  const blockMutation = useMutation("blockUser",
    ({ id, isBlock }: { id: number, isBlock: boolean }) => blockUser({ token, id, isBlock }), {
    onSuccess: () => {
      console.log('11');
      queryClient.invalidateQueries("reviewList");
      queryClient.invalidateQueries("userBookmarkList");
    }
  });

  const blockListKey = useCallback((item) => item.id.toString(), []);
  const blockListRenderItem = useCallback(({ item }: { item: BlockListType }) =>
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: h2p(20) }}>
      <Image source={item.profileImage ? { uri: item.profileImage } : noProfile} style={{
        marginRight: d2p(8),
        width: d2p(40), height: d2p(40), borderRadius: 40,
        borderWidth: 1,
        borderColor: theme.color.grayscale.e9e7ec
      }} />
      <View>
        <Text style={FONT.Medium}>{item.nickname}</Text>
        <Text style={[FONT.Regular, { marginTop: h2p(2), fontSize: 10, color: theme.color.grayscale.a09ca4 }]}>
          {item.tags.foodStyle} {item.tags.household} {item.tags.occupation}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => blockMutation.mutate({ id: item.id, isBlock: !item.isBlock })}
        style={{
          borderRadius: 12.5,
          width: d2p(76),
          height: h2p(25),
          paddingVertical: h2p(4),
          backgroundColor: item.isBlock ? theme.color.grayscale.eae7ec : theme.color.main,
          marginLeft: "auto"
        }}>
        <Text style={[FONT.Medium, {
          textAlign: "center",
          color: item.isBlock ? theme.color.grayscale.C_79737e : theme.color.white
        }]}>
          {item.isBlock ? "차단 해제" : "차단"}
        </Text>
      </TouchableOpacity>
    </View>
    , []);

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon />}
        title="차단 관리" />
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={blockListQuery.data}
          renderItem={blockListRenderItem}
          keyExtractor={blockListKey}
        />
      </View>
    </>
  );
};

export default BlockList;

const styles = StyleSheet.create({
  container: {
    padding: d2p(20)
  }
});