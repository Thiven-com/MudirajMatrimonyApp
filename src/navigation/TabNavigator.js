/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Text } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TAB_ROUTES } from './tabRoutes';

const Tab = createMaterialTopTabNavigator();

// No back-handling logic here anymore — it all lives in RootNavigation.js
// as a single global handler, which avoids multiple competing
// hardwareBackPress listeners across different screens/navigators.
const TabNavigator = () => (
  <Tab.Navigator
    tabBarPosition="bottom"
    screenOptions={{
      swipeEnabled: true,
      animationEnabled: true,
      tabBarShowIcon: true,
      tabBarActiveTintColor: '#CC0000',
      tabBarInactiveTintColor: '#999999',
      tabBarIndicatorStyle: { height: 0 },
      tabBarPressColor: 'transparent',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        height: 62,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarItemStyle: {
        paddingTop: 6,
        paddingBottom: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'none',
        margin: 0,
      },
    }}>
    {TAB_ROUTES.map(screen => (
      <Tab.Screen
        key={screen.name}
        name={screen.name}
        component={screen.component}
        options={{
          tabBarIcon: () => (
            <Text style={{ fontSize: 22 }}>
              {screen.icon}
            </Text>
          ),
        }}
      />
    ))}
  </Tab.Navigator>
);

export default TabNavigator;
