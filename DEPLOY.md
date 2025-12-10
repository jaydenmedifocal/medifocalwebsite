# Medifocal App - Deployment Guide

## Project Structure

```
medifocal app/
├── dist/              # Build output (deployed to Firebase Hosting)
├── functions/         # Firebase Cloud Functions
├── medifocal/         # Main React application source
├── firebase.json      # Firebase configuration
├── firestore.rules    # Firestore security rules
└── storage.rules      # Firebase Storage security rules
```

## Build Process

### 1. Build the React Application
```bash
cd medifocal
npm install
npm run build
```

This will:
- Build the React app using Vite
- Output to `../dist` (root level)
- Generate optimized production bundles

### 2. Build Firebase Functions (if needed)
```bash
cd functions
npm install
npm run build
```

### 3. Deploy to Firebase
```bash
# From root directory
firebase deploy
```

Or deploy specific services:
```bash
firebase deploy --only hosting    # Deploy website
firebase deploy --only functions  # Deploy Cloud Functions
firebase deploy --only firestore   # Deploy Firestore rules
```

## Build Configuration

- **Source**: `medifocal/` directory
- **Build Output**: `dist/` directory (root level)
- **Build Tool**: Vite
- **Hosting**: Firebase Hosting (points to `dist/`)

## Important Notes

1. **Single Build Output**: There is only ONE build output directory: `./dist`
   - Vite config builds to `../dist` (parent directory)
   - Firebase Hosting serves from `dist/`

2. **No Duplicates**: 
   - No duplicate dist/build folders
   - No old backup builds
   - Clean, single source of truth

3. **Environment Variables**:
   - Never commit `.env` files
   - Use Firebase Functions config for production secrets
   - `.env.example` is ignored by git

4. **Build Commands**:
   - `npm run build` - Build production bundle
   - `npm run dev` - Development server
   - `npm run preview` - Preview production build locally

## Deployment Checklist

- [ ] Run `npm install` in `medifocal/` directory
- [ ] Run `npm run build` to create production build
- [ ] Verify `dist/` folder contains `index.html` and assets
- [ ] Run `firebase deploy --only hosting` to deploy
- [ ] Verify deployment at https://medifocal.web.app

## Troubleshooting

If build fails:
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear dist folder: `rm -rf dist && npm run build`
3. Check for TypeScript errors: `npm run build` will show errors

If deployment fails:
1. Verify Firebase login: `firebase login`
2. Check Firebase project: `firebase use --list`
3. Verify firebase.json configuration



