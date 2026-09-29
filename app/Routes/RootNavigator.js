import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Change to false to start with the Auth stack

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isLoggedIn ? (
                    <Stack.Screen name="Auth">
                        {props => (
                            <AuthStack {...props} setIsLoggedIn={setIsLoggedIn} />
                        )}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="Main">
                        {props => (
                            <MainTabs {...props} setIsLoggedIn={setIsLoggedIn} />
                        )}
                    </Stack.Screen>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}