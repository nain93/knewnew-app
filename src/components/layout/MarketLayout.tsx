import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import BadgeButton from '~/components/button/badgeButton';
import { d2p } from '~/utils';
import { marketList } from '~/utils/constant';
import { MarketType } from '~/types/review';

interface MarketLayoutProps {
  clickedMarket: {
    title: MarketType,
    isClick: boolean
  }[],
  setClickMarket: (marketList: {
    title: MarketType,
    isClick: boolean
  }[]) => void
}

const MarketLayout = ({ clickedMarket, setClickMarket }: MarketLayoutProps) => {

  return (
    <View style={styles.container}>
      {React.Children.toArray(clickedMarket.map((market, marketIdx) => {
        if (market.title === "선택 안함") {
          return null;
        }
        return <BadgeButton onPress={() => setClickMarket(
          clickedMarket.map((v, i) => {
            if (i === marketIdx) {
              return { title: v.title, isClick: !v.isClick };
            }
            return v;
          })
        )} isClick={market.isClick} title={market.title} />;
      }))}
    </View>
  );
};

export default MarketLayout;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingLeft: d2p(10),
    paddingRight: d2p(5)
  }
});