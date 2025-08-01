import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDirectAccess() {
  try {
    console.log('Testing direct access to user data...\n');
    
    // Fetch first profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1);

    if (profileError) {
      console.error('Profile error:', profileError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found');
      return;
    }

    const profile = profiles[0];
    console.log('Profile:', profile);
    console.log('\nFile path:', profile.file_path);

    // Try different approaches to get the file
    if (profile.file_path) {
      // Method 1: Direct signed URL
      console.log('\nMethod 1: Direct signed URL');
      const { data: url1, error: error1 } = await supabase.storage
        .from('user-files')
        .createSignedUrl(profile.file_path, 3600);
      
      if (error1) {
        console.error('Error 1:', error1.message);
      } else {
        console.log('Success! URL:', url1.signedUrl.substring(0, 100) + '...');
      }

      // Method 2: Public URL
      console.log('\nMethod 2: Public URL');
      const { data: publicUrl } = supabase.storage
        .from('user-files')
        .getPublicUrl(profile.file_path);
      console.log('Public URL:', publicUrl.publicUrl.substring(0, 100) + '...');

      // Method 3: List files to check path
      console.log('\nMethod 3: List files in user directory');
      const userId = profile.user_id;
      const { data: files, error: listError } = await supabase.storage
        .from('user-files')
        .list(userId, {
          limit: 10
        });
      
      if (listError) {
        console.error('List error:', listError);
      } else {
        console.log('Files found:', files);
        if (files && files.length > 0) {
          // Try to get signed URL for the first file
          const firstFile = files[0];
          const fullPath = `${userId}/${firstFile.name}`;
          console.log('\nTrying signed URL for:', fullPath);
          const { data: url3, error: error3 } = await supabase.storage
            .from('user-files')
            .createSignedUrl(fullPath, 3600);
          
          if (error3) {
            console.error('Error 3:', error3);
          } else {
            console.log('Success with listed file! URL:', url3.signedUrl.substring(0, 100) + '...');
          }
        }
      }
    }

    // Get auth user email
    console.log('\nFetching auth user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.user_id);
    
    if (authError) {
      console.error('Auth error:', authError);
    } else {
      console.log('Auth user email:', authUser?.user?.email);
    }

    // Final output in requested format
    console.log('\n\nFinal output format:');
    console.log(JSON.stringify({
      Name: `${profile.first_name} ${profile.last_name}`,
      File: 'Would be the signed URL here',
      PhoneNumber: profile.phone
    }, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDirectAccess();