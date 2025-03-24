# Deployment Guide for Pi Ludo & Snake Ladder

## GitHub Pages Deployment

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name your repository (e.g., "pi-ludo-game")
   - Make it Public
   - Don't initialize with README (we already have one)

2. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pi-ludo-game.git
   git branch -M main
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "gh-pages" branch as source
   - Save the settings

4. Your app will be available at:
   `https://YOUR_USERNAME.github.io/pi-ludo-game`

## Update Pi Network Developer Portal

After deployment, follow these steps:

1. Log in to Pi Developer Portal:
   - Visit https://developers.minepi.com
   - Sign in with your Pi Network account

2. Create New App:
   - Click "Create New App"
   - Fill in app details using PI_SUBMISSION.md
   - Set App URL to your GitHub Pages URL
   - Request required permissions:
     * Username
     * Payments

3. Submit for Review:
   - Provide testing instructions from PI_SUBMISSION.md
   - Include your GitHub Pages URL
   - Submit for Pi Network team review

## Post-Deployment Checklist

1. Verify the following works on your deployed site:
   - Pi Network authentication
   - Payment processing
   - Game mechanics
   - Responsive design
   - Error handling

2. Test on Pi Browser:
   - Open app in Pi Browser
   - Test authentication
   - Test payments
   - Play both game modes
   - Verify rewards system

3. Monitor and Maintain:
   - Check GitHub Actions for deployment status
   - Monitor Pi Developer Portal for review feedback
   - Address any issues promptly

## Important Notes

- Always test changes locally before pushing to production
- Keep your Pi Developer Portal information updated
- Monitor your app's performance and user feedback
- Maintain regular backups of your codebase
- Keep documentation updated with any changes

## Support

If you encounter any issues:
1. Check GitHub Actions logs for deployment issues
2. Verify Pi Network SDK integration
3. Test in Pi Browser's developer tools
4. Contact Pi Network support if needed