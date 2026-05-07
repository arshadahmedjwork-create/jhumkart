import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkjvthcrppjktgogebqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFranZ0aGNycHBqa3Rnb2dlYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYzNTgsImV4cCI6MjA5MzczMjM1OH0.0RzbqSFRg7hIBLc2eWr99JfkMxCtMle1dCZx4LPIaEg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('name, status')
    .limit(10);

  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log('Products found:', data);
  }
}

checkProducts();
