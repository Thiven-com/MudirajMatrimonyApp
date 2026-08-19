import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * useCustomBackHandler
 *
 * Hardware back button always navigates to a specific target screen,
 * instead of relying on the navigation stack's default pop behavior.
 *
 * HOW IT WORKS:
 * When you navigate INTO a screen, pass params like this:
 *   navigation.navigate('EditProfile', {
 *     page: 'Profile',        // where back should go
 *     prev_params: { ... },   // any params that screen needs when returning
 *   });
 *
 * If no `page` param was passed, back defaults to "Home".
 *
 * USAGE (inside any screen component):
 *   import useCustomBackHandler from '../navigation/useCustomBackHandler';
 *   ...
 *   const route = useRoute(); // from '@react-navigation/native'
 *   useCustomBackHandler(navigation, route);
 */
export default function useCustomBackHandler(navigation, route) {
  useFocusEffect(
    useCallback(() => {
      const handleBackButtonClick = () => {
        navigation.navigate(
          route?.params?.page ?? 'Home',
          route?.params?.prev_params
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackButtonClick
      );

      return () => backHandler.remove();
    }, [navigation, route])
  );
}