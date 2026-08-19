import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

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
