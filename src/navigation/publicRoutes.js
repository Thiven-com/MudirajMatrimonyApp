import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import RegisterScreen from '../screens/RegisterScreen';

import { ROUTES } from './routes';

export const PUBLIC_ROUTES = [
  { name: ROUTES.SPLASH, component: SplashScreen },
  { name: ROUTES.ONBOARDING, component: OnboardingScreen },
  { name: ROUTES.LOGIN, component: LoginScreen },
  { name: ROUTES.FORGOT, component: ForgotPasswordScreen },
  {name: ROUTES.REGISTER, component: RegisterScreen},
];

