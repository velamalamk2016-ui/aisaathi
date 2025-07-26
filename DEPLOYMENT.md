# AI Saathi Deployment Guide

## 🚀 Production Deployment Steps

### 1. GitHub Repository Setup

```bash
# Initialize repository (if not already done)
git init
git add .
git commit -m "Initial commit: AI Saathi educational platform"
git branch -M main
git remote add origin https://github.com/velamalamk2016-ui/aisaathi.git
git push -u origin main
```

### 2. Environment Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your_postgres_host
PGPORT=5432
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=aisaathi

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
NODE_ENV=production
PORT=5000
```

### 3. Database Setup

#### Option A: Neon Database (Recommended)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project: "AI Saathi"
3. Copy connection string to `DATABASE_URL`
4. Run migrations:
```bash
npm run db:push
```

#### Option B: Self-hosted PostgreSQL
1. Install PostgreSQL 14+
2. Create database: `createdb aisaathi`
3. Configure connection string
4. Run migrations:
```bash
npm run db:push
```

### 4. Google Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Add to environment variables as `GEMINI_API_KEY`
4. Test connection:
```bash
curl -X POST http://localhost:5000/api/teaching-aids/generate \
  -H "Content-Type: application/json" \
  -d '{"subject":"Math","grade":5,"topic":"Addition","language":"Hindi"}'
```

### 5. Production Build

```bash
# Install dependencies
npm install

# Build frontend and backend
npm run build

# Start production server
npm start
```

### 6. Cloud Deployment Options

#### Option A: Vercel (Recommended for Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

#### Option C: Heroku
```bash
# Install Heroku CLI
# Create app
heroku create aisaathi-platform

# Set environment variables
heroku config:set DATABASE_URL=your_connection_string
heroku config:set GEMINI_API_KEY=your_gemini_key

# Deploy
git push heroku main
```

### 7. Health Checks

After deployment, verify these endpoints:

```bash
# Application health
curl https://your-domain.com/api/health

# Database connection
curl https://your-domain.com/api/dashboard/stats

# AI service
curl -X POST https://your-domain.com/api/teaching-aids/generate \
  -H "Content-Type: application/json" \
  -d '{"subject":"Math","grade":3,"topic":"Numbers","language":"English"}'
```

## 🔧 Configuration

### Performance Optimizations

1. **Database Indexing**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX idx_student_profiles_class ON student_profiles(class);
```

2. **Caching Strategy**
```javascript
// TanStack Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

### Security Configuration

1. **Environment Variables**
- Never commit `.env` files
- Use secure secret management in production
- Rotate API keys regularly

2. **Database Security**
- Use connection pooling
- Enable SSL for database connections
- Implement proper access controls

3. **API Security**
- Rate limiting on AI endpoints
- Input validation and sanitization
- CORS configuration for production domains

### Monitoring and Logging

1. **Application Monitoring**
```javascript
// Add to server/index.ts
app.use('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

2. **Database Monitoring**
- Monitor connection pool usage
- Track query performance
- Set up automated backups

3. **AI Service Monitoring**
- Track API usage and costs
- Monitor response times
- Implement fallback strategies

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check migrations
npm run db:push
```

2. **AI Service Errors**
```bash
# Verify API key
echo $GEMINI_API_KEY

# Test Python service
python server/services/teaching_aids_agent.py
```

3. **Build Errors**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Performance Issues

1. **Slow Database Queries**
- Check query execution plans
- Add appropriate indexes
- Optimize complex joins

2. **High Memory Usage**
- Monitor Node.js heap usage
- Implement pagination for large datasets
- Use streaming for file uploads

3. **AI API Rate Limits**
- Implement request queuing
- Add retry mechanisms with exponential backoff
- Cache frequently requested content

## 📊 Maintenance

### Regular Tasks

1. **Weekly**
- Monitor error logs
- Check system performance metrics
- Review AI API usage and costs

2. **Monthly**
- Update dependencies
- Review and rotate secrets
- Backup database and critical data

3. **Quarterly**
- Performance optimization review
- Security audit
- User feedback integration

### Backup Strategy

1. **Database Backups**
```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

2. **Application State**
- Export student profiles
- Backup attendance records
- Archive AI-generated content

### Scaling Considerations

1. **Horizontal Scaling**
- Load balancing across multiple instances
- Database read replicas
- CDN for static assets

2. **Vertical Scaling**
- Increase server resources
- Optimize database performance
- Implement caching layers

---

**Success Metrics**
- Application uptime > 99.5%
- AI response time < 3 seconds
- Database query time < 500ms
- User satisfaction > 4.5/5