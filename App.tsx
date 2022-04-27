import React from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalNav from './src/navigators/globalNav';

const App = () => {
	return (
		<SafeAreaProvider>
			<GlobalNav />
		</SafeAreaProvider>
	);
};

export default App;