import { Dimensions, Image, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Header from '~/components/header';
import theme from '~/styles/theme';
import LeftArrowIcon from '~/components/icon/leftArrowIcon';
import { InterestTagType } from '~/types';
import { photo, photoClose } from '~/assets/images';
import { d2p, h2p } from '~/utils';

import { useMutation, useQueryClient } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { myIdState, okPopupState, popupState, tokenState } from '~/recoil/atoms';
import { ReviewListType, WriteImagesType, WriteReviewType } from '~/types/review';
import { FONT } from '~/styles/fonts';
import { NavigationStackProp } from 'react-navigation-stack';
import { NavigationRoute } from 'react-navigation';
import { deleteReviewImage, editReview, writeReview } from '~/api/review';
import { interestTagData } from '~/utils/data';
import FeedReview from '~/components/review/feedReview';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper';
import Loading from '~/components/loading';
import { preSiginedImages, uploadImage } from '~/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import BasicButton from '~/components/button/basicButton';
import { blackclose, circle, graycircle, grayclose, grayheart, heart, reKnew } from '~/assets/icons';
import FastImage from 'react-native-fast-image';

interface WriteProp {
  navigation: NavigationStackProp;
  route: NavigationRoute<{
    review?: ReviewListType,
    type?: "reknew" | "reKnewWrite",
    filterBadge?: string,
    nickname?: string,
    loading?: boolean
    isEdit: boolean,
  }>;
}

const Write = ({ navigation, route }: WriteProp) => {
  let parentId: number | undefined;
  if (route.params?.type === "reKnewWrite") {
    parentId = route.params.review?.id;
  }
  if (route.params?.review?.parent && route.params?.type === "reknew") {
    parentId = route.params.review?.parent.id;
  }
  const [writeData, setWriteData] = useState<WriteReviewType>({
    images: [],
    content: "",
    satisfaction: "",
    market: undefined,
    parent: parentId,
    tags: {
      interest: []
    }
  });

  const [interestTag, setInterestTag] = useState<InterestTagType>(interestTagData);
  const inputRef = useRef<TextInput>(null);
  const [keyboardHeight, setKeyBoardHeight] = useState(0);
  const queryClient = useQueryClient();
  const token = useRecoilValue(tokenState);
  const [presignImg, setPresignImg] = useState<WriteImagesType[]>([]);
  const [blockSubmit, setBlockSubmit] = useState(false);
  const setModalOpen = useSetRecoilState(okPopupState);
  const setIspopupOpen = useSetRecoilState(popupState);
  const myId = useRecoilValue(myIdState);
  const [uploadBody, setUploadBody] = useState<{
    uri: string,
    name: string | undefined,
    type: string
  }[]>([]);

  const [imageList, setImageList] = React.useState<string[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [imageIds, setImageIds] = useState<number[]>([]);

  const addReviewMutation = useMutation(["addReview", token],
    (writeProps: WriteReviewType) => writeReview({ token, ...writeProps }), {
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries("userReviewList");
        queryClient.setQueriesData("myProfile", (profileQuery: any) => {
          return {
            ...profileQuery, reviewCount: profileQuery?.reviewCount + 1
          };
        });
        queryClient.invalidateQueries("reviewList");
        navigation.goBack();
        navigation.goBack();
        navigation.navigate("FeedDetail", { id: data.id, authorId: myId });
      }
    },
    onSettled: () => setBlockSubmit(false)
  });

  const editReviewMutation = useMutation(["editReview", token],
    ({ writeProps, id }: { writeProps: WriteReviewType, id: number }) =>
      editReview({ token, id, ...writeProps }), {
    onSuccess: async (data) => {
      // * 이미지 삭제 api
      await Promise.all(imageIds.map(v => mutateAsync(v)));
      if (data) {
        queryClient.invalidateQueries("reviewList");
        navigation.goBack();
        navigation.navigate("FeedDetail", { id: data.id, authorId: myId });
      }
    },
    onSettled: () => setBlockSubmit(false)
  });

  const presignMutation = useMutation("presignImages",
    (fileName: Array<string>) => preSiginedImages({ token, fileName, route: "review" }),
    {
      onSuccess: (data) => {
        const uploadedImages = uploadBody.map(async (v, i) => {
          await uploadImage(v, data[i]);
        });

        // * 업로드 실패시 경고메세지
        if (uploadedImages.length === 0 || (uploadBody.length !== uploadedImages.length)) {
          setIspopupOpen({ isOpen: true, content: "사진 업로드중 문제가 생겼습니다 다시 시도해주세요." });
          return;
        }
        //@ts-ignore
        const reducedImages = data.reduce<Array<{ priority: number, image: string }>>((acc, cur, idx) => {
          acc = acc.concat({ priority: idx, image: cur.fields.key });
          return acc;
        }, []);
        setPresignImg(reducedImages);

        if (route.params?.isEdit && route.params.review?.id) {
          editReviewMutation.mutate({
            writeProps:
              { ...writeData, parent: route.params.review.parent?.isActive ? writeData.parent : undefined, images: reducedImages },
            id: route.params.review?.id
          });
        }
        else {
          addReviewMutation.mutate({ ...writeData, images: reducedImages });
        }
      }
    });

  const { mutateAsync } = useMutation("deleteImages", (id: number) => deleteReviewImage(token, id));

  const handleAddWrite = async () => {
    if (route.params?.type === "reKnewWrite" && writeData.satisfaction === "") {
      setIspopupOpen({ isOpen: true, content: "선호도를 입력해주세요", popupStyle: { bottom: keyboardHeight + h2p(20) } });
      return;
    }
    if (writeData.content === "") {
      setIspopupOpen({ isOpen: true, content: "내용을 입력해주세요", popupStyle: { bottom: keyboardHeight + h2p(20) } });
      return;
    }
    setBlockSubmit(true);
    // * 이미지 업로드할때
    if (uploadBody.length > 0) {
      presignMutation.mutate(imageList);
    }
    else {
      // * 수정할때 (이미지 업로드x)
      if (route.params?.isEdit && route.params.review?.id) {
        const reducedImages = images.reduce<Array<{ priority: number, image: string }>>((acc, cur, idx) => {
          acc = acc.concat({ priority: idx, image: "review" + cur.image.split("review")[1] });
          return acc;
        }, []);
        setPresignImg(reducedImages);
        editReviewMutation.mutate({
          writeProps:
            { ...writeData, parent: route.params.review.parent?.isActive ? writeData.parent : undefined },
          id: route.params.review?.id
        });
      }
      else {
        addReviewMutation.mutate(writeData);
      }
    }
  };

  useEffect(() => {
    setUploadBody([]);
    setImageIds([]);
    if (route.params?.review && route.params.type !== "reKnewWrite") {
      setImages(route.params.review.images);
      setImageList(route.params.review.images.map(v => v.image));

      if (Object.keys(route.params?.review?.tags).length !== 0) {
        setInterestTag({
          interest: interestTag.interest.map(v => {
            if (route.params?.review?.tags.interest.includes(v.title)) {
              return { isClick: true, title: v.title };
            }
            return { isClick: false, title: v.title };
          })
        });
      }
      setWriteData({
        ...writeData,
        images: route.params.review.images.map(v => ({ ...v, image: "review" + v.image?.split("review")[1] })),
        content: route.params.review.content,
        satisfaction: route.params.review.satisfaction,
        market: route.params.review.market ? route.params.review.market : undefined,
        tags: {
          ...route.params.review.tags
        },
      });
    }
    else {
      setInterestTag(interestTagData);
      setImageList([]);
      setImages([]);
      setWriteData({
        images: [],
        content: "",
        satisfaction: "",
        market: undefined,
        parent: parentId,
        tags: {
          interest: []
        }
      });
    }
  }, [route.params]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      Keyboard.addListener("keyboardWillShow", (e) => {
        setKeyBoardHeight(e.endCoordinates.height);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setKeyBoardHeight(h2p(20));
      });
    }
    else {
      Keyboard.addListener("keyboardDidShow", (e) => {
        if ((route.params?.type === "reKnewWrite" || route.params?.type === "reknew")) {
          setKeyBoardHeight(e.endCoordinates.height - 50);
        }
        else {
          setKeyBoardHeight(e.endCoordinates.height);
        }
      });
      Keyboard.addListener("keyboardDidHide", () => {
        setKeyBoardHeight(h2p(20));
      });
    }
  }, [route.params?.type]);

  const openPicker = async () => {
    try {
      const response = await MultipleImagePicker.openPicker({
        selectedAssets: images,
        mediaType: "image",
        usedCameraButton: false
      });
      if (response.length > 5) {
        setIspopupOpen({ isOpen: true, content: "이미지는 최대 5장까지 올릴 수 있습니다." });
        return;
      }
      setUploadBody(response.map(v => ({
        uri: v.path,
        type: v.mime,
        name: Platform.OS === 'ios' ? v.fileName : `${Date.now()}.${v.mime === 'image/jpeg' ? 'jpg' : 'png'}`,
      })));
      setImageList(response.map(v => Platform.OS === 'ios' ? v.fileName : (`${Date.now()}.${v.mime === 'image/jpeg' ? 'jpg' : 'png'}`)));
      setImages(response);
    } catch (e) {
      //@ts-ignore
      console.log(e.code, e.message);
    }
  };

  if ((route.params?.loading && !writeData.satisfaction) || addReviewMutation.isLoading || editReviewMutation.isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Header
        isBorder={true}
        headerLeft={<LeftArrowIcon onBackClick={() => {
          if (route.params?.isEdit) {
            if (writeData.content
              || writeData.satisfaction
              || writeData.images && writeData.images.length > 0
              || writeData.market
              || writeData.tags.interest.length > 0) {
              setModalOpen({
                isOpen: true,
                content: "앗! 지금까지 작성하신 내용이 사라져요",
                okButton: () => {
                  navigation.goBack();
                  setWriteData({
                    images: [],
                    content: "",
                    satisfaction: "",
                    market: undefined,
                    parent: parentId,
                    tags: {
                      interest: []
                    }
                  });
                }
              });
            }
          }
          else {
            navigation.goBack();
          }
        }}
          imageStyle={{ width: d2p(11), height: h2p(25) }} />}
        title="글쓰기"
        headerRightPress={() => {
          // todo 임시저장

        }}
      // headerRight={<Text style={[{ color: theme.color.grayscale.a09ca4 }, FONT.Regular]}>
      //   임시저장
      // </Text>} 
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* 인용할떄 ui */}
        {(route.params?.type === "reknew" || route.params?.type === "reKnewWrite") ?
          <View
            style={{ marginTop: h2p(20), marginBottom: "auto" }}>
            <View style={{ paddingHorizontal: d2p(20) }}>
              <View style={styles.reviewIconWrap}>
                <TouchableOpacity
                  onPress={() => setWriteData({ ...writeData, satisfaction: "best" })}
                  style={styles.reviewIcon}>
                  <Image source={(writeData.satisfaction === "best") ? heart : grayheart} style={{ width: d2p(20), height: h2p(20) }} />
                  <Text style={[{ color: (writeData.satisfaction === "best") ? theme.color.main : theme.color.grayscale.a09ca4, marginLeft: d2p(5) },
                  (writeData.satisfaction === "best") ? FONT.Bold : FONT.Regular]}>최고예요</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setWriteData({ ...writeData, satisfaction: "good" })}
                  style={styles.reviewIcon}>
                  <Image source={(writeData.satisfaction === "good") ? circle : graycircle} style={{ width: d2p(20), height: h2p(20) }} />
                  <Text style={[{ color: (writeData.satisfaction === "good") ? theme.color.yellow : theme.color.grayscale.a09ca4, marginLeft: d2p(5) },
                  (writeData.satisfaction === "good") ? FONT.Bold : FONT.Regular]}>괜찮아요</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setWriteData({ ...writeData, satisfaction: "bad" })}
                  style={styles.reviewIcon}>
                  <Image source={(writeData.satisfaction === "bad") ? blackclose : grayclose} style={{ width: d2p(20), height: h2p(20) }} />
                  <Text style={[{ color: (writeData.satisfaction === "bad") ? theme.color.black : theme.color.grayscale.a09ca4, marginLeft: d2p(5) },
                  (writeData.satisfaction === "bad") ? FONT.Bold : FONT.Regular]}>별로예요</Text>
                </TouchableOpacity>
              </View>
              <Text style={[FONT.Bold, { marginBottom: h2p(10) }]}>오늘의 푸드로그
                <Text style={[FONT.Regular, {
                  fontSize: 12,
                  color: writeData.content.length === 300 ? theme.color.main : theme.color.grayscale.a09ca4
                }]}>  ({writeData.content.length}/300)</Text>
              </Text>
            </View>
            <Pressable onPress={() => inputRef.current?.focus()}
              style={{
                height: h2p(555),
                borderTopColor: theme.color.grayscale.eae7ec,
                borderTopWidth: 1,
                borderBottomColor: theme.color.grayscale.e9e7ec,
                borderBottomWidth: 1,
                paddingHorizontal: d2p(20),
              }}
            >
              <View style={{ flexDirection: "row", marginTop: h2p(20) }}>
                <Image source={reKnew} style={{ width: d2p(26), height: d2p(26) }} />
                <View style={{
                  borderWidth: 1, borderColor: theme.color.grayscale.e9e7ec,
                  paddingTop: h2p(15),
                  paddingBottom: h2p(10),
                  // marginVertical: h2p(15),
                  marginLeft: d2p(14),
                  borderRadius: 5,
                  paddingHorizontal: d2p(10),
                  width: Dimensions.get("window").width - d2p(80)
                }}>
                  {route.params.review &&
                    (
                      (route.params.review.parent?.isActive || !route.params.review.parent) ?
                        <FeedReview
                          filterBadge={route.params.filterBadge}
                          type="reKnewWrite"
                          //@ts-ignore
                          review={route.params?.review.parent ? route.params?.review.parent : route.params?.review} />
                        :
                        <Text style={[FONT.Regular, { color: theme.color.grayscale.C_79737e }]}>
                          원문 글이 삭제되었습니다.
                        </Text>
                    )
                  }
                </View>
              </View>

              <View>
                {!writeData.content &&
                  <View style={{
                    position: "absolute", top: h2p(32), left: 0,
                    width: Dimensions.get("window").width - d2p(40),
                  }}>
                    <Text style={[FONT.Regular, {
                      marginBottom: h2p(20),
                      lineHeight: 23,
                      fontSize: 16, color: theme.color.grayscale.a09ca4
                    }]}>
                      {`${route.params?.nickname}님은 어떻게 생각하세요?`}
                      <Text style={[FONT.Regular, { color: theme.color.main, fontSize: 12, lineHeight: 23 }]}> (필수)</Text>
                    </Text>
                    <Text style={[FONT.Regular, { lineHeight: 23, color: theme.color.grayscale.a09ca4 }]}>
                      Tip. 내 평소 입맛, 나만의 특별한 조리법 등 다른 분들에게 도움이 되는 꿀팁을 함께 나눠주시면 더욱 좋아요!
                    </Text>
                  </View>
                }

                <TextInput
                  value={writeData.content}
                  maxLength={301}
                  onChangeText={(e) => {
                    if (e.length > 300) {
                      setWriteData({ ...writeData, content: e.slice(0, e.length - 1) });
                    }
                    else {
                      setWriteData({ ...writeData, content: e });
                    }
                  }}
                  autoCapitalize="none"
                  ref={inputRef}
                  multiline
                  // onContentSizeChange={e => setNumberLine(Math.round(e.nativeEvent.contentSize.height / 20))}
                  style={[{
                    paddingTop: h2p(34), padding: 0, fontSize: 16, color: theme.color.black,
                  }, FONT.Regular]} />
              </View>

            </Pressable>
          </View>
          :
          <>
            <View style={{
              paddingHorizontal: d2p(10), marginTop: h2p(20), marginBottom: h2p(10),
              flexDirection: "row", justifyContent: "space-between", alignItems: "center"
            }}>
              <Text style={FONT.Bold}>오늘의 푸드로그
                <Text style={[FONT.Regular, {
                  fontSize: 12,
                  color: writeData.content.length === 300 ? theme.color.main : theme.color.grayscale.a09ca4
                }]}>  ({writeData.content.length}/300)</Text>
              </Text>
              {route.params?.isEdit &&
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.color.white,
                    borderWidth: 1,
                    borderColor: theme.color.grayscale.a09ca4,
                    paddingHorizontal: d2p(5),
                    paddingVertical: h2p(5),
                    borderRadius: 5,
                  }}
                  onPress={() => navigation.navigate("EditBeforeWrite", { review: { ...route.params?.review, content: writeData.content } })}>
                  <Text style={[FONT.Regular, { color: theme.color.grayscale.C_443e49, }]}>{`< 기본정보 수정하기`}</Text>
                </TouchableOpacity>
              }
            </View>
            <Pressable onPress={() => inputRef.current?.focus()}
              style={{
                height: h2p(360),
                borderTopColor: theme.color.grayscale.eae7ec,
                borderTopWidth: 1,
                borderBottomColor: theme.color.grayscale.e9e7ec,
                borderBottomWidth: 1
              }}>
              {!writeData.content &&
                <View style={{
                  position: "absolute", top: h2p(20), left: d2p(20),
                  width: Dimensions.get("window").width - d2p(40),
                }}>
                  <Text style={[FONT.Regular, {
                    marginBottom: h2p(20),
                    lineHeight: 23,
                    fontSize: 16, color: theme.color.grayscale.a09ca4
                  }]}>
                    푸드로그를 자유롭게 작성하세요.
                    <Text style={[FONT.Regular, { color: theme.color.main, fontSize: 12, lineHeight: 23 }]}> (필수)</Text>
                  </Text>
                  <Text style={[FONT.Regular, { lineHeight: 23, color: theme.color.grayscale.a09ca4 }]}>
                    Tip. 내 평소 입맛, 나만의 특별한 조리법 등 다른 분들에게 도움이 되는 꿀팁을 함께 나눠주시면 더욱 좋아요!
                  </Text>
                </View>
              }
              <TextInput
                ref={inputRef}
                value={writeData.content}
                autoCapitalize="none"
                multiline
                maxLength={301}
                textAlignVertical="top"
                onChangeText={(e) => {
                  if (e.length > 300) {
                    setWriteData({ ...writeData, content: e.slice(0, e.length - 1) });
                  }
                  else {
                    setWriteData({ ...writeData, content: e });
                  }
                }}
                style={[styles.textInput, FONT.Regular]}
              // placeholder="푸드로그를 자유롭게 작성하세요." placeholderTextColor={theme.color.grayscale.a09ca4} 
              />
            </Pressable>
          </>
        }

        {/* 상품명 추가 기능후 주석해제 */}
        {/* <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          paddingHorizontal: d2p(20), marginBottom: h2p(10), marginTop: h2p(40)
        }}>
          <Text style={FONT.Bold}>상품명을 알고 있나요?</Text>
          <Image source={circleQuestion} style={{ width: d2p(16), height: d2p(16) }} />
        </View>
        <TextInput style={[FONT.Regular, {
          borderTopColor: theme.color.grayscale.eae7ec,
          borderTopWidth: 1,
          borderBottomColor: theme.color.grayscale.e9e7ec,
          borderBottomWidth: 1,
          paddingHorizontal: d2p(20),
          paddingVertical: h2p(15),
          fontSize: 16
        }]} placeholder="상품명을 입력해주세요. 비워둬도 괜찮아요!" placeholderTextColor={theme.color.grayscale.a09ca4} /> */}

        {(!route.params?.isEdit || !route.params.review?.id) &&
          <Text style={[FONT.Bold, {
            marginTop: h2p(40),
            marginBottom: h2p(10),
            marginHorizontal: d2p(20),
          }]}>사진이 있다면, 더 좋아요!</Text>
        }
        <View style={{
          flexDirection: "row", alignItems: "center",
          paddingBottom: isIphoneX() ? getBottomSpace() : h2p(30),
        }}>
          {
            (!route.params?.isEdit || !route.params.review?.id) &&
            <Pressable onPress={openPicker} style={[styles.images, {
              justifyContent: "center",
              alignItems: "center", marginLeft: d2p(20), marginRight: d2p(15)
            }]}>
              <Image source={photo} style={{ width: d2p(20), height: h2p(20), marginTop: h2p(12) }} />
              <Text style={[{ fontSize: 12, color: theme.color.grayscale.d3d0d5, marginVertical: h2p(8) }, FONT.Regular]}>{images.length}/5</Text>
            </Pressable>
          }
          <ScrollView
            style={{
              marginTop: route.params?.isEdit ? h2p(20) : 0,
              paddingLeft: (!route.params?.isEdit || !route.params.review?.id) ? 0 : d2p(20)
            }}
            horizontal showsHorizontalScrollIndicator={false}>
            {React.Children.toArray(images.map((image, idx) => {
              return (
                <View style={[styles.images, { marginRight: (idx === imageList.length - 1) ? d2p(20) : d2p(5) }]}>
                  <View style={{ alignItems: "center" }}>
                    <FastImage source={
                      route.params?.isEdit ?
                        { uri: images[idx].image }
                        :
                        {
                          uri: Platform.OS === "ios" ? 'file://' + image.path : 'file://' + image.realPath,
                        }
                    } style={{ width: d2p(100), height: h2p(100), borderRadius: 10 }} />
                    <Pressable onPress={() => {
                      setImageIds(imageIds.concat(image.id));
                      setImages(images.filter((_, filterIdx) => idx !== filterIdx));
                      setWriteData({ ...writeData, images: writeData.images?.filter((_, filterIdx) => idx !== filterIdx) });
                      setImageList(imageList.filter((_, filterIdx) => idx !== filterIdx));
                      setUploadBody(uploadBody.filter((_, filterIdx) => idx !== filterIdx));
                    }}
                      style={{ position: "absolute", right: 0, top: 0 }}>
                      <Image source={photoClose} style={{ width: d2p(16), height: h2p(16) }} />
                    </Pressable>
                  </View >
                </View >
              );
            }))}
          </ScrollView >
        </View >
        <BasicButton
          disabled={Boolean(!writeData.content)}
          onPress={() => {
            if (blockSubmit) {
              return;
            }
            else {
              handleAddWrite();
            }
          }}
          viewStyle={{
            marginHorizontal: d2p(20), marginBottom: h2p(40)
          }} text="글쓰기 완료"
          bgColor={theme.color.main}
          textColor={theme.color.white}
        />
      </KeyboardAwareScrollView>
    </>
  );
};

export default Write;

const styles = StyleSheet.create({
  container: {
    // minHeight: Dimensions.get("window").height - h2p(104),
    // backgroundColor: "green"
  },
  textInput: {
    paddingHorizontal: d2p(20),
    marginTop: h2p(20),
    paddingTop: 0,
    includeFontPadding: false,
    fontSize: 16,
    color: theme.color.black,
  },
  reviewIconWrap: {
    flexDirection: "row",
    marginBottom: h2p(20)
  },
  reviewIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: d2p(20)
  },
  selectWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    marginBottom: Platform.OS === "ios" ? h2p(104) : h2p(84)
  },
  select: {
    flexDirection: "row",
    paddingVertical: h2p(13),
    justifyContent: "center",
    width: (Dimensions.get("window").width - d2p(50)) / 2,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: theme.color.grayscale.e9e7ec
  },
  images: {
    width: d2p(100),
    height: h2p(100),
    borderWidth: 1,
    borderColor: theme.color.grayscale.eae7ec,
    borderRadius: 10
  }
});
