console.log('API Test Results - What you would see with proper service role key:\n');

console.log('1. Health Check (http://localhost:3001/health):');
console.log(JSON.stringify({
  status: 'ok',
  timestamp: new Date().toISOString()
}, null, 2));

console.log('\n2. Get First User (http://localhost:3001/api/users/first):');
console.log(JSON.stringify({
  Name: "John Doe",
  File: "https://lkspowixyoxemnmaetle.supabase.co/storage/v1/object/sign/user-files/550e8400-e29b-41d4-a716-446655440000/document.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  PhoneNumber: "+1234567890"
}, null, 2));

console.log('\n3. Get All Users (http://localhost:3001/api/users):');
console.log(JSON.stringify({
  success: true,
  count: 2,
  data: [
    {
      Name: "John Doe",
      File: "https://lkspowixyoxemnmaetle.supabase.co/storage/v1/object/sign/user-files/550e8400-e29b-41d4-a716-446655440000/document.pdf?token=...",
      PhoneNumber: "+1234567890",
      Email: "john@example.com"
    },
    {
      Name: "Jane Smith",
      File: "https://lkspowixyoxemnmaetle.supabase.co/storage/v1/object/sign/user-files/660e8400-e29b-41d4-a716-446655440001/resume.pdf?token=...",
      PhoneNumber: "+0987654321",
      Email: "jane@example.com"
    }
  ]
}, null, 2));

console.log('\n4. Get Specific User (http://localhost:3001/api/users/550e8400-e29b-41d4-a716-446655440000):');
console.log(JSON.stringify({
  success: true,
  data: {
    Name: "John Doe",
    File: "https://lkspowixyoxemnmaetle.supabase.co/storage/v1/object/sign/user-files/550e8400-e29b-41d4-a716-446655440000/document.pdf?token=...",
    PhoneNumber: "+1234567890",
    Email: "john@example.com"
  }
}, null, 2));