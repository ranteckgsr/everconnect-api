const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://lkspowixyoxemnmaetle.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.warn('Warning: No Supabase key provided. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey || '');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get file by index
app.get('/api/files/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    
    // Special case for "first"
    if (req.params.index === 'first') {
      return res.redirect('/api/files/0');
    }
    
    // Validate index
    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid index. Must be a non-negative number or "first"'
      });
    }
    
    // Fetch profiles from database, ordered by newest first
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, first_name, phone, file_path')
      .order('created_at', { ascending: false })
      .range(index, index);
    
    if (error) {
      throw error;
    }
    
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Profile at index ${index} not found`
      });
    }
    
    const profile = profiles[0];
    let fileUrl = null;
    
    // Generate file URL if file_path exists
    if (profile.file_path && profile.user_id) {
      // Extract filename and remove [1] pattern
      const pathParts = profile.file_path.split('/');
      let filename = pathParts[pathParts.length - 1];
      // Remove [1] or any [number] pattern from filename
      filename = filename.replace(/\[\d+\]/g, '');
      
      // Construct the URL with proper encoding
      const baseUrl = `${supabaseUrl}/storage/v1/object/public/user-files/`;
      const encodedPath = `${profile.user_id}/${encodeURIComponent(filename)}`;
      
      fileUrl = baseUrl + encodedPath;
    }
    
    res.json({
      entries: [
        {
          "First Name": profile.first_name || "",
          "Phone Number": profile.phone || "",
          "File Upload": fileUrl || ""
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching profile by index:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Get multiple profiles by indices (e.g., /api/files/0/1/2)
app.get('/api/files/*', async (req, res) => {
  try {
    // Parse the path to get indices
    const pathParts = req.params[0].split('/').filter(part => part !== '');
    const indices = pathParts.map(part => {
      if (part === 'first') return 0;
      const num = parseInt(part);
      return isNaN(num) ? null : num;
    }).filter(idx => idx !== null && idx >= 0);
    
    if (indices.length === 0) {
      // If no valid indices, return all profiles
      return getAllProfiles(req, res);
    }
    
    // Remove duplicates and sort indices
    const uniqueIndices = [...new Set(indices)].sort((a, b) => a - b);
    const maxIndex = Math.max(...uniqueIndices);
    
    // Fetch profiles from database up to the max index needed
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, first_name, phone, file_path')
      .order('created_at', { ascending: false })
      .range(0, maxIndex);
    
    if (error) {
      throw error;
    }
    
    // Get profiles at specified indices
    const entries = uniqueIndices
      .filter(index => profiles && index < profiles.length)
      .map(index => {
        const profile = profiles[index];
        let fileUrl = null;
        
        // Generate file URL if file_path exists
        if (profile.file_path && profile.user_id) {
          // Extract filename and remove [1] pattern
          const pathParts = profile.file_path.split('/');
          let filename = pathParts[pathParts.length - 1];
          // Remove [1] or any [number] pattern from filename
          filename = filename.replace(/\[\d+\]/g, '');
          
          // Construct the URL with proper encoding
          const baseUrl = `${supabaseUrl}/storage/v1/object/public/user-files/`;
          const encodedPath = `${profile.user_id}/${encodeURIComponent(filename)}`;
          
          fileUrl = baseUrl + encodedPath;
        }
        
        return {
          "First Name": profile.first_name || "",
          "Phone Number": profile.phone || "",
          "File Upload": fileUrl || ""
        };
      });
    
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching multiple profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profiles'
    });
  }
});

// List all profiles
async function getAllProfiles(req, res) {
  try {
    // Fetch all profiles from database, ordered by newest first
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, first_name, phone, file_path')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      throw error;
    }
    
    // Generate entries for each profile
    const entries = profiles.map(profile => {
      let fileUrl = null;
      
      // Generate file URL if file_path exists
      if (profile.file_path && profile.user_id) {
        // Extract filename and remove [1] pattern
        const pathParts = profile.file_path.split('/');
        let filename = pathParts[pathParts.length - 1];
        // Remove [1] or any [number] pattern from filename
        filename = filename.replace(/\[\d+\]/g, '');
        
        // Construct the URL with proper encoding
        const baseUrl = `${supabaseUrl}/storage/v1/object/public/user-files/`;
        const encodedPath = `${profile.user_id}/${encodeURIComponent(filename)}`;
        
        fileUrl = baseUrl + encodedPath;
      }
      
      return {
        "First Name": profile.first_name || "",
        "Phone Number": profile.phone || "",
        "File Upload": fileUrl || ""
      };
    });
    
    res.json({ entries });
  } catch (error) {
    console.error('Error listing profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list profiles'
    });
  }
}

app.get('/api/files', getAllProfiles);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});