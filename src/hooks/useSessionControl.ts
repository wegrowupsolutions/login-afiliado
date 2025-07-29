import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSessionControl = () => {
  const { user, signOut } = useAuth();
  const checkingRef = useRef(false);

  const checkActiveSessions = useCallback(async () => {
    // Prevent concurrent checks
    if (checkingRef.current || !user) return;
    
    checkingRef.current = true;
    
    try {
      const { data: sessions, error } = await supabase
        .from('active_sessions')
        .select('id, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error checking sessions:', error);
        return;
      }

      const activeSessionCount = sessions?.length || 0;
      
      // Only log significant events to reduce noise
      if (activeSessionCount > 1) {
        console.warn(`Multiple active sessions detected: ${activeSessionCount}`);
        
        // Invalidate all sessions except current one
        await supabase
          .from('active_sessions')
          .update({ is_active: false })
          .eq('user_id', user.id);
          
        // Sign out with proper cleanup
        await signOut();
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      checkingRef.current = false;
    }
  }, [user, signOut]);

  useEffect(() => {
    if (!user) return;

    // Initial check with delay to avoid race conditions
    const initialTimeout = setTimeout(checkActiveSessions, 1000);

    // Set up periodic checks with longer interval to reduce server load
    const interval = setInterval(checkActiveSessions, 60000); // 1 minute instead of 30 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user, checkActiveSessions]);
};