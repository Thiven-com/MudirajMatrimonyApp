import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRoutesList } from './routes';

const Tab = createBottomTabNavigator();

export default function MainTabs({ setIsLoggedIn }) {
  const routes = useRoutesList();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {routes.map((route, index) => (
        <Tab.Screen key={index} name={route.name} options={route.options}>
          {props => (
            <route.component {...props} setIsLoggedIn={setIsLoggedIn} />
          )}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}