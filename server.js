import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://lkspowixyoxemnmaetle.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all users data endpoint
app.get('/api/users', async (req, res) => {
  try {
    // Fetch all profiles with user data
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (profileError) {
      throw profileError;
    }

    // Process each profile to get file URL
    const usersData = await Promise.all(
      profiles.map(async (profile) => {
        let fileUrl = null;
        
        // Get public URL for the file if it exists
        if (profile.file_path || profile.file_name) {
          try {
            // Files are stored in temp folder
            const fileName = profile.file_name || profile.file_path.split('/').pop();
            const filePath = `temp/${fileName}`;
            
            const { data: publicUrlData } = supabase.storage
              .from('user-files')
              .getPublicUrl(filePath);
            
            fileUrl = publicUrlData.publicUrl;
          } catch (error) {
            console.error(`Error getting file URL for user ${profile.user_id}:`, error);
          }
        }

        // Get user email from auth.users
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);

        return {
          Name: `${profile.first_name} ${profile.last_name}`,
          File: fileUrl,
          PhoneNumber: profile.phone,
          Email: authUser?.user?.email || null
        };
      })
    );

    res.json({
      success: true,
      count: usersData.length,
      data: usersData
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users data'
    });
  }
});

// Get single user data endpoint
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch profile for specific user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      throw profileError;
    }

    let fileUrl = null;
    
    // Get public URL for the file if it exists
    if (profile.file_path || profile.file_name) {
      try {
        // Files are stored in temp folder
        const fileName = profile.file_name || profile.file_path.split('/').pop();
        const filePath = `temp/${fileName}`;
        
        const { data: publicUrlData } = supabase.storage
          .from('user-files')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrlData.publicUrl;
      } catch (error) {
        console.error(`Error getting file URL for user ${userId}:`, error);
      }
    }

    // Get user email from auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);

    res.json({
      success: true,
      data: {
        Name: `${profile.first_name} ${profile.last_name}`,
        File: fileUrl,
        PhoneNumber: profile.phone,
        Email: authUser?.user?.email || null
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
});

// Get first user data endpoint (as requested)
app.get('/api/users/first', async (req, res) => {
  try {
    // Fetch the first profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1);

    if (profileError) {
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No users found'
      });
    }

    const profile = profiles[0];
    let fileUrl = null;
    
    // Get public URL for the file if it exists
    if (profile.file_path || profile.file_name) {
      try {
        // Files are stored in temp folder
        const fileName = profile.file_name || profile.file_path.split('/').pop();
        const filePath = `temp/${fileName}`;
        
        // Use public URL approach
        const { data: publicUrlData } = supabase.storage
          .from('user-files')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrlData.publicUrl;
        
      } catch (error) {
        console.error(`Error getting file URL:`, error);
        fileUrl = null;
      }
    }

    // Get user email from auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);

    res.json({
      Name: `${profile.first_name} ${profile.last_name}`,
      File: fileUrl,
      PhoneNumber: profile.phone
    });
  } catch (error) {
    console.error('Error fetching first user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints:`);
  console.log(`  - GET /api/users - Get all users`);
  console.log(`  - GET /api/users/first - Get first user`);
  console.log(`  - GET /api/users/:userId - Get specific user`);
});