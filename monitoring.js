/**
 * CUSTOMER.IO WARMUP CAMPAIGN - MONITORING DASHBOARD
 * Purpose: Track real-time campaign performance and alert on issues
 * Run this AFTER launching the campaign in Customer.io
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const MONITORING_CONFIG = {
  campaignId: 'your_campaign_id_here', // From Customer.io
  checkIntervalMinutes: 15,
  alertThresholds: {
    bounceRate: 2.0,        // % - Pause if exceeded
    spamRate: 0.2,          // % - Pause if exceeded
    minOpenRate: 25.0,      // % - Warning if below
    minDeliveryRate: 98.0   // % - Warning if below
  },
  reportPath: './warmup-campaign-report.json'
};

// ============================================
// MOCK CUSTOMER.IO API (Replace with real API)
// ============================================
const cioAPI = {
  getCampaignMetrics: async (campaignId) => {
    // This would be actual API call in production
    // For demo, we'll generate realistic mock data
    
    const currentDay = Math.floor((Date.now() % (4 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)) + 1;
    
    const mockData = {
      day1: {
        sent: 3300,
        delivered: 3267,
        bounced: 33,
        opened: 1405,
        clicked: 198,
        unsubscribed: 15,
        spam_complaints: 2
      },
      day2: {
        sent: 2900,
        delivered: 2871,
        bounced: 29,
        opened: 1091,
        clicked: 152,
        unsubscribed: 12,
        spam_complaints: 1
      },
      day3: {
        sent: 2500,
        delivered: 2475,
        bounced: 25,
        opened: 866,
        clicked: 116,
        unsubscribed: 10,
        spam_complaints: 1
      },
      day4: {
        sent: 1300,
        delivered: 1287,
        bounced: 13,
        opened: 412,
        clicked: 55,
        unsubscribed: 6,
        spam_complaints: 0
      }
    };
    
    // Return only days that should have data based on current day
    const result = {};
    for (let i = 1; i <= Math.min(currentDay, 4); i++) {
      result[`day${i}`] = mockData[`day${i}`];
    }
    
    return result;
  }
};

// ============================================
// METRICS CALCULATION
// ============================================
function calculateMetrics(dayData) {
  const sent = dayData.sent || 0;
  const delivered = dayData.delivered || 0;
  
  return {
    deliveryRate: sent > 0 ? (delivered / sent * 100).toFixed(2) : 0,
    bounceRate: sent > 0 ? (dayData.bounced / sent * 100).toFixed(2) : 0,
    openRate: delivered > 0 ? (dayData.opened / delivered * 100).toFixed(2) : 0,
    clickRate: delivered > 0 ? (dayData.clicked / delivered * 100).toFixed(2) : 0,
    unsubRate: delivered > 0 ? (dayData.unsubscribed / delivered * 100).toFixed(2) : 0,
    spamRate: delivered > 0 ? (dayData.spam_complaints / delivered * 100).toFixed(4) : 0,
    clickToOpenRate: dayData.opened > 0 ? (dayData.clicked / dayData.opened * 100).toFixed(2) : 0
  };
}

// ============================================
// HEALTH CHECK
// ============================================
function checkCampaignHealth(metrics, dayNumber) {
  const issues = [];
  const warnings = [];
  
  // Critical issues (should pause campaign)
  if (parseFloat(metrics.bounceRate) > MONITORING_CONFIG.alertThresholds.bounceRate) {
    issues.push(`🚨 CRITICAL: Bounce rate ${metrics.bounceRate}% exceeds threshold ${MONITORING_CONFIG.alertThresholds.bounceRate}%`);
  }
  
  if (parseFloat(metrics.spamRate) > MONITORING_CONFIG.alertThresholds.spamRate) {
    issues.push(`🚨 CRITICAL: Spam complaint rate ${metrics.spamRate}% exceeds threshold ${MONITORING_CONFIG.alertThresholds.spamRate}%`);
  }
  
  // Warnings (should investigate)
  if (parseFloat(metrics.openRate) < MONITORING_CONFIG.alertThresholds.minOpenRate) {
    warnings.push(`⚠️  WARNING: Open rate ${metrics.openRate}% below target ${MONITORING_CONFIG.alertThresholds.minOpenRate}%`);
  }
  
  if (parseFloat(metrics.deliveryRate) < MONITORING_CONFIG.alertThresholds.minDeliveryRate) {
    warnings.push(`⚠️  WARNING: Delivery rate ${metrics.deliveryRate}% below target ${MONITORING_CONFIG.alertThresholds.minDeliveryRate}%`);
  }
  
  return {
    status: issues.length > 0 ? 'CRITICAL' : warnings.length > 0 ? 'WARNING' : 'HEALTHY',
    issues,
    warnings
  };
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================
function displayDayMetrics(dayNumber, data, metrics, health) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`📊 DAY ${dayNumber} PERFORMANCE`);
  console.log(`${'═'.repeat(70)}`);
  
  // Volume metrics
  console.log('\n📤 VOLUME:');
  console.log(`  Sent:        ${data.sent.toLocaleString()}`);
  console.log(`  Delivered:   ${data.delivered.toLocaleString()} (${metrics.deliveryRate}%)`);
  console.log(`  Bounced:     ${data.bounced.toLocaleString()} (${metrics.bounceRate}%)`);
  
  // Engagement metrics
  console.log('\n💡 ENGAGEMENT:');
  console.log(`  Opened:      ${data.opened.toLocaleString()} (${metrics.openRate}% of delivered)`);
  console.log(`  Clicked:     ${data.clicked.toLocaleString()} (${metrics.clickRate}% of delivered)`);
  console.log(`  Click/Open:  ${metrics.clickToOpenRate}%`);
  
  // Negative signals
  console.log('\n⚠️  NEGATIVE SIGNALS:');
  console.log(`  Unsubscribed: ${data.unsubscribed.toLocaleString()} (${metrics.unsubRate}%)`);
  console.log(`  Spam:         ${data.spam_complaints.toLocaleString()} (${metrics.spamRate}%)`);
  
  // Health status
  console.log('\n🏥 HEALTH STATUS:');
  const statusEmoji = health.status === 'HEALTHY' ? '✅' : health.status === 'WARNING' ? '⚠️ ' : '🚨';
  console.log(`  ${statusEmoji} ${health.status}`);
  
  if (health.issues.length > 0) {
    console.log('\n  Critical Issues:');
    health.issues.forEach(issue => console.log(`    ${issue}`));
  }
  
  if (health.warnings.length > 0) {
    console.log('\n  Warnings:');
    health.warnings.forEach(warning => console.log(`    ${warning}`));
  }
}

function displayComparison(allMetrics) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`📈 CROSS-DAY COMPARISON`);
  console.log(`${'═'.repeat(70)}\n`);
  
  const days = Object.keys(allMetrics).sort();
  
  // Header
  console.log('Metric          ' + days.map(d => `Day ${d.replace('day', '')}  `).join('  '));
  console.log('-'.repeat(70));
  
  // Metrics table
  const metricNames = [
    { key: 'deliveryRate', label: 'Delivery %     ' },
    { key: 'openRate', label: 'Open %         ' },
    { key: 'clickRate', label: 'Click %        ' },
    { key: 'bounceRate', label: 'Bounce %       ' },
    { key: 'spamRate', label: 'Spam %         ' }
  ];
  
  metricNames.forEach(({ key, label }) => {
    const values = days.map(day => {
      const value = allMetrics[day].metrics[key];
      return String(value).padStart(6);
    });
    console.log(label + values.join('    '));
  });
  
  // Trends
  console.log(`\n${'─'.repeat(70)}`);
  console.log('TRENDS:');
  
  if (days.length >= 2) {
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    
    const openTrend = parseFloat(allMetrics[lastDay].metrics.openRate) - parseFloat(allMetrics[firstDay].metrics.openRate);
    const bounceTrend = parseFloat(allMetrics[lastDay].metrics.bounceRate) - parseFloat(allMetrics[firstDay].metrics.bounceRate);
    
    console.log(`  Open Rate:   ${openTrend >= 0 ? '📈' : '📉'} ${openTrend > 0 ? '+' : ''}${openTrend.toFixed(2)}% from Day 1`);
    console.log(`  Bounce Rate: ${bounceTrend <= 0 ? '✅' : '⚠️ '} ${bounceTrend > 0 ? '+' : ''}${bounceTrend.toFixed(2)}% from Day 1`);
  }
}

function displayRecommendations(allMetrics) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`💡 RECOMMENDATIONS`);
  console.log(`${'═'.repeat(70)}\n`);
  
  const days = Object.keys(allMetrics);
  const latestDay = days[days.length - 1];
  const latestMetrics = allMetrics[latestDay].metrics;
  const latestHealth = allMetrics[latestDay].health;
  
  if (latestHealth.status === 'CRITICAL') {
    console.log('🚨 IMMEDIATE ACTION REQUIRED:');
    console.log('  1. PAUSE the campaign in Customer.io immediately');
    console.log('  2. Export bounced email addresses');
    console.log('  3. Investigate bounce/spam reasons');
    console.log('  4. Verify SPF/DKIM/DMARC records');
    console.log('  5. Contact Customer.io support if issues persist\n');
  } else if (latestHealth.status === 'WARNING') {
    console.log('⚠️  OPTIMIZATION SUGGESTED:');
    
    if (parseFloat(latestMetrics.openRate) < MONITORING_CONFIG.alertThresholds.minOpenRate) {
      console.log('  • Low open rate detected:');
      console.log('    - Test different subject lines');
      console.log('    - Verify sender name is recognizable');
      console.log('    - Check send time optimization');
      console.log('    - Review segment targeting\n');
    }
    
    if (parseFloat(latestMetrics.deliveryRate) < MONITORING_CONFIG.alertThresholds.minDeliveryRate) {
      console.log('  • Delivery issues detected:');
      console.log('    - Validate email addresses before sending');
      console.log('    - Check for typos in domain names');
      console.log('    - Monitor IP reputation\n');
    }
  } else {
    console.log('✅ CAMPAIGN PERFORMING WELL:');
    console.log('  • Continue monitoring daily metrics');
    console.log('  • Maintain current sending patterns');
    console.log('  • Consider scaling volume by 20-30% after Day 4\n');
    
    if (parseFloat(latestMetrics.openRate) > 40) {
      console.log('  🌟 EXCELLENT open rates! Consider:');
      console.log('    - Documenting what\'s working (subject line, content, timing)');
      console.log('    - A/B testing to optimize further');
      console.log('    - Scaling up gradually\n');
    }
  }
}

// ============================================
// MAIN MONITORING FUNCTION
// ============================================
async function runMonitoring() {
  console.clear();
  console.log('🔍 WARMUP CAMPAIGN MONITORING DASHBOARD');
  console.log(`Last updated: ${new Date().toLocaleString()}`);
  console.log(`Refresh interval: ${MONITORING_CONFIG.checkIntervalMinutes} minutes\n`);
  
  try {
    // Fetch campaign data
    const campaignData = await cioAPI.getCampaignMetrics(MONITORING_CONFIG.campaignId);
    
    const allMetrics = {};
    const allHealthChecks = [];
    
    // Process each day
    for (const [day, data] of Object.entries(campaignData)) {
      const dayNumber = parseInt(day.replace('day', ''));
      const metrics = calculateMetrics(data);
      const health = checkCampaignHealth(metrics, dayNumber);
      
      allMetrics[day] = { data, metrics, health };
      allHealthChecks.push(health);
      
      displayDayMetrics(dayNumber, data, metrics, health);
    }
    
    // Show comparison if multiple days
    if (Object.keys(allMetrics).length > 1) {
      displayComparison(allMetrics);
    }
    
    // Show recommendations
    displayRecommendations(allMetrics);
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      campaignId: MONITORING_CONFIG.campaignId,
      metrics: allMetrics,
      overallStatus: allHealthChecks.some(h => h.status === 'CRITICAL') ? 'CRITICAL' :
                     allHealthChecks.some(h => h.status === 'WARNING') ? 'WARNING' : 'HEALTHY'
    };
    
    fs.writeFileSync(
      MONITORING_CONFIG.reportPath,
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n📁 Full report saved to: ${MONITORING_CONFIG.reportPath}`);
    
  } catch (error) {
    console.error('❌ Error fetching campaign metrics:', error);
  }
}

// ============================================
// CONTINUOUS MONITORING MODE
// ============================================
function startContinuousMonitoring() {
  console.log('🚀 Starting continuous monitoring...');
  console.log(`Will check every ${MONITORING_CONFIG.checkIntervalMinutes} minutes`);
  console.log('Press Ctrl+C to stop\n');
  
  // Initial run
  runMonitoring();
  
  // Set up interval
  setInterval(runMonitoring, MONITORING_CONFIG.checkIntervalMinutes * 60 * 1000);
}

// ============================================
// EXECUTE
// ============================================
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--continuous') || args.includes('-c')) {
    startContinuousMonitoring();
  } else {
    runMonitoring().then(() => {
      console.log('\n✅ Monitoring check complete');
      console.log('Tip: Run with --continuous flag for auto-refresh');
    });
  }
}

module.exports = { runMonitoring, calculateMetrics, checkCampaignHealth };
