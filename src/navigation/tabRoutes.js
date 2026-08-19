import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { ROUTES } from './routes';

export const TAB_ROUTES = [
  { name: ROUTES.HOME, component: HomeScreen, icon: '🏠' },
  { name: ROUTES.MATCHES, component: MatchesScreen, icon: '❤️' },
  { name: ROUTES.MESSAGES, component: MessagesScreen, icon: '💬' },
  { name: ROUTES.PROFILE, component: ProfileScreen, icon: '👤' },
];
