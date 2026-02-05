-- =============================================
-- ENABLE SUPABASE REALTIME
-- Run this in Supabase SQL Editor after PRODUCTION_SETUP.sql
-- =============================================

-- Enable realtime for messages (most important - chat updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for conversations (status changes)
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Enable realtime for escalations (urgent alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE public.escalations;

-- Enable realtime for orders (status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable realtime for notifications (alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Verify realtime is enabled
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
