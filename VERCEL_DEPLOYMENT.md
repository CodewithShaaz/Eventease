# Vercel Deployment Guide

## Environment Variables Required:

Set these in your Vercel dashboard:

### Database
- `DATABASE_URL` = `postgresql://eventease_db_czch_user:dwnIvTPLCAlMjjKm1vwnKq5MXZJoozlC@dpg-d2ke14qli9vc73e8crqg-a.singapore-postgres.render.com/eventease_db_czch`

### Authentication  
- `NEXTAUTH_SECRET` = `nlR/NpKs+rRgVxcV8zRb9B8W1Mi3upchmV//a5PrIhQ=`
- `NEXTAUTH_URL` = `https://your-app-name.vercel.app` (update after deployment)

## Deployment Steps:

1. Go to https://vercel.com/new
2. Import your GitHub repository: `CodewithShaaz/Eventease`
3. Add the environment variables above
4. Deploy!

## Post-Deployment:
1. Update NEXTAUTH_URL with your actual Vercel URL
2. Update README.md with new live URL
3. Test all functionality

## Performance Benefits:
- ⚡ Sub-second cold starts (vs 50+ seconds on Render)
- 🌐 Global CDN edge locations
- 🔄 Automatic deployments on git push
- 💰 More generous free tier limits
