# Deployment Guide - Render

## Prerequisites
- GitHub account
- Render account (free tier available at render.com)

## Step-by-Step Deployment

### 1. Prepare Your Code
```bash
# Make sure you're in the project directory
cd Find-ting

# Update API_URL in app.js to use environment variable
# Change: const API_URL = 'http://localhost:5000/api';
# To: const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://your-backend-url.onrender.com/api';
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. Deploy Backend on Render

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: shophub-backend
   - **Root Directory**: backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free

5. Add Environment Variables:
   - `SECRET_KEY`: (generate random string)
   - `JWT_SECRET_KEY`: (generate random string)
   - `DATABASE_URL`: (Render will provide this if you add PostgreSQL)

6. Click "Create Web Service"
7. Copy the backend URL (e.g., https://shophub-backend.onrender.com)

### 4. Deploy Frontend on Render

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: shophub-frontend
   - **Root Directory**: . (leave empty or use root)
   - **Build Command**: (leave empty)
   - **Publish Directory**: . (root directory)

4. Click "Create Static Site"

### 5. Update Frontend API URL

After backend is deployed, update app.js:
```javascript
const API_URL = 'https://YOUR-BACKEND-URL.onrender.com/api';
```

Then push changes:
```bash
git add app.js
git commit -m "Update API URL for production"
git push
```

### 6. Database Setup (Optional - PostgreSQL)

For production database:
1. In Render Dashboard → "New +" → "PostgreSQL"
2. Create database
3. Copy the "Internal Database URL"
4. Add to backend environment variables as `DATABASE_URL`
5. Update backend/app.py to use PostgreSQL instead of SQLite

## Alternative: Single Service Deployment

If you want to serve frontend from backend:

1. Move index.html, styles.css, app.js to backend/static/
2. Update backend/app.py:
```python
from flask import send_from_directory

@app.route('/')
def serve_frontend():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)
```

3. Deploy only backend as Web Service
4. Use same URL for both frontend and API

## Testing Deployment

1. Visit your frontend URL
2. Check browser console for errors
3. Test login/signup
4. Test product loading
5. Test cart and checkout

## Troubleshooting

- **CORS errors**: Make sure CORS is enabled in backend
- **API not loading**: Check backend logs in Render dashboard
- **Database errors**: Ensure DATABASE_URL is set correctly
- **Free tier sleep**: Render free tier sleeps after 15 min inactivity

## Cost
- **Free Tier**: Both services free (backend sleeps after inactivity)
- **Paid Tier**: $7/month per service for always-on

## Notes
- Free tier backend spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid tier for production use
