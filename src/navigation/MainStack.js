import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { STACK_ROUTES } from './stackRoutes';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={ROUTES.MAIN_TABS} component={TabNavigator} />
    {STACK_ROUTES.map(route => (
      <Stack.Screen
        key={route.name}
        name={route.name}
        component={route.component}
      />
    ))}
  </Stack.Navigator>
);

export default MainStack;
