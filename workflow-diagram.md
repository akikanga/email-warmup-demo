# CUSTOMER.IO WARMUP WORKFLOW - VISUAL DIAGRAM

## Complete Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          WARMUP CAMPAIGN ENTRY                          │
│                                                                         │
│  Trigger: Segment                                                       │
│  Condition: warmup_day EXISTS AND engagement_tier EXISTS                │
│  Expected: 8,743 users (after filtering inactive)                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ENGAGEMENT TIER BRANCH                             │
│                      (Safety Filter - Optional)                         │
└────┬─────────┬─────────┬─────────┬─────────┬──────────────────────────┘
     │         │         │         │         │
     │hot      │warm     │cool     │cold     │otherwise
     │         │         │         │         │
     │33%      │29%      │25%      │13%      │0%
     │2,885    │2,535    │2,185    │1,138    │0
     │users    │users    │users    │users    │users
     │         │         │         │         │
     │         │         │         │         ▼
     │         │         │         │    ┌─────────┐
     │         │         │         │    │  EXIT   │
     │         │         │         │    └─────────┘
     │         │         │         │
     └────┬────┴────┬────┴────┬────┴─── OR continue to Day assignment
          │         │         │
          └────┬────┴────┬────┘
               │         │
               ▼         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       WARMUP DAY BRANCH                                 │
│                       (The Core Routing)                                │
└────┬─────────┬─────────┬─────────┬─────────────────────────────────────┘
     │         │         │         │
     │Day 1    │Day 2    │Day 3    │Day 4
     │33%      │29%      │25%      │13%
     │2,885    │2,535    │2,185    │1,138
     │users    │users    │users    │users
     │         │         │         │
     ▼         ▼         ▼         ▼
┌────────┐┌────────┐┌────────┐┌────────┐
│ SEND   ││ WAIT   ││ WAIT   ││ WAIT   │
│ NOW    ││ 24h    ││ 48h    ││ 72h    │
│        ││        ││        ││        │
│ Tag:   ││ Tag:   ││ Tag:   ││ Tag:   │
│ batch_1││ batch_2││ batch_3││ batch_4│
└───┬────┘└───┬────┘└───┬────┘└───┬────┘
    │         │         │         │
    │         ▼         │         │
    │    ┌────────┐    │         │
    │    │ SEND   │    │         │
    │    │ EMAIL  │    │         │
    │    │        │    │         │
    │    │ Tag:   │    │         │
    │    │ batch_2│    │         │
    │    └───┬────┘    │         │
    │        │         │         │
    │        │         ▼         │
    │        │    ┌────────┐    │
    │        │    │ SEND   │    │
    │        │    │ EMAIL  │    │
    │        │    │        │    │
    │        │    │ Tag:   │    │
    │        │    │ batch_3│    │
    │        │    └───┬────┘    │
    │        │        │         │
    │        │        │         ▼
    │        │        │    ┌────────┐
    │        │        │    │ SEND   │
    │        │        │    │ EMAIL  │
    │        │        │    │        │
    │        │        │    │ Tag:   │
    │        │        │    │ batch_4│
    │        │        │    └───┬────┘
    │        │        │        │
    └────┬───┴────┬───┴────┬───┴─────────────────────────────┐
         │        │        │                                 │
         ▼        ▼        ▼                                 ▼
    ┌──────────────────────────────────────────────────────────┐
    │              ALL USERS COMPLETE                         │
    │              Track in Analytics                         │
    └──────────────────────────────────────────────────────────┘
```

---

## Detailed Day-by-Day Flow

### DAY 1 - IMMEDIATE SEND (T+0 hours)
```
Start: Campaign launches at 9:00 AM
  │
  ├─ 2,885 users (warmup_day=1) enter workflow
  ├─ Filtered by engagement_tier (hot users only)
  ├─ No time delay
  ├─ Send email immediately
  │
  └─ Expected completion: 9:15 AM
     └─ Tagged: warmup_batch_1
