# Lavandería Oriental - WhatsApp AI Concierge Platform

Production-grade AI-powered WhatsApp concierge system for multi-location laundry service chain.

## Features

- ✅ WhatsApp Business API Integration (Twilio)
- ✅ AI-Powered Conversations (Claude Sonnet 4.5)
- ✅ Multi-location Support
- ✅ Real-time Dashboard
- ✅ Order Management
- ✅ Customer Management
- ✅ Auto-escalation to Humans
- ✅ Analytics & Reporting
- ✅ Knowledge Base System

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI:** Anthropic Claude API
- **WhatsApp:** Twilio WhatsApp Business API
- **Deployment:** Vercel

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/lavanderia-oriental.git
cd lavanderia-oriental
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the schema:
   ```bash
   # Copy the contents of supabase-schema.sql
   # Paste into Supabase SQL Editor
   # Execute
   ```
3. Get your project URL and keys from Settings → API

### 3. Set Up Twilio WhatsApp

1. Sign up at https://www.twilio.com
2. Get WhatsApp Sandbox number or buy a WhatsApp Business number
3. Set webhook URL to: `https://your-app.vercel.app/api/whatsapp/webhook`

### 4. Get Anthropic API Key

1. Sign up at https://console.anthropic.com
2. Create an API key
3. Add to environment variables

### 5. Configure Environment Variables

```bash
cp .env.example .env.local
# Fill in all the values
```

### 6. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

### 7. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then promote to production
vercel --prod
```

## Environment Variables

### Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin access)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_WHATSAPP_NUMBER` - Twilio WhatsApp number (format: +14155238886)
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude

### Optional

- `NEXT_PUBLIC_APP_URL` - Your app URL (for webhooks)
- `NODE_ENV` - Environment (development/production)

## Database Schema

The complete schema is in `supabase-schema.sql`. Key tables:

- `conversations` - WhatsApp conversations
- `customers` - Customer profiles
- `messages` - Individual messages
- `orders` - Service orders
- `locations` - Business locations
- `services` - Service catalog
- `knowledge_base` - FAQ/knowledge base
- `escalations` - Escalated conversations
- `notifications` - Notification queue
- `daily_reports` - Analytics

## API Endpoints

### WhatsApp
- `POST /api/whatsapp/webhook` - Incoming WhatsApp messages
- `POST /api/whatsapp/send` - Send WhatsApp message

### Conversations
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation
- `POST /api/conversations/:id/escalate` - Escalate to human

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id` - Update order

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/reports` - Daily reports

## Development

### Project Structure

```
/app
  /dashboard          # Dashboard UI
  /api
    /whatsapp         # WhatsApp endpoints
    /ai               # AI endpoints
/lib
  supabase.ts         # Supabase client
  ai-engine.ts        # AI conversation engine
/types                # TypeScript types
/components           # React components
```

### Adding Features

1. Create new API route in `/app/api`
2. Add UI components in `/components`
3. Add pages in `/app`
4. Update types in `/types`

## Testing

### Test WhatsApp Integration

1. Send message to your Twilio WhatsApp number
2. Check Supabase tables for new records
3. Verify AI response in WhatsApp
4. Check dashboard for conversation

### Test Dashboard

1. Visit `/dashboard`
2. Verify stats are loading
3. Test navigation
4. Check real-time updates

## Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] RLS policies enabled
- [ ] Twilio account set up
- [ ] WhatsApp number configured
- [ ] Webhook URL configured in Twilio
- [ ] Anthropic API key obtained
- [ ] All environment variables set in Vercel
- [ ] Vercel project deployed
- [ ] DNS configured (if custom domain)
- [ ] SSL enabled

## Post-Deployment

### Seed Data

Add initial data:
1. Locations (your business locations)
2. Services (your service catalog)
3. Knowledge base (FAQs)
4. System config (business hours, etc.)

### Test End-to-End

1. Send WhatsApp message
2. Verify AI responds
3. Check conversation in dashboard
4. Test order creation
5. Verify escalation workflow

## Troubleshooting

### WhatsApp not receiving messages
- Check Twilio webhook URL is correct
- Verify environment variables
- Check Twilio console for error logs

### AI not responding
- Verify Anthropic API key
- Check API rate limits
- Review server logs

### Database errors
- Check Supabase connection
- Verify RLS policies
- Check service role key

## Support

For issues or questions:
1. Check this README
2. Review Supabase logs
3. Check Vercel deployment logs
4. Review Twilio error logs

## License

MachineMind Proprietary

---

Built with Genesis Autonomous Build System™
