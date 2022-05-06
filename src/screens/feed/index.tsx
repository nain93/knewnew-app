import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React from 'react';
import { d2p, h2p } from '~/utils';
import theme from '~/styles/theme';
import BottomArrowIcon from '~/components/icon/bottomArrowIcon';
import MoreIcon from '~/components/icon/moreIcon';
import FeedBadge from '~/components/badge/feedBadge';
import ReviewIcon from '~/components/icon/reviewIcon';
import ReactionIcon from '~/components/icon/reactionIcon';
import Header from '~/components/header';
import { mainLogo } from '~/assets/logo';

const Feed = () => {
	return (
		<>
			<Header
				headerLeft={<Image source={mainLogo} resizeMode="contain" style={{ width: d2p(96), height: h2p(20) }} />}
			/>
			<View style={{ flex: 1, backgroundColor: theme.color.grayscale.f7f7fc }}>
				<View style={styles.filter}><Text>얼리어답터 · 디저트덕후</Text>
					<BottomArrowIcon />
				</View>
				{/* <FlatList style={styles.container}
			data={}
				renderItem={
				}> */}
				<View style={{ marginTop: h2p(40) }}>
					<TouchableOpacity style={styles.review}>
						<View style={{ flexDirection: 'row' }}>
							<FeedBadge text="자취생😶" />
							<MoreIcon onPress={() => console.log('공유/신고')} />
						</View>
						<View>
							<View style={styles.titleContainer}>
								<View style={{ backgroundColor: 'black', width: 24, height: 24, borderRadius: 12, marginRight: 5 }} />
								<Text style={styles.title}>하림조각닭</Text>
								<ReviewIcon review="heart" />
							</View>
							{/* eslint-disable-next-line react-native/no-raw-text */}
							<Text style={{ paddingLeft: d2p(29) }}>오설록 초콜릿 쿠키도 맛있어요! 공부할때 하나씩 꺼내먹기 좋아용{"\n"}
								가격은 좀 ㅎㄷㄷ하지만 … 오설록이라서 찐해서 좋아욤</Text>
						</View>
						<View style={styles.sign}>
							<Text style={styles.date}>2022.04.26</Text>
							<Text style={{ color: theme.color.grayscale.C_79737e }}>꿈빛파티시엘</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<ReactionIcon reaction="like" />
							<Text style={{ fontSize: 12, color: theme.color.grayscale.C_79737e }}>15</Text>
							<ReactionIcon reaction="dislike" />
							<Text style={{ fontSize: 12, color: theme.color.grayscale.C_79737e }}>10</Text>
							<ReactionIcon reaction="retweet" />
							<Text style={{ fontSize: 12, color: theme.color.grayscale.C_79737e }}>2</Text>
							<ReactionIcon reaction="comment" />
							<Text style={{ fontSize: 12, color: theme.color.grayscale.C_79737e }}>5</Text>
							<ReactionIcon reaction="save" />
							<Text style={{ fontSize: 12, color: theme.color.grayscale.C_79737e }}>5</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

const renderItem = {};

export default Feed;

const styles = StyleSheet.create({
	filter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		position: 'absolute',
		paddingVertical: 11,
		paddingHorizontal: 20,
		height: h2p(40),
		width: '100%',
		borderBottomWidth: 1,
		borderBottomColor: theme.color.grayscale.eae7ec,
		backgroundColor: theme.color.white
	},
	review: {
		backgroundColor: theme.color.white,
		width: Dimensions.get('window').width - d2p(20),
		marginHorizontal: d2p(10), marginTop: h2p(20),
		borderRadius: 10,
		paddingHorizontal: d2p(15), paddingTop: d2p(15)
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: "center",
		marginVertical: h2p(12),
	},
	title: {
		fontSize: 16, fontWeight: 'bold',
		marginRight: 5
	},
	sign: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: h2p(20), marginBottom: h2p(14.5),
		bordeWidth: 1,
		borderStyle: 'dotted',
		borderColor: theme.color.grayscale.e9e7ec
	},
	date: {
		fontSize: 12,
		color: theme.color.grayscale.a09ca4,
		marginRight: d2p(10)
	}
});