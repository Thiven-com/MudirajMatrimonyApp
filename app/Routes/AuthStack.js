import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { publicRoutes } from './publicRoutes';

const Stack = createNativeStackNavigator();

export default function AuthStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator>
      {publicRoutes.map((route, index) => (
        <Stack.Screen key={"Auth" + index} name={route.name} options={route.options}>
          {props => (
            <route.component {...props} setIsLoggedIn={setIsLoggedIn} />
          )}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
}