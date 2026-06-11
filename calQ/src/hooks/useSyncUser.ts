import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { syncUser } from '../lib/api';

export function useSyncUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const doSync = async () => {
        try {
          const token = await getToken();
          if (!token) {
            console.error('No auth token available');
            return;
          }

          await syncUser(token, {
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          });

          console.log('User synced to server successfully!');
        } catch (e) {
          console.error('Error syncing user:', e);
        }
      };

      void doSync();
    }
  }, [user, isLoaded, isSignedIn]);
}
