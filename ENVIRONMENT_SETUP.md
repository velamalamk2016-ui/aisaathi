# AI Saathi - Environment Variables Setup Guide

This guide explains how to set up all the environment variables needed for the AI Saathi educational platform.

## Required Environment Variables

### 1. Database Configuration
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```
**Where to get it:**
- If using Replit Database: This is automatically provided
- If using external PostgreSQL: Get from your database provider (Neon, Supabase, etc.)
- Local development: `postgresql://localhost:5432/ai_saathi_db`

### 2. AI Service Configuration
```bash
GEMINI_API_KEY=your_google_gemini_api_key_here
```
**Where to get it:**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Sign in with your Google account
- Create a new API key
- Copy the generated key

### 3. Session Security
```bash
SESSION_SECRET=your_secure_random_string_minimum_32_characters
```
**How to generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. reCAPTCHA Protection (Optional)
```bash
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```
**Where to get it:**
- Visit [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- Create a new site
- Choose reCAPTCHA v2 "I'm not a robot" checkbox
- Add your domain(s)
- Copy both site key and secret key

**For development/testing, use these test keys:**
```bash
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

## Alternative AI Configuration (OpenAI)
If you prefer using OpenAI instead of Gemini:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Complete Environment Template

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database_name

# Google Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key_here

# Session Security
SESSION_SECRET=your_secure_session_secret_key_here_minimum_32_characters

# reCAPTCHA (Optional)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# Optional: OpenAI Alternative
# OPENAI_API_KEY=your_openai_api_key_here

# Development Settings
NODE_ENV=development
PORT=5000
```

## Setting Up in Replit

1. Go to the Secrets tab in your Replit project
2. Add each environment variable as a separate secret
3. The application will automatically use these secrets

## Features Enabled by Each Variable

- **DATABASE_URL**: Student profiles, lesson plans, attendance tracking, progress analytics
- **GEMINI_API_KEY**: AI-powered lesson plans, worksheets, assessments, storytelling, translations
- **SESSION_SECRET**: Secure user authentication and session management
- **RECAPTCHA**: Protection against spam and automated attacks during login
- **OPENAI_API_KEY**: Alternative AI service (if not using Gemini)

## Current Status

Your application is already working with:
- ✅ Database connection (DATABASE_URL)
- ✅ Gemini AI integration (GEMINI_API_KEY)
- ✅ Session management (SESSION_SECRET)
- ⚠️ reCAPTCHA (optional, using test keys if not configured)

All core features are functional and the platform is ready for educational use!