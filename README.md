# EverConnect API Standalone

Simple API service to fetch files from Supabase storage.

## API Endpoints

- `GET /health` - Health check
- `GET /api/files/first` - Returns the first file with user data
- `GET /api/files` - Lists all files in the temp folder

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (create `.env` file):
```
SUPABASE_URL=https://lkspowixyoxemnmaetle.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

3. Run the server:
```bash
npm start
```

## Deploy to Render

### Method 1: Using Render Dashboard

1. Push this code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" and select "Web Service"
4. Connect your GitHub account and select your repository
5. Configure the service:
   - **Name**: everconnect-api
   - **Runtime**: Docker
   - **Branch**: main
6. Add environment variables:
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
7. Click "Create Web Service"

### Method 2: Using render.yaml

1. Update the `render.yaml` file with your GitHub repository URL
2. Push to GitHub
3. In Render Dashboard, click "New +" → "Blueprint"
4. Connect your repository
5. Add the `SUPABASE_SERVICE_ROLE_KEY` in the Render dashboard

## Docker Build (Optional)

Build locally:
```bash
docker build -t everconnect-api .
docker run -p 3000:3000 -e SUPABASE_SERVICE_ROLE_KEY=your_key everconnect-api
```

## Usage

Once deployed on Render, you can access:
```
https://your-service-name.onrender.com/api/files/first
```

This will return:
```json
{
  "entries": [
    {
      "First Name": "John",
      "Phone Number": "7777777777",
      "File Upload": "https://lkspowixyoxemnmaetle.supabase.co/storage/v1/object/public/user-files/temp/0.08962897515395651.txt"
    }
  ]
}
```