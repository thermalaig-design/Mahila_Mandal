import { supabase } from './supabaseClient';

const resolveTrustId = async (trustId = null, trustName = null) => {
  if (trustId) return trustId;

  const localTrustId = localStorage.getItem('selected_trust_id');
  if (localTrustId) return localTrustId;

  const nameCandidate = trustName || localStorage.getItem('selected_trust_name');
  if (!nameCandidate) return null;

  const { data, error } = await supabase
    .from('Trust')
    .select('id')
    .ilike('name', String(nameCandidate).trim())
    .limit(1);

  if (error) throw error;
  return data?.[0]?.id || null;
};

const todayIsoDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fetchNoticeboardItems = async ({ trustId = null, trustName = null, includeExpired = false } = {}) => {
  try {
    const resolvedTrustId = await resolveTrustId(trustId, trustName);
    if (!resolvedTrustId) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('noticeboard')
      .select('id, trust_id, type, name, description, attachments, start_date, end_date, status, created_at, updated_at')
      .eq('trust_id', resolvedTrustId)
      .eq('status', 'active')
      .order('start_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const today = todayIsoDate();
    const filtered = (data || []).filter((item) => {
      if (includeExpired) return true;
      const startsOk = !item.start_date || item.start_date <= today;
      const endsOk = !item.end_date || item.end_date >= today;
      return startsOk && endsOk;
    });

    return { success: true, data: filtered };
  } catch (error) {
    console.error('Error fetching noticeboard items:', error);
    return { success: false, data: [], message: error.message || 'Failed to fetch noticeboard items' };
  }
};

export const fetchEvents = async ({ trustId = null, trustName = null, includePast = false } = {}) => {
  try {
    const resolvedTrustId = await resolveTrustId(trustId, trustName);
    if (!resolvedTrustId) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('events')
      .select('id, trust_id, type, title, description, banner_image, attachments, location, event_date, start_time, end_time, max_participants, is_registration_required, status, created_at, updated_at')
      .eq('trust_id', resolvedTrustId)
      .eq('status', 'active')
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true, nullsFirst: true });

    if (error) throw error;

    const today = todayIsoDate();
    const filtered = (data || []).filter((item) => (includePast ? true : item.event_date >= today));

    return { success: true, data: filtered };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { success: false, data: [], message: error.message || 'Failed to fetch events' };
  }
};
