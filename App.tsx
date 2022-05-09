import React, { useEffect } from 'react';
import GlobalNav from './src/navigators/globalNav';
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from 'react-native-splash-screen';

const App = () => {

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <SafeAreaProvider>
      <GlobalNav />
    </SafeAreaProvider>
  );
};

export default App;