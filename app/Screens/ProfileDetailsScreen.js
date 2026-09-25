import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  BackHandler,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  useFocusEffect
} from "@react-navigation/native";

const ProfileDetailsScreen = ({ navigation, route }) => {

  const onBackPress = () => {
    navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Image */}

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            }}
            style={styles.image}
            onError={(e) => console.log('Image Load Error:', e.nativeEvent.error)}
          />

          {/* Top Controls */}

          <TouchableOpacity style={styles.backBtn}
            onPress={() =>
              onBackPress()
            }>
            <Feather
              name="arrow-left"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreBtn}>
            <Feather
              name="more-horizontal"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>

          {/* Counter */}

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              1/5
            </Text>
          </View>

          {/* Floating Buttons */}

          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather
                name="heart"
                size={22}
                color="#E30613"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={20}
                color="#555"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Feather
                name="share-2"
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details Card */}

        <View style={styles.card}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              Swathi Mudiraj
            </Text>

            <MaterialIcons
              name="verified"
              size={18}
              color="#1DB954"
            />
          </View>

          <Text style={styles.info}>
            26, Vijayawada, Andhra Pradesh
          </Text>

          <Text style={styles.info}>
            B.Tech, Software Engineer
          </Text>

          <Text style={styles.info}>
            Mudiraj, Hindu
          </Text>

          <View style={styles.divider} />

          <Text style={styles.heading}>
            About Me
          </Text>

          <Text style={styles.about}>
            I am a simple, family-oriented person
            with traditional values and modern
            outlook.
          </Text>

          <Text style={styles.about}>
            Looking for a life partner who is
            caring, understanding and supportive.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.shortlistBtn}>
          <Feather
            name="star"
            size={16}
            color="#E30613"
          />
          <Text style={styles.shortlistText}>
            Shortlist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messageBtn}>
          <MaterialIcons
            name="chat"
            size={16}
            color="#B00000"
          />
          <Text style={styles.messageText}>
            Message
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interestBtn}>
          <Feather
            name="heart"
            size={16}
            color="#FFF"
          />
          <Text style={styles.interestText}>
            Interest
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  imageContainer: {
    position: 'relative',
  },

  image: {
    backgroundColor: "#dedede",
    width: '100%',
    height: 420,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  backBtn: {
    position: 'absolute',
    top: 55,
    left: 15,
  },

  moreBtn: {
    position: 'absolute',
    top: 55,
    right: 15,
  },

  counter: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  counterText: {
    color: '#FFF',
    fontSize: 12,
  },

  actionIcons: {
    position: 'absolute',
    right: 15,
    bottom: -25,
    flexDirection: 'row',
  },

  iconBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 5,
  },

  card: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    fontSize: 34,
    fontWeight: '700',
    color: '#222',
    marginRight: 5,
  },

  info: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 20,
  },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#222',
  },

  about: {
    fontSize: 16,
    lineHeight: 28,
    color: '#444',
    marginBottom: 10,
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
  },

  shortlistBtn: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    backgroundColor: "#ffffff",
    borderColor: '#E5C9C9',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexDirection: 'row',
  },

  messageBtn: {
    flex: 1.3,
    height: 52,
    backgroundColor: '#FFD73A',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexDirection: 'row',
  },

  interestBtn: {
    flex: 1.3,
    height: 52,
    backgroundColor: '#D90000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  shortlistText: {
    marginLeft: 5,
    color: '#444',
    fontWeight: '600',
  },

  messageText: {
    marginLeft: 5,
    color: '#222',
    fontWeight: '700',
  },

  interestText: {
    marginLeft: 5,
    color: '#FFF',
    fontWeight: '700',
  },
});