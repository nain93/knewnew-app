import { StyleSheet, View, ViewStyle } from 'react-native';
import React from 'react';
import { d2p } from '~/utils';
import SelectMarketButton from '~/components/badge';

interface MarketLayoutProps {
  markets: string[],
  setMarkets: (market: string[]) => void,
  viewStyle?: ViewStyle
}

const MarketLayout = ({ markets, setMarkets, viewStyle }: MarketLayoutProps) => {

  const handleMarketClick = (market: string) => {
    if (markets?.includes(market)) {
      setMarkets(markets?.filter(v => v !== market));
    }
    else {
      setMarkets(markets?.concat(market));
    }
  };

  return (
    <View style={[styles.container, viewStyle]}>
      <SelectMarketButton
        onPress={() => handleMarketClick("마켓컬리")}
        market="마켓컬리" isClick={markets?.includes("마켓컬리")} viewStyle={{ marginRight: d2p(5) }} />
      <SelectMarketButton
        onPress={() => handleMarketClick("쿠팡")}
        market="쿠팡" isClick={markets?.includes("쿠팡")} viewStyle={{ marginRight: d2p(5) }} />
      <SelectMarketButton
        onPress={() => handleMarketClick("B마트")}
        market="B마트" isClick={markets?.includes("B마트")} viewStyle={{ marginRight: d2p(5) }} />
      <SelectMarketButton
        onPress={() => handleMarketClick("SSG")}
        market="SSG" isClick={markets?.includes("SSG")} viewStyle={{ marginRight: d2p(5) }} />
      <SelectMarketButton
        onPress={() => handleMarketClick("네이버쇼핑")}
        market="네이버쇼핑" isClick={markets?.includes("네이버쇼핑")} />
    </View>
  );
};

export default MarketLayout;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  }
});