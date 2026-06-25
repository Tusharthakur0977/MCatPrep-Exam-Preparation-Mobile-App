/**
 * @format
 */

import React from 'react'; // Import React
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';
import { name as appName } from './app.json';
import { store } from './src/Redux/store';
import { Provider } from 'react-redux';

const RootApp = () => (
  <SafeAreaProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => RootApp);
