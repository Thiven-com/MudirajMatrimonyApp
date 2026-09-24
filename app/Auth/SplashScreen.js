import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    StatusBar,
    BackHandler,
} from 'react-native';
import {
    useFocusEffect
} from "@react-navigation/native";

const SplashScreen = ({ navigation, setIsLoggedIn }) => {


    useFocusEffect(
        useCallback(() => {
            getUser();
            const onBackPress = () => {
                if (navigation.canGoBack()) {
                    navigation.goBack();
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress,
            );

            return () => subscription.remove();
        }, [navigation]),
    );


    const getUser = async () => {
        try {
            let user = await AsyncStorage.getItem("authToken");
            if (user != undefined && user != null && user != "") {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
                navigation.navigate('SignIn');
            }
        } catch (error) {
            setIsLoggedIn(false);
            navigation.navigate('SignIn');
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.title}>Mudiraj World</Text>
            <Text style={styles.subtitle}>Matrimony</Text>

            <Text style={styles.tagline}>
                A Trusted Matrimony for Mudiraj Community
            </Text>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Trusted • Secure • Together
                </Text>
            </View>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 180,
        height: 180,
        marginBottom: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: '#E30613',
    },
    subtitle: {
        fontSize: 24,
        color: '#000',
        marginTop: -5,
    },
    tagline: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 25,
        paddingHorizontal: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    footerText: {
        color: '#E30613',
        fontSize: 14,
        fontWeight: '600',
    },
});