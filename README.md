# Medifocal - Australian Dental Equipment Supplier

A modern e-commerce platform for dental equipment, supplies, and services in Australia.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Functions, Hosting, Storage, Authentication)
- **Payment**: Stripe
- **Deployment**: Firebase Hosting

## Project Structure

```
medifocal_app/
├── medifocal/          # Main React application
│   ├── components/     # React components
│   ├── contexts/       # React contexts (Auth, Cart)
│   ├── services/       # Service layer (Firestore, Stripe, etc.)
│   ├── utils/          # Utility functions
│   └── public/         # Static assets
├── functions/          # Firebase Cloud Functions
├── dist/              # Build output (generated, not committed)
└── firebase.json      # Firebase configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase CLI: `npm install -g firebase-tools`

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd medifocal
   npm install
   
   cd ../functions
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file in `medifocal/` directory
   - Add required environment variables (see `.env.example` if available)

### Development

```bash
cd medifocal
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

```bash
cd medifocal
npm run build
```

Build output will be in `../dist/` directory.

### Deployment

```bash
# Deploy to Firebase
npx firebase-tools deploy --only hosting,functions
```

## Features

- E-commerce product catalog
- Shopping cart and checkout
- User authentication
- Admin dashboard
- Field service management
- AliExpress integration
- SEO optimized pages
- Responsive design

## License

Proprietary - All rights reserved

