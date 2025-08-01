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

// Get first file from user-files bucket
app.get('/api/files/first', async (req, res) => {
  try {
    // The specific file you mentioned
    const fileName = '0.08962897515395651.txt';
    const filePath = `temp/${fileName}`;
    
    // Get public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from('user-files')
      .getPublicUrl(filePath);
    
    const fileUrl = publicUrlData.publicUrl;
    
    // Return in the requested format
    res.json({
      entries: [
        {
          "First Name": "Jasjit",
          "Phone Number": "+1 (587) 357-1556",
          "File Upload": fileUrl
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file URL'
    });
  }
});

// List all files in temp folder
app.get('/api/files', async (req, res) => {
  try {
    // List files in the temp folder
    const { data: files, error } = await supabase.storage
      .from('user-files')
      .list('temp', {
        limit: 100,
        offset: 0
      });
    
    if (error) {
      throw error;
    }
    
    // Generate entries for each file
    const entries = files.map((file, index) => {
      const { data: publicUrlData } = supabase.storage
        .from('user-files')
        .getPublicUrl(`temp/${file.name}`);
      
      return {
        "First Name": `User${index + 1}`,
        "Phone Number": `777777${String(index).padStart(4, '0')}`,
        "File Upload": publicUrlData.publicUrl
      };
    });
    
    res.json({ entries });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list files'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});