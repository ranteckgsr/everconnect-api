import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test 1: Fetch profiles
    console.log('\nFetching profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    } else {
      console.log('Profiles found:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        console.log('First profile:', profiles[0]);
      }
    }

    // Test 2: Check storage bucket
    console.log('\nChecking storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Bucket list error:', bucketError);
    } else {
      console.log('Buckets found:', buckets?.map(b => b.name).join(', '));
    }

    // Test 3: Try to get a signed URL for a test file
    if (profiles && profiles.length > 0 && profiles[0].file_path) {
      console.log('\nTesting file URL generation...');
      const { data: urlData, error: urlError } = await supabase.storage
        .from('user-files')
        .createSignedUrl(profiles[0].file_path, 3600);
      
      if (urlError) {
        console.error('URL generation error:', urlError);
      } else {
        console.log('Signed URL generated successfully');
        console.log('URL length:', urlData?.signedUrl?.length);
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();