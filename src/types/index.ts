import { StackNavigationProp } from "@react-navigation/stack";
import { NavigationRoute } from "react-navigation";

export interface NavigationType {
  navigation: StackNavigationProp<any>
  route: NavigationRoute;
}