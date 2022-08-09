import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Header from '~/components/header';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { d2p, h2p } from '~/utils';
import { noProfile } from '~/assets/images';
import { FONT } from '~/styles/fonts';
import theme from '~/styles/theme';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { blockList } from '~/api/setting';
import { useRecoilValue } from 'recoil';
import { myIdState, tokenState } from '~/recoil/atoms';
import { UserInfoTagType } from '~/types/user';
import { blockUser } from '~/api/user';
import { grayKnewnew } from '~/assets/icons';
import Loading from '~/components/loading';

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
  const [isBlockData, setIsBlockData] = useState<BlockListType[]>([]);

  const blockListQuery = useInfiniteQuery<BlockListType[], Error>("blockList", ({ pageParam = 0 }) =>
    blockList({ token, id: myId, offset: pageParam }), {
    getNextPageParam: (next, all) => all.flat().length ?? undefined,
  });

  const blockMutation = useMutation("blockUser",
    ({ id, isBlock }: { id: number, isBlock: boolean }) => blockUser({ token, id, isBlock }), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("reviewList");
      await queryClient.invalidateQueries("userBookmarkList");
    }
  });

  useEffect(() => {
    if (blockListQuery.data) {
      setIsBlockData(blockListQuery.data?.pages.flat());
    }
  }, [blockListQuery.data]);


  const blockListKey = useCallback((item) => item.id.toString(), []);
  const blockListRenderItem = useCallback(({ item, index }: { item: BlockListType, index: number }) =>
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
        onPress={() => {
          setIsBlockData(isBlockData.map((v, i) => {
            if (i === index) {
              return { ...v, isBlock: !v.isBlock };
            }
            return v;
          }));
          blockMutation.mutate({ id: item.id, isBlock: !item.isBlock });
        }}
        style={{
          borderRadius: 12.5,
          width: d2p(76),
          height: h2p(25),
          paddingVertical: h2p(4),
          backgroundColor: item.isBlock ? theme.color.grayscale.eae7ec : theme.color.main,
          marginLeft: "auto",
          justifyContent: "center"
        }}>
        <Text style={[FONT.Medium, {
          textAlign: "center",
          color: item.isBlock ? theme.color.grayscale.C_79737e : theme.color.white
        }]}>
          {item.isBlock ? "차단 해제" : "차단"}
        </Text>
      </TouchableOpacity>
    </View>
    , [blockMutation, isBlockData]);

  if (blockListQuery.isLoading) {
    return (
      <>
        <Header
          headerLeft={<LeftArrowIcon />}
          title="차단 관리" />
        <Loading />
      </>
    );
  }

  return (
    <>
      <Header
        headerLeft={<LeftArrowIcon />}
        title="차단 관리" />
      <View style={styles.container}>
        <FlatList
          refreshing={blockListQuery.isLoading}
          onRefresh={blockListQuery.refetch}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (blockListQuery.data &&
              blockListQuery.data.pages.flat().length > 19) {
              blockListQuery.fetchNextPage();
            }
          }}
          ListEmptyComponent={() =>
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: h2p(150) }}>
              <Image source={grayKnewnew} style={{ width: d2p(60), height: d2p(60) }} />
              <Text style={[FONT.Regular, { color: theme.color.grayscale.C_79737e, fontSize: 16, marginTop: h2p(20) }]}>
                차단 목록이 없습니다
              </Text>
            </View>}
          showsVerticalScrollIndicator={false}
          data={isBlockData}
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
    flex: 1,
    padding: d2p(20)
  }
});