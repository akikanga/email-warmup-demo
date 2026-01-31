# CUSTOMER.IO WARMUP CAMPAIGN - WORKFLOW SETUP GUIDE

## 📋 PREREQUISITES CHECKLIST

Before you begin in Customer.io:

- [ ] Run `warmup-campaign-setup.js` script (assigns users to batches)
- [ ] Verify SPF/DKIM/DMARC records are configured
- [ ] Email template ready with unsubscribe link
- [ ] Subject line tested (avoid spam triggers)
- [ ] Monitoring dashboard prepared

---

## 🏗️ PART 1: CREATE THE CAMPAIGN

### Step 1: Navigate to Campaigns

1. Log into Customer.io
2. Click **"Campaigns"** in left sidebar
3. Click **"Create Campaign"** (blue button, top right)
4. Select **"Broadcast"** (we'll trigger it manually for the demo)

---

### Step 2: Name Your Campaign

**Campaign Name:** `Email Warmup - 4 Day Ramp (Demo)`

**Description:** 
```
Gradual warmup campaign sending to 10k users over 4 days.
Distribution: Day 1 (33%), Day 2 (29%), Day 3 (25%), Day 4 (13%)
Most engaged users receive emails first.
```

Click **"Create Campaign"**

---

## 🎯 PART 2: BUILD THE WORKFLOW

### Step 3: Set Entry Trigger

1. You'll see an empty workflow canvas
2. Click the **"+"** button to add first step
3. Select **"Segment"** as trigger type

**Configure Segment:**
- Name: `Warmup Campaign Recipients`
- Filter 1: `warmup_day` **exists**
- Filter 2: `engagement_tier` **exists**

This ensures only users processed by our script enter the workflow.

Click **"Save"**

---

### Step 4: Add First Branch (Engagement Tier Filter)

**WHY:** We want to double-check we're not sending to completely cold users

1. Click **"+"** below the trigger
2. Select **"Attribute Branch"**
3. Configure:
   - **Attribute:** `customer.engagement_tier`
   - **Branch type:** "Create a path for each unique value"

**Paths to create:**
- Path 1: `engagement_tier` equals `hot`
- Path 2: `engagement_tier` equals `warm`
- Path 3: `engagement_tier` equals `cool`
- Path 4: `engagement_tier` equals `cold`
- Path 5: **"Otherwise"** (catch-all for any errors)

Click **"Save"**

---

### Step 5: Handle Cold Users (OPTIONAL SAFETY)

On the **"cold"** path:

1. Click **"+"** on that branch
2. Select **"Exit workflow"**
3. Reason: "Cold users excluded for reputation safety"

OR (if you want to send to them):
- Keep them in workflow but send on Day 4 only

For this demo, let's **keep them** and send on Day 4.

---

### Step 6: Merge Engagement Paths

Since we want all engagement tiers to go through the same warmup schedule:

1. At the end of **hot**, **warm**, and **cool** paths, they all need to converge
2. Customer.io will automatically merge them before the next step

Click **"+"** below where the paths merge

---

### Step 7: Add Warmup Day Branch (THE KEY STEP)

1. Select **"Attribute Branch"** again
2. Configure:
   - **Attribute:** `customer.warmup_day`
   - **Branch type:** "Create a path for each value"

**Create 4 paths:**
- Path 1: `warmup_day` equals `1`
- Path 2: `warmup_day` equals `2`
- Path 3: `warmup_day` equals `3`
- Path 4: `warmup_day` equals `4`

Click **"Save"**

---

### Step 8: Configure Day 1 Path (Immediate Send)

On the **warmup_day = 1** branch:

1. Click **"+"**
2. Select **"Send Email"**
3. Configure email:
   - **Template:** Select your warmup email template
   - **Subject:** Your tested subject line
   - **From name:** Your established sender name
   - **From email:** Your verified sending address

4. Click **"Save"**

---

### Step 9: Configure Day 2 Path (24-Hour Delay)

On the **warmup_day = 2** branch:

1. Click **"+"**
2. Select **"Time Delay"**
3. Configure:
   - **Delay type:** "Wait for a specific amount of time"
   - **Duration:** `1 day`
   - **Time zone:** Select your time zone

4. Click **"Add another step"**
5. Select **"Send Email"**
6. Use SAME email configuration as Day 1

---

### Step 10: Configure Day 3 Path (48-Hour Delay)

On the **warmup_day = 3** branch:

1. Click **"+"**
2. Select **"Time Delay"**
3. Configure:
   - **Duration:** `2 days`

4. Click **"Add another step"**
5. Select **"Send Email"**
6. Use SAME email configuration

---

### Step 11: Configure Day 4 Path (72-Hour Delay)

On the **warmup_day = 4** branch:

1. Click **"+"**
2. Select **"Time Delay"**
3. Configure:
   - **Duration:** `3 days`

4. Click **"Add another step"**
5. Select **"Send Email"**
6. Use SAME email configuration

---

### Step 12: Add Tracking Tags (IMPORTANT!)

For EACH send email step across all 4 paths:

1. Click on the email action
2. Scroll to **"Advanced Options"**
3. Add tag:
   - For Day 1 send: `warmup_batch_1`
   - For Day 2 send: `warmup_batch_2`
   - For Day 3 send: `warmup_batch_3`
   - For Day 4 send: `warmup_batch_4`

**WHY:** This lets you track performance by batch in Customer.io analytics

---

## 🎨 VISUAL WORKFLOW SHOULD LOOK LIKE THIS:

```
┌─────────────────────────────┐
│   TRIGGER: Segment          │
│   (warmup_day exists)       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   BRANCH: engagement_tier   │
└──┬────┬────┬────┬────┬──────┘
   │hot │warm│cool│cold│other
   └─┬──┴──┬─┴──┬─┴──┬─┴────┘
     │     │    │    │(exit)
     └──┬──┴──┬─┴──┬─┘
        │     │    │
        ▼     ▼    ▼
┌─────────────────────────────┐
│   BRANCH: warmup_day        │
└──┬────┬────┬────┬───────────┘
   │1   │2   │3   │4
   │    │    │    │
   ▼    ▼    ▼    ▼
  SEND WAIT WAIT WAIT
       24h  48h  72h
        │    │    │
        ▼    ▼    ▼
       SEND SEND SEND
```

---

## 🚀 PART 3: LAUNCH THE CAMPAIGN

### Step 13: Review Workflow

1. Click **"Review"** button (top right)
2. Verify all paths are configured correctly
3. Check email templates are attached
4. Confirm time delays are set properly

---

### Step 14: Set Campaign Schedule

1. Click **"Schedule"** tab
2. Select **"Send immediately when people match the trigger"**
3. OR select specific start date/time if you want to control launch

---

### Step 15: Test Before Launch (CRITICAL!)

1. Click **"Test"** tab
2. Add test user IDs (create test users with warmup_day attributes)
3. Run test sends to verify:
   - Email renders correctly
   - Links work
   - Unsubscribe functions
   - Tracking pixels fire

---

### Step 16: Start Campaign

1. Click **"Start Campaign"** (big blue button)
2. Customer.io will prompt: "Are you sure?"
3. **FINAL CHECK:**
   - [ ] Email content reviewed
   - [ ] SPF/DKIM configured
   - [ ] Unsubscribe link tested
   - [ ] Monitoring ready

4. Click **"Start"**

---

## 📊 PART 4: MONITORING & OPTIMIZATION

### Real-Time Monitoring Dashboard

**Navigate to:** Campaigns → Your Warmup Campaign → Analytics

**Key Metrics to Watch:**

**Day 1 (First 24 hours):**
```
✅ Target Metrics:
- Delivered: >98%
- Opened: >40%
- Clicked: >5%
- Bounced: <2%
- Unsubscribed: <0.5%
- Spam complaints: <0.1%

🚨 RED FLAGS:
- Bounce rate >3% = PAUSE CAMPAIGN
- Spam complaints >0.2% = PAUSE CAMPAIGN
- Open rate <25% = Investigate subject line/sender name
```

**Day 2-4:**
- Compare metrics to Day 1
- Look for consistency or improvement
- Watch for deliverability degradation

---

### Customer.io Analytics Views

1. **Overview Dashboard:**
   - Total sends per day
   - Overall open/click rates
   - Conversion tracking

2. **Segment Performance:**
   - Filter by `warmup_batch_1`, `warmup_batch_2`, etc.
   - Compare engagement across batches

3. **Hourly Sending:**
   - Monitor send rate (shouldn't spike dramatically)
   - Ensure gradual ramp as designed

---

## 🛠️ TROUBLESHOOTING

### Issue: Users not entering workflow

**Check:**
1. Segment filter is correct (`warmup_day` exists)
2. Script ran successfully and assigned attributes
3. Customer.io API credentials valid
4. Test user has attributes set

**Fix:**
```javascript
// Manually verify user in Customer.io
await cio.identify('test_user_id', {
  warmup_day: 1,
  engagement_tier: 'hot'
});
```

---

### Issue: Emails sending at wrong times

**Check:**
1. Time delay steps configured correctly
2. Time zone settings match your preference
3. Campaign start time

**Fix:**
- Click "Pause" on campaign
- Edit time delay steps
- Resume campaign

---

### Issue: High bounce rate on Day 1

**IMMEDIATE ACTION:**
1. Click "Pause Campaign" in Customer.io
2. Export bounced email addresses
3. Investigate bounce reasons (hard vs soft)
4. Remove hard bounces from list
5. Verify email authentication (SPF/DKIM)

**Prevention for next batch:**
- Pre-validate email addresses
- Use email verification service
- Remove old/inactive addresses

---

## 📈 SUCCESS CRITERIA

### Campaign is SUCCESSFUL if:

✅ **Day 1-4 Performance:**
- Open rates remain >35% across all batches
- Bounce rates <2% consistently
- Spam complaints <0.1%
- No deliverability warnings from ISPs

✅ **Sender Reputation:**
- Google Postmaster Tools shows "High" reputation
- No blacklist appearances
- Inbox placement >90%

✅ **Engagement Trends:**
- Hot tier users open at >50%
- Warm tier users open at >35%
- Cool tier users open at >25%

---

## 🎯 NEXT STEPS AFTER SUCCESSFUL WARMUP

Once all 4 batches complete:

1. **Analyze Results:**
   - Export campaign analytics
   - Segment by engagement_tier
   - Identify top-performing content

2. **Scale Up:**
   - Increase sending volume by 20-30% daily
   - Monitor reputation metrics
   - Maintain engagement focus

3. **Ongoing Maintenance:**
   - Regular list hygiene (remove bounces/unsubscribes)
   - Continue engagement-based segmentation
   - A/B test content to maintain high open rates

---

## 📞 SUPPORT RESOURCES

**Customer.io Help:**
- Documentation: https://customer.io/docs
- Support: support@customer.io
- Community: https://community.customer.io

**Deliverability Tools:**
- Google Postmaster: https://postmaster.google.com
- Microsoft SNDS: https://sendersupport.olc.protection.outlook.com/snds/
- MXToolbox: https://mxtoolbox.com/blacklists.aspx

---

## ✅ DEMO COMPLETION CHECKLIST

After following this guide:

- [ ] Campaign created in Customer.io
- [ ] All workflow branches configured
- [ ] Email templates attached
- [ ] Time delays set correctly
- [ ] Tracking tags added
- [ ] Test sends completed
- [ ] Campaign launched
- [ ] Monitoring dashboard active
- [ ] Performance metrics tracked

---

**🎉 You're ready to run a professional email warmup campaign!**

Questions? Issues? Let me know and I'll help troubleshoot.
