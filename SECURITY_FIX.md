# Security Fix: Seed Credentials Moved to Environment Variables

## Issue
GitHub Guardian detected hardcoded credentials in `scripts/seed.js`. This is a security risk as credentials should never be committed to version control.

## Solution
All seed passwords have been moved to environment variables:

### Environment Variables Added to `.env`
```bash
SEED_ADMIN_PASSWORD="admin123"
SEED_FARMER_PASSWORD="farmer123"
SEED_DISTRIBUTOR_PASSWORD="dist123"
SEED_RETAILER_PASSWORD="retail123"
SEED_CONSUMER_PASSWORD="consumer123"
```

### Changes Made
1. **`scripts/seed.js`**: Updated to read passwords from environment variables with fallback defaults
2. **`.env`**: Added seed password configuration variables
3. **`.env.example`**: Added seed password variables as template for other developers

## For Developers
When setting up a new development environment:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the seed passwords in `.env` to your preferred values (for local development only)

3. Run the seed script:
   ```bash
   npm run seed
   ```

## Security Notes
- The `.env` file is already in `.gitignore` and will not be committed
- Default passwords are only for local development
- In production, use strong, unique passwords
- Never commit real credentials to version control

## GitHub Guardian Resolution
This fix removes all hardcoded credentials from the codebase. The seed script now pulls credentials from environment variables, which are properly excluded from version control.
