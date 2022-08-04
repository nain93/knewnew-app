import { MarketType, ReactionType } from "~/types/review";
import { d2p } from "~/utils";
import Config from "react-native-config";

export const marketList: Array<MarketType> =
  [MarketType.네이버스토어, MarketType.마켓컬리, MarketType.쿠팡프레시, MarketType.SSG, MarketType.B마트, MarketType.윙잇];

export const reactList: Array<ReactionType> =
  [ReactionType.best, ReactionType.good, ReactionType.bad, ReactionType.question];

export const hitslop = { top: d2p(20), left: d2p(20), right: d2p(20), bottom: d2p(20) };

export const versioningIOS = Config.IOS_APP_VERSION;
export const versioningAOS = Config.AOS_APP_VERSION;
export const S3_URL = Config.S3_URL; 