# Deployment Guide - Lavandería Oriental

## Prerequisites

- GitHub account
- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Twilio account (https://twilio.com)
- Anthropic API key (https://console.anthropic.com)

## Step-by-Step Deployment

### 1. Push to GitHub

```bash
# Create new repo on GitHub
# Then push:
git remote add origin https://github.com/yourusername/lavanderia-oriental.git
git branch -M main
git push -u origin main
```

### 2. Set Up Supabase

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details
4. Wait for database to initialize
5. Go to SQL Editor
6. Copy contents of `supabase-schema.sql`
7. Execute the SQL
8. Go to Settings → API
9. Copy Project URL and anon key

### 3. Set Up Twilio

1. Sign up at https://www.twilio.com
2. Go to Messaging → Try WhatsApp
3. Follow setup wizard
4. Note your sandbox number
5. Go to Console
6. Copy Account SID and Auth Token
7. Set webhook URL (we'll update this after Vercel deployment)

### 4. Get Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up/log in
3. Go to API Keys
4. Create new key
5. Copy the key

### 5. Deploy to Vercel

1. Go to https://vercel.com
2. Click "Import Project"
3. Connect GitHub
4. Select the `lavanderia-oriental` repository
5. Framework Preset: Next.js
6. Click "Deploy"

### 6. Configure Environment Variables in Vercel

After deployment:

1. Go to your project in Vercel
2. Click Settings → Environment Variables
3. Add each variable from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL = https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = your-auth-token
TWILIO_WHATSAPP_NUMBER = +14155238886
ANTHROPIC_API_KEY = sk-ant-xxxxx
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
NODE_ENV = production
```

4. Click "Save"
5. Redeploy (Deployments → ... → Redeploy)

### 7. Update Twilio Webhook

1. Go to Twilio Console
2. Messaging → Settings → WhatsApp Sandbox Settings
3. Set "When a message comes in" webhook to:
   ```
   https://your-app.vercel.app/api/whatsapp/webhook
   ```
4. Method: HTTP POST
5. Save

### 8. Verify Deployment

1. Visit https://your-app.vercel.app
2. Should see dashboard
3. Send test WhatsApp message to your Twilio number
4. Verify you get AI response
5. Check dashboard for new conversation

### 9. Seed Initial Data (Optional)

Use Supabase SQL Editor to add:

```sql
-- Add your locations
INSERT INTO locations (name, slug, address, city, phone, whatsapp) VALUES
('Sede Principal', 'principal', 'Calle 10 #5-25', 'Cartagena', '+573001234567', '+573001234567'),
('Sede Norte', 'norte', 'Av. Pedro de Heredia', 'Cartagena', '+573007654321', '+573007654321');

-- Add service categories
INSERT INTO service_categories (name, slug, description) VALUES
('Lavandería', 'lavanderia', 'Servicios de lavado'),
('Tintorería', 'tintoreria', 'Servicios de limpieza en seco');

-- Add services
INSERT INTO services (category_id, name, slug, price_lavado, price_secado) VALUES
((SELECT id FROM service_categories WHERE slug = 'lavanderia'), 'Ropa Regular', 'ropa-regular', 8000, 5000);

-- Add knowledge base
INSERT INTO knowledge_base (category, question, answer, language) VALUES
('pricing', '¿Cuánto cuesta lavar ropa?', 'El servicio de lavado de ropa regular cuesta $8,000 COP por carga.', 'es'),
('hours', '¿Cuál es el horario?', 'Estamos abiertos de lunes a sábado de 8am a 6pm.', 'es');
```

## Testing in Production

### Test 1: WhatsApp Integration

1. Send message to Twilio WhatsApp number
2. Expect AI response within seconds
3. Check Supabase `conversations` table
4. Verify `messages` table has records

### Test 2: Dashboard

1. Visit dashboard
2. Stats should show:
   - Active conversations: 1+
   - Today's orders: 0
   - Revenue: $0
   - Total customers: 1+

### Test 3: Escalation

1. Send message: "Quiero hablar con un humano"
2. AI should respond and escalate
3. Check `escalations` table in Supabase
4. Conversation status should be "escalated"

## Monitoring

### Vercel Logs

```bash
vercel logs --follow
```

### Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs"
3. Filter by time range

### Twilio Logs

1. Go to Twilio Console
2. Monitor → Logs → Messaging
3. Check for errors

## Rollback

If something goes wrong:

```bash
# Revert to previous deployment in Vercel
# Or push a fix:
git revert HEAD
git push origin main
```

## Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` in env vars
5. Update Twilio webhook URL

## Support

Issues? Check:
1. Vercel deployment logs
2. Supabase database logs
3. Twilio error logs
4. Browser console (for frontend issues)

---

Deployed with Genesis Autonomous Build System™
