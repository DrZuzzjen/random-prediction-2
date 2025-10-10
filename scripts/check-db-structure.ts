// Quick script to check actual database structure
import { supabaseAdmin } from '../lib/supabaseAdmin';

async function checkStructure() {
  console.log('🔍 Checking database structure...\n');

  // Check game_runs structure
  const { data: gameRun, error: gameError } = await supabaseAdmin
    .from('game_runs')
    .select('*')
    .limit(1)
    .single();

  console.log('📊 game_runs table columns:');
  if (gameRun) {
    console.log(Object.keys(gameRun));
    console.log('\nSample row:', gameRun);
  } else {
    console.log('No data or error:', gameError);
  }

  console.log('\n---\n');

  // Check leaderboard structure
  const { data: leaderboard, error: leaderError } = await supabaseAdmin
    .from('leaderboard')
    .select('*')
    .limit(1)
    .single();

  console.log('🏆 leaderboard table columns:');
  if (leaderboard) {
    console.log(Object.keys(leaderboard));
    console.log('\nSample row:', leaderboard);
  } else {
    console.log('No data or error:', leaderError);
  }

  // Count total records
  const { count: gameCount } = await supabaseAdmin
    .from('game_runs')
    .select('*', { count: 'exact', head: true });

  const { count: leaderCount } = await supabaseAdmin
    .from('leaderboard')
    .select('*', { count: 'exact', head: true });

  console.log('\n📈 Record counts:');
  console.log(`  game_runs: ${gameCount} records`);
  console.log(`  leaderboard: ${leaderCount} records`);
}

checkStructure().catch(console.error);
