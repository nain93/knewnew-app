import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import theme from '~/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { d2p, dateCommentFormat, h2p } from '~/utils';
import { FONT } from '~/styles/fonts';
import FastImage from 'react-native-fast-image';
import { myIdState } from '~/recoil/atoms';
import { useRecoilValue } from 'recoil';
import { commentMore } from '~/assets/icons';
import { noProfile } from '~/assets/images';
import { RecommentType } from '~/types/comment';

interface RecommentProps {
  authorName: string
}

const Recomment = ({ child, authorName }: RecommentProps & RecommentType) => {
  const navigation = useNavigation<StackNavigationProp>();
  const myId = useRecoilValue(myIdState);
  const [commentSelectedIdx, setCommentSelectedIdx] = useState<number>(-1);
  return (
    <>
      {
        React.Children.toArray(child.map((item, index) => (
          <>
            <View style={[styles.container, { marginTop: index === 0 ? h2p(14.5) : h2p(1) }]}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
              }}>
                <TouchableOpacity onPress={() => navigation.navigate("Mypage", { id: item.author.id })}
                  style={styles.commentProfileLine}
                >
                  <FastImage source={item.author.profileImage ? { uri: item.author.profileImage } : noProfile}
                    style={styles.commentImg} />
                </TouchableOpacity>
                <View style={{
                  flexDirection: "row", justifyContent: "space-between",
                  width: Dimensions.get("window").width - d2p(90),
                  marginLeft: d2p(10)
                }}>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={{ flexDirection: "row" }}
                      onPress={() => navigation.navigate("Mypage", { id: item.author.id })}>
                      <Text style={FONT.Medium}>{item.author.nickname}</Text>
                      {item.author.id === myId &&
                        <View style={{
                          width: d2p(38),
                          justifyContent: "center", alignItems: "center",
                          marginLeft: d2p(5),
                          backgroundColor: theme.color.white,
                          borderRadius: 4, borderWidth: 1, borderColor: theme.color.grayscale.d2d0d5
                        }}>
                          <Text style={[FONT.Medium, { fontSize: 10, color: theme.color.grayscale.C_79737e }]}>
                            작성자</Text>
                        </View>
                      }
                    </TouchableOpacity>
                    <Text style={[
                      { marginLeft: item.author.id === myId ? d2p(5) : d2p(10) },
                      styles.commentDate, FONT.Regular]}>{dateCommentFormat(item.created)}</Text>
                  </View>
                  {myId === item.author.id &&
                    <TouchableOpacity onPress={() => {
                      if (commentSelectedIdx === index) {
                        setCommentSelectedIdx(-1);
                      } else {
                        setCommentSelectedIdx(index);
                      }
                    }}>
                      <Image
                        source={commentMore}
                        resizeMode="contain"
                        style={{ width: d2p(12), height: d2p(16) }}
                      />
                    </TouchableOpacity>
                  }
                </View>
              </View>
              <View style={styles.commentContent}>
                <Text style={[FONT.Regular, { fontSize: 15, color: theme.color.main }]}>@{authorName} </Text>
                <Text style={[{ color: theme.color.grayscale.C_443e49, fontSize: 15 }, FONT.Regular]}>{item.content}</Text>
              </View>
              <TouchableOpacity
                style={{ marginLeft: d2p(32), marginTop: h2p(10) }}
                onPress={() => console.log(item, 'item')}>
                <Text style={[FONT.Bold, {
                  fontSize: 12, color: (item.likeCount > 0) ? theme.color.grayscale.C_443e49 : theme.color.grayscale.C_79737e,
                }]}>좋아요 {item.likeCount}</Text>
              </TouchableOpacity>
            </View>
          </>
        )))
      }
    </>
  );
};

export default Recomment;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.color.grayscale.f7f7fc,
    padding: d2p(10)
  },
  commentImg: {
    width: d2p(22), height: d2p(22),
    borderRadius: 22,
    borderColor: theme.color.grayscale.e9e7ec, borderWidth: 1,

  },
  commentProfileLine: {
    width: d2p(22), height: d2p(22),
  },
  commentDate: {
    fontSize: 12,
    color: theme.color.grayscale.a09ca4,
  },
  commentContent: {
    marginLeft: d2p(32),
    flexDirection: "row"
  },
});