```

**Monitoring Window:** 9:00 AM - 6:00 PM
- Check open rates every 2 hours
- Alert if bounce >2% or spam >0.1%

---

### DAY 2 - 24 HOUR DELAY (T+24 hours)
```
Start: Day 1 at 9:00 AM
  │
  ├─ 2,535 users (warmup_day=2) enter workflow
  ├─ Filtered by engagement_tier (warm users)
  ├─ WAIT 24 hours
  │   │
  │   └─ During wait:
  │       ├─ Users can still unsubscribe (exit workflow)
  │       ├─ Users can still be removed from segment
  │       └─ Campaign can be paused if Day 1 issues
  │
  └─ Day 2 at 9:00 AM: Send email
     └─ Tagged: warmup_batch_2
```

**Monitoring Window:** Day 2, 9:00 AM - 6:00 PM
- Compare metrics to Day 1
- Check for consistency or improvement

---

### DAY 3 - 48 HOUR DELAY (T+48 hours)
```
Start: Day 1 at 9:00 AM
  │
  ├─ 2,185 users (warmup_day=3) enter workflow
  ├─ Filtered by engagement_tier (cool users)
  ├─ WAIT 48 hours
  │
  └─ Day 3 at 9:00 AM: Send email
     └─ Tagged: warmup_batch_3
```

**Monitoring Window:** Day 3, 9:00 AM - 6:00 PM
- Engagement may be slightly lower (expected)
- Bounce rate should remain <2%

---

### DAY 4 - 72 HOUR DELAY (T+72 hours)
```
Start: Day 1 at 9:00 AM
  │
  ├─ 1,138 users (warmup_day=4) enter workflow
  ├─ Filtered by engagement_tier (cold or remaining)
  ├─ WAIT 72 hours
  │
  └─ Day 4 at 9:00 AM: Send email
     └─ Tagged: warmup_batch_4
```

**Monitoring Window:** Day 4, 9:00 AM - 6:00 PM
- Final batch, lowest expected engagement
- Focus on deliverability over engagement

---

## Real-World Timing Example

### Scenario: Launch Monday 9:00 AM EST

```
MONDAY 9:00 AM (Day 1)
├─ 2,885 hot users receive email
├─ Expected opens: 1,154 (40%)
└─ Monitor until 6:00 PM

TUESDAY 9:00 AM (Day 2)
├─ 2,535 warm users receive email
├─ Expected opens: 887 (35%)
└─ Compare to Day 1 performance

WEDNESDAY 9:00 AM (Day 3)
├─ 2,185 cool users receive email
├─ Expected opens: 655 (30%)
└─ Check trend consistency

THURSDAY 9:00 AM (Day 4)
├─ 1,138 cold/remaining users receive email
├─ Expected opens: 284 (25%)
└─ Final warmup batch

FRIDAY
├─ Review complete campaign analytics
├─ Calculate next steps for scaling
└─ Plan ongoing sending schedule
```

---

## Customer.io Canvas Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Customer.io Workflow Canvas                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Trigger: Segment]                                             │
│   warmup_day exists                                             │
│   engagement_tier exists                                        │
│           │                                                     │
│           ▼                                                     │
│  [Branch: engagement_tier] ─── hot ─── [merge]                 │
│           │                      warm ── [merge]                │
│           │                      cool ── [merge]                │
│           │                      cold ── [Exit] (optional)      │
│           │                                                     │
│           ▼                                                     │
│  [Branch: warmup_day] ──┬── 1 ──> [Send Email]                 │
│                         ├── 2 ──> [Wait 24h] ──> [Send Email]  │
│                         ├── 3 ──> [Wait 48h] ──> [Send Email]  │
│                         └── 4 ──> [Wait 72h] ──> [Send Email]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Checklist for Each Send Email Action

For **EVERY** "Send Email" action in the workflow:

```yaml
Email Configuration:
  ✓ Template: warmup-email-template.html
  ✓ Subject: "🚀 Welcome to [Your Company]!"
  ✓ From Name: "Team at [Your Company]"
  ✓ From Email: hello@yourcompany.com
  ✓ Reply-To: support@yourcompany.com
  
Tracking:
  ✓ Opens: Enabled
  ✓ Clicks: Enabled
  ✓ Custom Tracking Domain: track.yourcompany.com
  
Tags:
  ✓ Batch Tag: warmup_batch_1 (or 2, 3, 4)
  ✓ Campaign Tag: warmup_campaign_2026_q1
  
