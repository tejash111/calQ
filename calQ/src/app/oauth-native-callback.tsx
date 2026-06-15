import { Redirect } from 'expo-router';

// This is required for Expo Router to not throw an "Unmatched Route" error
// when Clerk's expo-web-browser OAuth flow redirects back to the app using this deep link.
export default function OAuthNativeCallback() {
  // We just return a null or redirect to a safe place. 
  // The actual OAuth handling (setActive, etc) happens in the sign-in/sign-up component's startOAuthFlow promise.
  return <Redirect href="/" />;
}
