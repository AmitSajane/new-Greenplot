import { supabase } from './supabase';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const toAppNotification = (row: any): AppNotification => ({
  id: row.id,
  type: row.type || 'notification',
  title: row.title || 'Notification',
  body: row.body || '',
  read: !!row.read,
  createdAt: row.created_at,
});

export const notificationsApi = {
  async fetchForUser(userId: string): Promise<AppNotification[]> {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toAppNotification);
  },

  subscribe(userId: string, onChange: () => void): () => void {
    if (!supabase || !userId) return () => {};
    const client = supabase;
    const channel = client
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        onChange,
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  },
};
