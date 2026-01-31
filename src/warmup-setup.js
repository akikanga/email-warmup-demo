/**
 * CUSTOMER.IO WARMUP CAMPAIGN - USER PREPARATION SCRIPT
 * Purpose: Assign users to warmup batches with engagement scoring
 * Run this BEFORE launching the Customer.io workflow
 */

// ============================================
// CONFIGURATION
// ============================================
const WARMUP_CONFIG = {
  totalUsers: 10000,
  batchDistribution: [0.33, 0.29, 0.25, 0.13], // Day 1, 2, 3, 4
  engagementThresholdDays: 90, // Filter out inactive >90 days
  testMode: true // Set to false for production run
};

// ============================================
// CUSTOMER.IO API SETUP
// ============================================
const CIO_SITE_ID = 'your_site_id_here';
const CIO_API_KEY = 'your_api_key_here';
const CIO_TRACK_URL = 'https://track.customer.io/api/v1';

// Mock Customer.io client (replace with actual SDK)
const cio = {
  identify: async (userId, attributes) => {
    if (WARMUP_CONFIG.testMode) {
      console.log(`[TEST MODE] User ${userId}:`, attributes);
      return { success: true };
    }
    // Production implementation:
    // const response = await fetch(`${CIO_TRACK_URL}/customers/${userId}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${CIO_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(attributes)
    // });
    // return response.json();
  }
};

// ============================================
// ENGAGEMENT SCORING FUNCTION
// ============================================
function calculateEngagementScore(user) {
  let score = 0;
  
  // Recent opens (max 100 points)
  if (user.last_opened_days_ago !== null) {
    score += Math.max(0, 100 - user.last_opened_days_ago);
  }
  
  // Recent clicks (max 200 points, weighted 2x)
  if (user.last_clicked_days_ago !== null) {
    score += Math.max(0, (100 - user.last_clicked_days_ago) * 2);
  }
  
  // Total opens in last 30 days (max 50 points)
  score += Math.min(50, (user.opens_30d || 0) * 5);
  
  // Total clicks in last 30 days (max 100 points)
  score += Math.min(100, (user.clicks_30d || 0) * 10);
  
  return score;
}

// ============================================
// ENGAGEMENT TIER ASSIGNMENT
// ============================================
function getEngagementTier(percentile) {
  if (percentile < 0.33) return 'hot';
  if (percentile < 0.62) return 'warm';
  if (percentile < 0.87) return 'cool';
  return 'cold';
}

// ============================================
// MOCK USER DATA GENERATOR (for demo)
// ============================================
function generateMockUsers(count) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const userId = `user_${String(i + 1).padStart(5, '0')}`;
    const email = `${userId}@example.com`;
    
    // Randomize engagement patterns
    const isEngaged = Math.random() > 0.3; // 70% engaged
    
    users.push({
      id: userId,
      email: email,
      last_opened_days_ago: isEngaged ? Math.floor(Math.random() * 60) : Math.floor(Math.random() * 120) + 60,
      last_clicked_days_ago: isEngaged ? Math.floor(Math.random() * 90) : null,
      opens_30d: isEngaged ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 2),
      clicks_30d: isEngaged ? Math.floor(Math.random() * 5) : 0,
      signup_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return users;
}

