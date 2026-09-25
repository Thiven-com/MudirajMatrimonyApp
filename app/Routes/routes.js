import React from 'react';
import { Dimensions, Platform, View, useColorScheme } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import HomeScreen from '../Tabs/HomeScreen';
import MatchesScreen from '../Tabs/MatchesScreen';
import MessagesScreen from '../Tabs/MessagesScreen';
import ProfileScreen from '../Tabs/ProfileScreen';
import SearchScreen from '../Screens/SearchScreen';
import ProfileDetailsScreen from '../Screens/ProfileDetailsScreen';
import ChatScreen from '../Screens/ChatScreen';
import InterestsScreen from '../Screens/InterestsScreen';
import ShortlistScreen from '../Screens/ShortlistScreen';
import BasicDetailsScreen from '../Screens/BasicDetailsScreen';
import MyPhotosScreen from '../Screens/MyPhotosScreen';
import EditProfileScreen from '../Screens/EditProfileScreen';
import EditBasicInformation from '../Screens/EditBasicInformation';
import PresentAddress from '../Screens/PresentAddress';
import EducationInformation from '../Screens/EducationInformation';
import AddEducation from '../Screens/AddEducation';
import AddCareer from '../Screens/AddCareer';
import ChatConversationScreen from '../Screens/ChatConversationScreen';
import AstronomicInformation from '../Screens/AstronomicInformation';
import EditAstronomicInformation from '../Screens/EditAstronomicInformation';
import FamilyInformation from '../Screens/FamilyInformation';
import CareerInformation from '../Screens/CareerInformation';
import EditCareer from '../Screens/EditCareer';
import EditEducation from '../Screens/EditEducation';
import EditFamilyInformation from '../Screens/EditFamilyInformation';
import EditLanguages from '../Screens/EditLanguages';
import EditSocialBackground from '../Screens/EditSocialBackground';
import ProfileDetailScreen from '../Screens/ProfileDetailScreen';
import Languages from '../Screens/Languages';
import SpiritualBackground from '../Screens/SpiritualBackground';
import NotificationsScreen from '../Screens/NotificationsScreen';
import PaymentHistoryScreen from '../Screens/PaymentHistoryScreen';
import HelpSupportScreen from '../Screens/HelpSupportScreen';
import PaymentScreen from '../Screens/PaymentScreen';
import ChoosePackageScreen from '../Screens/ChoosePackageScreen';
import ProfileVisitorsScreen from '../Screens/ProfileVisitorsScreen';
import RecentlyViewedScreen from '../Screens/RecentlyViewedScreen';
import SubscriptionPlansScreen from '../Screens/SubscriptionPlansScreen';
import PremiumBenefits from '../Screens/PremiumBenefits';

import { DarkTheme, LightTheme } from '../styles/theme';

const width = Dimensions.get('window').width;

