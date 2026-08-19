import SearchScreen from '../screens/SearchScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import PremiumScreen from '../screens/PremiumScreen';
import MatchesScreen from '../screens/MatchesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ManagePhotosScreen from '../screens/ManagePhotosScreen';
import ChatConversationScreen from '../screens/ChatConversationScreen';
import VisitorsScreen from '../screens/VisitorsScreen';
import ShortlistedScreen from '../screens/ShortlistedScreen';
import { ROUTES } from './routes';

export const STACK_ROUTES = [
  { name: ROUTES.SEARCH, component: SearchScreen },
  { name: ROUTES.PROFILE_DETAIL, component: ProfileDetailScreen },
  { name: ROUTES.PREMIUM, component: PremiumScreen },
  { name: ROUTES.EDIT_PROFILE, component: EditProfileScreen },
  { name: ROUTES.MANAGE_PHOTOS, component: ManagePhotosScreen },
  { name: ROUTES.CHAT_CONVERSATION, component: ChatConversationScreen },
{name: ROUTES.VISITORS, component: VisitorsScreen},
{ name: ROUTES.SHORT_LISTED, component: ShortlistedScreen },
{name: ROUTES.MATCHES, component: MatchesScreen },
];
