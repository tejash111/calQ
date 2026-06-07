import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../lib/supabase';

export function useSyncUser() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const syncUser = async () => {
        try {
          const { error } = await supabase.from('users').upsert({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.imageUrl,
          }, { onConflict: 'id' });
          
          if (error) {
            console.error('Error syncing user to Supabase:', error);
          } else {
            console.log('User synced to Supabase successfully!');
          }
        } catch (e) {
          console.error('Exception syncing user:', e);
        }
      };
      
      void syncUser();
    }
  }, [user, isLoaded, isSignedIn]);
}