export const useRoutesList = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? LightTheme : LightTheme;

  const tabBarStyle = {
    backgroundColor: '#ffffff',
    height: 80,
    borderTopWidth: 0,
    elevation: 10,
    borderColor: '#ffffff',
    borderTopWidth: 1,
    justifyContent: 'space-around',
  };

  const tabBarItemStyle = {
    paddingTop: 20,
    height: 60,
    width: width * 0.25,
    alignItems: 'center',
  };

  const notTabBar = {
    headerShown: false,
    tabBarItemStyle: { display: 'none' },
    tabBarStyle: { display: 'none' },
  }

  return [
    {
      name: 'Home',
      component: HomeScreen,
      options: {
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={tabBarItemStyle}>
            <Icon
              name="home"
              type="material"
              color={focused ? theme.primary : theme.grey}
              size={26}
            />
            <Text style={{
              color: focused ? theme.primary : theme.grey,
              fontSize: 13,
              marginTop: 6,
            }}>
              Home
            </Text>
          </View>
        ),
        tabBarLabel: () => null,
        tabBarStyle,
      },
    },
    {
      name: 'Matches',
      component: MatchesScreen,
      options: {
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={tabBarItemStyle}>
            <Icon
              name="favorite-border"
              type="material"
              color={focused ? theme.primary : theme.grey}
              size={26}
            />
            <Text style={{
              color: focused ? theme.primary : theme.grey,
              fontSize: 13,
              marginTop: 6,
            }}>
              Matches
            </Text>
          </View>
        ),
        tabBarLabel: () => null,
        tabBarStyle,
      },
    },
    {
      name: 'Messages',
      component: MessagesScreen,
      options: {
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={tabBarItemStyle}>
            <Icon
              name="mail-outline"
              type="material"
              color={focused ? theme.primary : theme.grey}
              size={26}
            />
            <Text style={{
              color: focused ? theme.primary : theme.grey,
              fontSize: 13,
              marginTop: 6,
            }}>
              Messages
            </Text>
          </View>
        ),
        tabBarLabel: () => null,
        tabBarStyle,
      },
    },
    {
      name: 'Profile',
      component: ProfileScreen,
      options: {
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={tabBarItemStyle}>
            <Icon
              name="person-outline"
              type="material"
              color={focused ? theme.primary : theme.grey}
              size={24}
            />
            <Text style={{
              color: focused ? theme.primary : theme.grey,
              fontSize: 13,
              marginTop: 6,
            }}>
              Profile
            </Text>
          </View>
        ),
        tabBarLabel: () => null,
        tabBarStyle,
      },
    },
    {
      name: 'AddEducation',
      component: AddEducation,
      options: notTabBar,
    },
    {
      name: 'AddCareer',
      component: AddCareer,
      options: notTabBar,
    },
    {
      name: 'AstronomicInformation',
      component: AstronomicInformation,
      options: notTabBar,
    },
    {
      name: 'CareerInformation',
      component: CareerInformation,
      options: notTabBar,
    },
    {
      name: 'EditCareer',
      component: EditCareer,
      options: notTabBar,
    },
    {
      name: 'EditEducation',
      component: EditEducation,
      options: notTabBar,
    },
    {
      name: 'EditFamilyInformation',
      component: EditFamilyInformation,
      options: notTabBar,
    },
    {
      name: 'EditLanguages',
      component: EditLanguages,
      options: notTabBar,
    },
    {
      name: 'EditSocialBackground',
      component: EditSocialBackground,
      options: notTabBar,
    },
    {
      name: 'SocialSpiritualBackground',
      component: SpiritualBackground,
      options: notTabBar,
    },
    {
      name: 'Notifications',
      component: NotificationsScreen,
      options: notTabBar,
    },
    {
      name: 'PaymentHistory',
      component: PaymentHistoryScreen,
      options: notTabBar,
    },
    {
      name: 'HelpSupport',
      component: HelpSupportScreen,
      options: notTabBar,
    },
    {
      name: 'Payment',
      component: PaymentScreen,
      options: notTabBar,
    },
    {
      name: 'ProfileVisitors',
      component: ProfileVisitorsScreen,
      options: notTabBar,
    },
    {
      name: 'SubscriptionPlans',
      component: SubscriptionPlansScreen,
      options: notTabBar,
    },
    {
      name: 'PremiumBenefits',
      component: PremiumBenefits,
      options: notTabBar,
    },
    {
      name: 'RecentlyViewed',
      component: RecentlyViewedScreen,
      options: notTabBar,
    },
    {
      name: 'ChoosePackageScreen',
      component: ChoosePackageScreen,
      options: notTabBar,
    },
    {
      name: 'Languages',
      component: Languages,
      options: notTabBar,
    },
    {
      name: 'MatchesDetail',
      component: ProfileDetailScreen,
      options: notTabBar,
    },
    {
      name: 'EditAstronomicInformation',
      component: EditAstronomicInformation,
      options: notTabBar,
    },
    {
      name: 'FamilyInformation',
      component: FamilyInformation,
      options: notTabBar,
    },
    {
      name: 'ChatConversion',
      component: ChatConversationScreen,
      options: notTabBar,
    },
    {
      name: 'EducationInformation',
      component: EducationInformation,
      options: notTabBar,
    },
    {
      name: 'PresentAddress',
      component: PresentAddress,
      options: notTabBar,
    },
    {
      name: 'EditBasicInformation',
      component: EditBasicInformation,
      options: notTabBar,
    },
    {
      name: 'EditProfile',
      component: EditProfileScreen,
      options: notTabBar,
    },
    {
      name: 'MyPhotos',
      component: MyPhotosScreen,
      options: notTabBar,
    },
    {
      name: 'BasicDetails',
      component: BasicDetailsScreen,
      options: notTabBar,
    },
    {
      name: 'Shortlist',
      component: ShortlistScreen,
      options: notTabBar,
    },
    {
      name: 'Interests',
      component: InterestsScreen,
      options: notTabBar,
    },
    {
      name: 'Chat',
      component: ChatScreen,
      options: notTabBar,
    },
    {
      name: 'ProfileDetails',
      component: ProfileDetailsScreen,
      options: notTabBar,
    },
    {
      name: 'Search',
      component: SearchScreen,
      options: notTabBar,
    },
  ];
};