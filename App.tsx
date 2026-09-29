import * as React from 'react';
import RootNavigator from "./app/Routes/RootNavigator";
import { SafeAreaView } from 'react-native-safe-area-context';


function App() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RootNavigator />
    </SafeAreaView>
  );
}

export default App;