Advanced:
  ✓ Link Tracking: Enabled
  ✓ Unsubscribe Handling: Automatic
  ✓ Bounce Handling: Automatic
  ✓ Send Time Optimization: Disabled (we control timing)
```

---

## Error Handling Paths

### Exit Conditions (Users Leave Workflow)

```
[User enters workflow]
      │
      ├─ User unsubscribes ────────────> [Exit]
      ├─ User's warmup_day removed ────> [Exit]
      ├─ Campaign paused ───────────────> [Pending]
      ├─ User hard bounced ─────────────> [Exit]
      └─ Segment filter no longer met ─> [Exit]
```

### Pause Scenarios

```
IF bounce_rate > 2%:
  ├─ PAUSE campaign
  ├─ Alert admin
  ├─ Review bounced addresses
  └─ Fix issues before resume

IF spam_rate > 0.2%:
  ├─ PAUSE campaign immediately
  ├─ Investigate content
  ├─ Check sender authentication
  └─ Contact Customer.io support

IF open_rate < 25%:
  ├─ Continue but monitor closely
  ├─ Review subject line
  └─ Check sender name recognition
```

---

## Analytics Views to Create

### In Customer.io Dashboard

**View 1: Overview**
```
Name: Warmup Campaign - Overall Performance
Filters: Campaign = "warmup_campaign_2026_q1"
Metrics:
  - Total Sent
  - Delivery Rate
  - Open Rate
  - Click Rate
  - Bounce Rate
  - Unsubscribe Rate
```

**View 2: By Batch**
```
Name: Warmup Campaign - Batch Comparison
Filters: Split by tag (warmup_batch_1, warmup_batch_2, etc.)
Metrics:
  - Open Rate per batch
  - Click Rate per batch
  - Engagement trends
```

**View 3: By Tier**
```
Name: Warmup Campaign - Engagement Tier Performance
Filters: Split by engagement_tier
Metrics:
  - Hot tier performance
  - Warm tier performance
  - Cool tier performance
  - Cold tier performance
```

---

## Integration Points

### Webhook Setup (Optional)

Configure Customer.io webhooks to notify external systems:

```javascript
// Webhook endpoints to configure
POST /webhook/email-sent
POST /webhook/email-opened
POST /webhook/email-clicked
POST /webhook/email-bounced
POST /webhook/email-unsubscribed

// Example payload
{
  "event_type": "email_opened",
  "customer_id": "user_00123",
  "campaign_id": "warmup_campaign_2026_q1",
  "batch": "warmup_batch_1",
  "engagement_tier": "hot",
  "timestamp": "2026-01-31T09:15:32Z"
}
```

### Slack Notifications

```javascript
// Configure in monitoring script
if (bounceRate > 2) {
  sendSlackAlert({
    channel: "#email-ops",
    message: "🚨 CRITICAL: Warmup campaign bounce rate exceeded 2%",
    metrics: { bounceRate, sent, bounced }
  });
}
```

---

## Success Metrics Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║              WARMUP CAMPAIGN SUCCESS METRICS                  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Overall Performance:                                         ║
║  ✓ Total Sent:        8,743                                   ║
║  ✓ Delivery Rate:     98.5%  (Target: >98%)                   ║
║  ✓ Open Rate:         38.2%  (Target: >35%)                   ║
║  ✓ Click Rate:        6.8%   (Target: >5%)                    ║
║  ✓ Bounce Rate:       1.5%   (Target: <2%)                    ║
║  ✓ Spam Rate:         0.08%  (Target: <0.1%)                  ║
║                                                               ║
║  Batch Breakdown:                                             ║
║  Day 1: 45.0% open  (2,885 sends) ✓                           ║
║  Day 2: 38.0% open  (2,535 sends) ✓                           ║
║  Day 3: 33.5% open  (2,185 sends) ✓                           ║
║  Day 4: 28.2% open  (1,138 sends) ✓                           ║
║                                                               ║
║  Sender Reputation:                                           ║
║  ✓ Google Postmaster: High                                    ║
║  ✓ No blacklist appearances                                   ║
║  ✓ Inbox placement: 92%                                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**📌 Pro Tip:** Print this diagram and keep it next to you while building the workflow in Customer.io!