// ============================================
// MAIN WARMUP PREPARATION FUNCTION
// ============================================
async function prepareWarmupCampaign() {
  console.log('🚀 Starting Warmup Campaign Preparation...\n');
  console.log(`Total Users: ${WARMUP_CONFIG.totalUsers.toLocaleString()}`);
  console.log(`Batch Distribution: ${WARMUP_CONFIG.batchDistribution.map((p, i) => `Day ${i+1}: ${(p*100).toFixed(0)}%`).join(', ')}\n`);
  
  // Step 1: Get users (using mock data for demo)
  console.log('📊 Step 1: Fetching users...');
  const users = generateMockUsers(WARMUP_CONFIG.totalUsers);
  console.log(`✓ Retrieved ${users.length} users\n`);
  
  // Step 2: Filter out inactive users
  console.log('🔍 Step 2: Filtering inactive users...');
  const activeUsers = users.filter(user => 
    user.last_opened_days_ago !== null && 
    user.last_opened_days_ago <= WARMUP_CONFIG.engagementThresholdDays
  );
  console.log(`✓ Filtered to ${activeUsers.length} active users (removed ${users.length - activeUsers.length} inactive)\n`);
  
  // Step 3: Score users by engagement
  console.log('⚡ Step 3: Calculating engagement scores...');
  const scoredUsers = activeUsers.map(user => ({
    ...user,
    engagementScore: calculateEngagementScore(user)
  })).sort((a, b) => b.engagementScore - a.engagementScore);
  console.log(`✓ Scored and sorted ${scoredUsers.length} users\n`);
  
  // Step 4: Assign warmup days and tiers
  console.log('📅 Step 4: Assigning warmup batches...');
  
  const batchStats = {
    day1: { count: 0, tiers: { hot: 0, warm: 0, cool: 0, cold: 0 } },
    day2: { count: 0, tiers: { hot: 0, warm: 0, cool: 0, cold: 0 } },
    day3: { count: 0, tiers: { hot: 0, warm: 0, cool: 0, cold: 0 } },
    day4: { count: 0, tiers: { hot: 0, warm: 0, cool: 0, cold: 0 } }
  };
  
  for (let i = 0; i < scoredUsers.length; i++) {
    const user = scoredUsers[i];
    const percentile = i / scoredUsers.length;
    
    // Assign warmup day based on position (most engaged first)
    let warmupDay;
    if (percentile < 0.33) warmupDay = 1;
    else if (percentile < 0.62) warmupDay = 2;
    else if (percentile < 0.87) warmupDay = 3;
    else warmupDay = 4;
    
    // Assign engagement tier
    const tier = getEngagementTier(percentile);
    
    // Update Customer.io profile
    await cio.identify(user.id, {
      warmup_day: warmupDay,
      engagement_tier: tier,
      engagement_score: user.engagementScore,
      warmup_assigned_at: new Date().toISOString()
    });
    
    // Track stats
    batchStats[`day${warmupDay}`].count++;
    batchStats[`day${warmupDay}`].tiers[tier]++;
    
    // Progress indicator
    if ((i + 1) % 1000 === 0) {
      console.log(`  Processed ${i + 1}/${scoredUsers.length} users...`);
    }
  }
  
  console.log(`✓ Assigned all users to warmup batches\n`);
  
  // Step 5: Display summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📈 WARMUP CAMPAIGN SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('BATCH DISTRIBUTION:');
  Object.keys(batchStats).forEach((day, index) => {
    const stats = batchStats[day];
    const percentage = ((stats.count / scoredUsers.length) * 100).toFixed(1);
    console.log(`\nDay ${index + 1}: ${stats.count.toLocaleString()} users (${percentage}%)`);
    console.log(`  🔥 Hot:  ${stats.tiers.hot.toLocaleString()}`);
    console.log(`  🌡️  Warm: ${stats.tiers.warm.toLocaleString()}`);
    console.log(`  ❄️  Cool: ${stats.tiers.cool.toLocaleString()}`);
    console.log(`  🧊 Cold: ${stats.tiers.cold.toLocaleString()}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ PREPARATION COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('NEXT STEPS:');
  console.log('1. Review the batch distribution above');
  console.log('2. Log into Customer.io');
  console.log('3. Follow the workflow setup guide');
  console.log('4. Launch the campaign!\n');
  
  return batchStats;
}

// ============================================
// EXECUTE
// ============================================
if (require.main === module) {
  prepareWarmupCampaign()
    .then(stats => {
      console.log('Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { prepareWarmupCampaign, calculateEngagementScore };
