# 🚀 Production Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` shows no errors  
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] All tests pass (if applicable)

### ✅ Environment Configuration
- [ ] `.env.local` file configured with:
  - [ ] `ADMIN_USERNAME` set to secure username
  - [ ] `ADMIN_PASSWORD` set to secure password
  - [ ] `MONGODB_URI` configured (or left blank for JSON fallback)
  - [ ] `WEBSITE_BROWSER_NAME` set to your site name
- [ ] Production environment variables configured in deployment platform

### ✅ Database Setup (if using MongoDB)
- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with read/write permissions
- [ ] IP whitelist configured (0.0.0.0/0 for cloud deployments)
- [ ] Connection tested: `npm run migrate:test`
- [ ] Data migrated (if applicable): `npm run migrate:simple`

### ✅ Content Preparation
- [ ] Profile information updated via admin dashboard
- [ ] Work and social links configured
- [ ] Sample notes created (optional)
- [ ] Learning items added (optional)

## Deployment Steps

### 🟣 Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Set `NODE_ENV=production`

3. **Domain Configuration**
   - Configure custom domain in Vercel dashboard
   - Verify SSL certificate

### 🟢 Netlify

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add all production variables

### 🔵 Railway

1. **Connect GitHub Repository**
2. **Configure Environment Variables**
3. **Deploy automatically on push**

### 🐳 Docker (Self-hosted)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t bmr-portfolio .
   docker run -p 3000:3000 --env-file .env.local bmr-portfolio
   ```

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Public site loads: `https://your-domain.com`
- [ ] Admin login works: `https://your-domain.com/admin/login`
- [ ] Dashboard displays correctly
- [ ] Profile editing works
- [ ] Notes CRUD operations work
- [ ] Learning CRUD operations work
- [ ] Database connection healthy (check admin dashboard)

### ✅ Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsiveness verified
- [ ] All images load correctly

### ✅ Security Tests
- [ ] Admin routes protected (redirect to login)
- [ ] Environment variables not exposed in browser
- [ ] HTTPS enabled
- [ ] API endpoints require authentication

## Monitoring & Maintenance

### 📊 Regular Checks
- [ ] Database connection status
- [ ] Error logs review
- [ ] Performance monitoring
- [ ] Backup verification (if applicable)

### 🔄 Updates
- [ ] Keep dependencies updated
- [ ] Monitor Next.js updates
- [ ] Security patches applied

## Troubleshooting

### Common Issues & Solutions

#### 🚨 MongoDB Connection Failed
```bash
# Check connection
npm run migrate:test

# Verify URI format
echo $MONGODB_URI

# Use JSON fallback
# App automatically falls back to JSON storage
```

#### 🚨 Admin Login Not Working
```bash
# Verify environment variables
curl https://your-domain.com/api/test-env

# Check credentials in deployment platform
```

#### 🚨 Build Failures
```bash
# Local build test
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Clear cache
rm -rf .next && npm run build
```

#### 🚨 API Errors
```bash
# Check API health
curl https://your-domain.com/api/health

# Check database health
curl https://your-domain.com/api/data?health=true
```

## Rollback Plan

### 🔄 Emergency Rollback
1. **Revert to previous deployment** in platform dashboard
2. **Restore database backup** (if applicable)
3. **Verify functionality** with post-deployment checklist
4. **Document issue** for future prevention

### 💾 Backup Strategy
- **Code**: Git repository with tagged releases
- **Database**: MongoDB Atlas automatic backups
- **Environment**: Documented environment variables
- **Content**: Regular JSON exports via admin dashboard

---

## 📝 Deployment Notes

**Date**: ___________
**Deployed By**: ___________
**Version**: ___________
**Platform**: ___________
**Database**: MongoDB / JSON (circle one)
**Issues**: ___________
**Performance**: ___________

---

**🎯 Your portfolio is production-ready! Remember to test thoroughly and monitor after deployment.**
