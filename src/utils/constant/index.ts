import { MarketType } from "~/types/review";
import { d2p } from "~/utils";
import Config from "react-native-config";

export const marketList: Array<MarketType> =
  [MarketType["선택 안함"], MarketType.마켓컬리, MarketType.쿠팡프레시, MarketType.SSG, MarketType.B마트, MarketType.윙잇, MarketType.쿠캣마켓];

export const hitslop = { top: d2p(20), left: d2p(20), right: d2p(20), bottom: d2p(20) };

export const versioningIOS = Config.IOS_APP_VERSION;
export const versioningAOS = Config.AOS_APP_VERSION;