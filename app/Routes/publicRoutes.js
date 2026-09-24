import SignInScreen from '../Auth/SignInScreen';
import SplashScreen from '../Auth/SplashScreen';
import SignUpScreen from '../Auth/SignUpScreen';
import OtpVerificationScreen from '../Auth/OtpVerificationScreen';
import ForgotPasswordScreen from '../Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../Auth/ResetPasswordScreen';

const options = {
  tabBarButton: (props) => null, tabBarVisible: false, tabBarLabel: '', headerShown: false, tabBarStyle: { display: "none" }, gestureEnabled: false
}
export const publicRoutes = [
  { name: 'Splash', component: SplashScreen, options: options },
  { name: 'SignIn', component: SignInScreen, options: options },
  { name: 'SignUp', component: SignUpScreen, options: options },
  { name: 'VerifyOTP', component: OtpVerificationScreen, options: options },
  { name: 'ForgotPassword', component: ForgotPasswordScreen, options: options },
  { name: 'ResetPassword', component: ResetPasswordScreen, options: options },
];
