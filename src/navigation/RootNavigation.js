import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { PUBLIC_ROUTES } from './publicRoutes';
import MainStack from './MainStack';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const onBackPress = () => {
      // Wait until navigation is ready
      if (!navigationRef.isReady()) {
        return false;
      }
const state = navigationRef.getRootState();
console.log('Root State');
console.log(JSON.stringify(rootState, null, 2));

console.log('Main Stack State');
console.log(JSON.stringify(mainStackState, null, 2));

console.log('Current Main Screen');
console.log(currentMainScreen);

console.log('Tab State');
console.log(tabState);
      const rootState = navigationRef.getRootState();

      if (!rootState) {
        return false;
      }

      // Current screen in Root Stack
      const rootRoute = rootState.routes[rootState.index];

      // If not inside MainStack, use normal back
      if (rootRoute.name !== 'MainStack') {
        if (navigationRef.canGoBack()) {
          navigationRef.goBack();
          return true;
        }

        return false;
      }

      const mainStackState = rootRoute.state;

      if (!mainStackState) {
        return false;
      }

      const currentMainScreen =
        mainStackState.routes[mainStackState.index];

      // ===========================
      // STACK SCREEN
      // ===========================
      if (currentMainScreen.name !== ROUTES.MAIN_TABS) {
        navigationRef.goBack();
        return true;
      }

      // ===========================
      // TAB SCREEN
      // ===========================
      const tabState = currentMainScreen.state;

      if (!tabState) {
        return false;
      }

      const currentTab =
        tabState.routes[tabState.index].name;

      console.log('Current Tab : ', currentTab);

      // Home -> Exit App
      if (currentTab === ROUTES.HOME) {
        return false;
      }

      // Any other tab -> Home
      // Any other tab -> Home
navigationRef.navigate(ROUTES.MAIN_TABS, {
  screen: ROUTES.HOME,
});

return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {PUBLIC_ROUTES.map(route => (
          <Stack.Screen
            key={route.name}
            name={route.name}
            component={route.component}
          />
        ))}

        <Stack.Screen
          name="MainStack"
          component={MainStack}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
