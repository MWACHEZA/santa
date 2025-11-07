# Deployment Guide - St. Patrick's Catholic Church Website

## 🚀 Quick Start (Local Development)

### Prerequisites
1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

### Installation Steps

1. **Navigate to project directory**
   ```bash
   cd st-patricks-makokoba
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - Navigate to: `http://localhost:3000`
   - The website will automatically reload when you make changes

### Build for Production
```bash
npm run build
```
This creates a `build` folder with optimized production files.

## 🌐 Deployment Options

### Option 1: Netlify (Recommended - Free)

1. **Create Netlify Account**
   - Go to: https://netlify.com
   - Sign up with GitHub, GitLab, or email

2. **Deploy via Drag & Drop**
   - Run `npm run build` locally
   - Drag the `build` folder to Netlify's deploy area
   - Get instant live URL

3. **Deploy via Git (Automatic Updates)**
   - Push code to GitHub/GitLab
   - Connect repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Automatic deployments on code changes

### Option 2: Vercel (Free)

1. **Create Vercel Account**
   - Go to: https://vercel.com
   - Sign up with GitHub

2. **Deploy**
   - Import project from GitHub
   - Vercel auto-detects React settings
   - Automatic deployments

### Option 3: GitHub Pages (Free)

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/st-patricks-makokoba",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: Traditional Web Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload build folder contents**
   - Upload all files from `build` folder to your web host
   - Point domain to the uploaded files
   - Ensure server supports single-page applications (SPA)

## 🔧 Configuration for Production

### Environment Variables
Create `.env` file in root directory:
```env
REACT_APP_SITE_URL=https://stpatricksmakokoba.org
REACT_APP_CONTACT_EMAIL=info@stpatricksmakokoba.org
REACT_APP_PHONE=+263912345678
```

### Custom Domain Setup
1. **Purchase domain** (e.g., stpatricksmakokoba.org)
2. **Configure DNS** to point to your hosting provider
3. **Enable HTTPS** (most providers offer free SSL certificates)

### Performance Optimization
- Images are already optimized for web
- CSS is minified in production build
- JavaScript is bundled and optimized
- Service worker ready for offline functionality

## 📱 Mobile Optimization

The website is fully responsive and optimized for:
- **Smartphones** (iOS Safari, Chrome Mobile)
- **Tablets** (iPad, Android tablets)
- **Desktop** (Chrome, Firefox, Safari, Edge)

### Testing on Different Devices
1. **Chrome DevTools**
   - Press F12 → Toggle device toolbar
   - Test various screen sizes

2. **Real Device Testing**
   - Use local network IP: `http://192.168.1.xxx:3000`
   - Test on actual phones/tablets

## 🌍 Multi-Language Support

### Current Languages
- **English** (default)
- **IsiNdebele** (Zimbabwean local language)

### Adding New Languages
1. **Edit language context**
   - File: `src/contexts/LanguageContext.tsx`
   - Add new language code and translations

2. **Update language toggle**
   - File: `src/components/Header.tsx`
   - Add new language option

## 🔒 Security Considerations

### HTTPS
- Always use HTTPS in production
- Most hosting providers offer free SSL certificates

### Content Security Policy
Add to your hosting provider or server config:
```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com;
```

### Regular Updates
- Update dependencies monthly: `npm update`
- Monitor for security vulnerabilities: `npm audit`

## 📊 Analytics & Monitoring

### Google Analytics (Optional)
1. **Create GA account**
2. **Add tracking code** to `public/index.html`
3. **Monitor visitor statistics**

### Performance Monitoring
- Use Lighthouse (built into Chrome DevTools)
- Monitor Core Web Vitals
- Test page speed regularly

## 🛠 Maintenance

### Regular Tasks
- **Monthly**: Update content (events, announcements)
- **Quarterly**: Review contact information
- **Annually**: Update photos and testimonials

### Content Updates
Key files to update:
- **Announcements**: `src/components/Header.tsx` (urgent banner)
- **Events**: `src/pages/Events.tsx`
- **Contact Info**: `src/pages/Contact.tsx`
- **Mass Times**: `src/pages/Home.tsx`

### Backup Strategy
- **Code**: Keep in Git repository (GitHub/GitLab)
- **Content**: Regular backups of any dynamic content
- **Images**: Store originals separately

## 📞 Support

### Technical Issues
- **Developer**: Contact web development team
- **Hosting**: Contact your hosting provider's support
- **Domain**: Contact domain registrar

### Content Management
- **Parish Staff**: Can update basic content
- **Technical Updates**: Require developer assistance

## 🚨 Emergency Procedures

### Website Down
1. **Check hosting provider status**
2. **Verify domain DNS settings**
3. **Contact hosting support**
4. **Use backup/mirror site if available**

### Urgent Content Updates
1. **Announcements**: Update urgent banner in Header component
2. **Emergency Contact**: Update contact information
3. **Mass Schedule Changes**: Update Home page

## 💰 Cost Breakdown

### Free Options
- **Netlify**: Free tier (100GB bandwidth/month)
- **Vercel**: Free tier (100GB bandwidth/month)
- **GitHub Pages**: Free for public repositories

### Paid Options
- **Custom Domain**: $10-15/year
- **Premium Hosting**: $5-20/month
- **Professional Email**: $5-10/month

### Recommended Setup
- **Domain**: $12/year
- **Netlify Pro**: $19/month (if needed)
- **Total**: ~$240/year for professional setup

## 📈 Future Enhancements

### Phase 2 Features
- **Online Donation System** (PayPal, Stripe integration)
- **Event Registration** (for retreats, workshops)
- **Newsletter Signup** (email collection)
- **Photo Gallery** (dynamic image management)

### Phase 3 Features
- **Content Management System** (easy content updates)
- **Member Portal** (login system for parishioners)
- **Live Streaming** (Mass broadcast integration)
- **Mobile App** (React Native version)

## 📋 Launch Checklist

### Pre-Launch
- [ ] Test all pages and links
- [ ] Verify contact information
- [ ] Test language toggle functionality
- [ ] Check mobile responsiveness
- [ ] Validate HTML and CSS
- [ ] Test form submissions (if any)
- [ ] Set up analytics
- [ ] Configure custom domain
- [ ] Enable HTTPS

### Launch Day
- [ ] Deploy to production
- [ ] Test live website
- [ ] Announce to parish community
- [ ] Share on social media
- [ ] Update church bulletin
- [ ] Train parish staff on updates

### Post-Launch
- [ ] Monitor website performance
- [ ] Collect user feedback
- [ ] Plan regular content updates
- [ ] Schedule maintenance tasks
- [ ] Review analytics data

---

**This deployment guide ensures your St. Patrick's Catholic Church website launches successfully and remains maintainable for years to come.**
