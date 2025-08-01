# EverConnect API

Standalone API service for EverConnect application.

## Features

- RESTful API endpoints for user data
- Supabase integration for data storage
- Docker support for easy deployment
- Rate limiting and security features

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/users` - Get all users with their files
- `GET /api/users/first` - Get the first user
- `GET /api/users/:userId` - Get a specific user by ID

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Supabase credentials to `.env`

5. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment on Render

1. Fork this repository
2. Connect your GitHub account to Render
3. Create a new Web Service
4. Connect your forked repository
5. Add environment variables in Render dashboard:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
6. Deploy!

## Docker

Build and run locally:
```bash
docker build -t everconnect-api .
docker run -p 3001:3001 --env-file .env everconnect-api
```

## Environment Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin access
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## License

MIT
