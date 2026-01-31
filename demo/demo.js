// Email Warmup Demo Simulation
class WarmupDemo {
    constructor() {
        this.totalUsers = 10000;
        this.batches = {
            day1: { count: 0, percent: 33 },
            day2: { count: 0, percent: 29 },
            day3: { count: 0, percent: 25 },
            day4: { count: 0, percent: 13 }
        };
        this.tiers = {
            hot: { count: 0, percent: 0 },
            warm: { count: 0, percent: 0 },
            cool: { count: 0, percent: 0 },
            cold: { count: 0, percent: 0 }
        };
        this.campaignRunning = false;
        this.currentDay = 0;
        this.init();
    }

    init() {
        // Bind event listeners
        document.getElementById('assignBatches').addEventListener('click', () => this.assignBatches());
        document.getElementById('startCampaign').addEventListener('click', () => this.startCampaign());
        document.getElementById('resetDemo').addEventListener('click', () => this.resetDemo());
        
        // Update total users on input change
        document.getElementById('totalUsers').addEventListener('input', (e) => {
            this.totalUsers = parseInt(e.target.value);
        });
    }

    assignBatches() {
        const btn = document.getElementById('assignBatches');
        const alert = document.getElementById('assignmentAlert');
        
        // Disable button and show loading
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Assigning...';
        
        setTimeout(() => {
            // Calculate batch sizes
            this.batches.day1.count = Math.floor(this.totalUsers * 0.33);
            this.batches.day2.count = Math.floor(this.totalUsers * 0.29);
            this.batches.day3.count = Math.floor(this.totalUsers * 0.25);
            this.batches.day4.count = this.totalUsers - this.batches.day1.count - this.batches.day2.count - this.batches.day3.count;
            
            // Simulate engagement tier distribution
            this.tiers.hot.count = this.batches.day1.count;
            this.tiers.warm.count = this.batches.day2.count;
            this.tiers.cool.count = this.batches.day3.count;
            this.tiers.cold.count = this.batches.day4.count;
            
            this.tiers.hot.percent = ((this.tiers.hot.count / this.totalUsers) * 100).toFixed(1);
            this.tiers.warm.percent = ((this.tiers.warm.count / this.totalUsers) * 100).toFixed(1);
            this.tiers.cool.percent = ((this.tiers.cool.count / this.totalUsers) * 100).toFixed(1);
            this.tiers.cold.percent = ((this.tiers.cold.count / this.totalUsers) * 100).toFixed(1);
            
            // Update UI
            this.updateTierDisplay();
            
            // Show success alert
            alert.className = 'alert alert-success show';
            alert.textContent = `✅ Successfully assigned ${this.totalUsers.toLocaleString()} users to warmup batches!`;
            
            // Enable start campaign button
            document.getElementById('startCampaign').disabled = false;
            
            // Reset button
            btn.disabled = false;
            btn.textContent = 'Assign Users to Batches';
        }, 1500);
    }

    updateTierDisplay() {
        document.getElementById('tierDistribution').style.display = 'grid';
        
        document.getElementById('hotCount').textContent = this.tiers.hot.count.toLocaleString();
        document.getElementById('hotPercent').textContent = this.tiers.hot.percent + '%';
        
        document.getElementById('warmCount').textContent = this.tiers.warm.count.toLocaleString();
        document.getElementById('warmPercent').textContent = this.tiers.warm.percent + '%';
        
        document.getElementById('coolCount').textContent = this.tiers.cool.count.toLocaleString();
        document.getElementById('coolPercent').textContent = this.tiers.cool.percent + '%';
        
        document.getElementById('coldCount').textContent = this.tiers.cold.count.toLocaleString();
        document.getElementById('coldPercent').textContent = this.tiers.cold.percent + '%';
    }

    startCampaign() {
        if (this.campaignRunning) return;
        
        this.campaignRunning = true;
        this.currentDay = 0;
        
        const btn = document.getElementById('startCampaign');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Campaign Running...';
        
        // Start Day 1 immediately
        setTimeout(() => this.runDay(1), 1000);
        
        // Day 2 after delay
        setTimeout(() => this.runDay(2), 5000);
        
        // Day 3 after delay
        setTimeout(() => this.runDay(3), 9000);
        
        // Day 4 after delay
        setTimeout(() => this.runDay(4), 13000);
        
        // Complete campaign
        setTimeout(() => this.completeCampaign(), 17000);
    }

    runDay(day) {
        this.currentDay = day;
        
        // Mark timeline item as active
        document.getElementById(`day${day}`).classList.add('active');
        
        const batchCount = this.batches[`day${day}`].count;
        
        // Simulate realistic open rates based on engagement tier
        let openRate, bounceRate;
        switch(day) {
            case 1: // Hot tier
                openRate = 65 + Math.random() * 10; // 65-75%
                bounceRate = 0.5 + Math.random() * 0.8; // 0.5-1.3%
                break;
            case 2: // Warm tier
                openRate = 52 + Math.random() * 10; // 52-62%
                bounceRate = 0.8 + Math.random() * 0.7; // 0.8-1.5%
                break;
            case 3: // Cool tier
                openRate = 38 + Math.random() * 10; // 38-48%
                bounceRate = 1.0 + Math.random() * 0.8; // 1.0-1.8%
                break;
            case 4: // Cold tier
                openRate = 25 + Math.random() * 10; // 25-35%
                bounceRate = 1.2 + Math.random() * 0.8; // 1.2-2.0%
                break;
        }
        
        // Animate progress bar
        this.animateProgress(day, 0, 100, 3000);
        
        // Update stats
        setTimeout(() => {
            document.getElementById(`sent${day}`).textContent = batchCount.toLocaleString();
            document.getElementById(`opens${day}`).textContent = openRate.toFixed(1) + '%';
            document.getElementById(`bounces${day}`).textContent = bounceRate.toFixed(2) + '%';
            
            // Mark as completed
            document.getElementById(`day${day}`).classList.remove('active');
            document.getElementById(`day${day}`).classList.add('completed');
            
            // Update overall metrics
            this.updateOverallMetrics();
        }, 3000);
    }

    animateProgress(day, start, end, duration) {
        const progressBar = document.getElementById(`progress${day}`);
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            
            progressBar.style.width = progress + '%';
            
            if (progress < 100) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    updateOverallMetrics() {
        // Calculate totals
        let totalSent = 0;
        let totalOpens = 0;
        let totalBounces = 0;
        
        for (let i = 1; i <= this.currentDay; i++) {
            const sent = parseInt(document.getElementById(`sent${i}`).textContent.replace(/,/g, ''));
            const opens = parseFloat(document.getElementById(`opens${i}`).textContent);
            const bounces = parseFloat(document.getElementById(`bounces${i}`).textContent);
            
            totalSent += sent;
            totalOpens += (sent * opens / 100);
            totalBounces += (sent * bounces / 100);
        }
        
        const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
        const bounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;
        const spamRate = 0.02 + Math.random() * 0.06; // 0.02-0.08%
        const inboxPlacement = 95 + Math.random() * 3; // 95-98%
        
        // Update UI
        document.getElementById('totalSent').textContent = totalSent.toLocaleString();
        document.getElementById('avgOpenRate').textContent = avgOpenRate.toFixed(1) + '%';
        document.getElementById('bounceRate').textContent = bounceRate.toFixed(2) + '%';
        document.getElementById('spamRate').textContent = spamRate.toFixed(3) + '%';
        document.getElementById('inboxPlacement').textContent = inboxPlacement.toFixed(1) + '%';
        
        // Update reputation
        let reputation;
        if (this.currentDay === 1) reputation = 'Good';
        else if (this.currentDay === 2) reputation = 'High';
        else if (this.currentDay === 3) reputation = 'Excellent';
        else reputation = 'Excellent';
        
        document.getElementById('reputation').textContent = reputation;
        
        // Color-code metrics
        const bounceMetric = document.getElementById('bounceRate').closest('.metric');
        const spamMetric = document.getElementById('spamRate').closest('.metric');
        
        if (bounceRate > 2) {
            bounceMetric.classList.remove('success');
            bounceMetric.classList.add('danger');
        } else {
            bounceMetric.classList.remove('danger');
            bounceMetric.classList.add('success');
        }
        
        if (spamRate > 0.2) {
            spamMetric.classList.remove('success');
            spamMetric.classList.add('danger');
        } else {
            spamMetric.classList.remove('danger');
            spamMetric.classList.add('success');
        }
        
        // Check for alerts
        this.checkAlerts(bounceRate, spamRate, avgOpenRate);
    }

    checkAlerts(bounceRate, spamRate, avgOpenRate) {
        const alert = document.getElementById('campaignAlert');
        
        if (bounceRate > 2) {
            alert.className = 'alert alert-danger show';
            alert.innerHTML = '🚨 <strong>Critical:</strong> Bounce rate exceeds 2%. Campaign should be paused for investigation.';
        } else if (spamRate > 0.2) {
            alert.className = 'alert alert-danger show';
            alert.innerHTML = '⚠️ <strong>Warning:</strong> Spam complaint rate is elevated. Monitor sender reputation closely.';
        } else if (avgOpenRate < 25) {
            alert.className = 'alert alert-warning show';
            alert.innerHTML = '⚠️ <strong>Warning:</strong> Open rate below target. Consider reviewing subject lines and sender name.';
        } else {
            alert.className = 'alert alert-success show';
            alert.innerHTML = '✅ <strong>Healthy:</strong> All metrics within target ranges. Sender reputation is building successfully!';
        }
    }

    completeCampaign() {
        this.campaignRunning = false;
        
        const btn = document.getElementById('startCampaign');
        btn.disabled = true;
        btn.textContent = 'Campaign Complete';
        
        // Final alert
        const alert = document.getElementById('campaignAlert');
        alert.className = 'alert alert-success show';
        alert.innerHTML = `
            🎉 <strong>Campaign Complete!</strong> Successfully warmed up sender reputation over 4 days.<br>
            <strong>Next Steps:</strong> You can now safely scale to 100K+ daily sends while maintaining high deliverability.
        `;
    }

    resetDemo() {
        // Reset all state
        this.campaignRunning = false;
        this.currentDay = 0;
        
        // Reset timeline
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`day${i}`).classList.remove('active', 'completed');
            document.getElementById(`progress${i}`).style.width = '0%';
            document.getElementById(`sent${i}`).textContent = '0';
            document.getElementById(`opens${i}`).textContent = '0%';
            document.getElementById(`bounces${i}`).textContent = '0%';
        }
        
        // Reset overall metrics
        document.getElementById('totalSent').textContent = '0';
        document.getElementById('avgOpenRate').textContent = '0%';
        document.getElementById('bounceRate').textContent = '0%';
        document.getElementById('spamRate').textContent = '0%';
        document.getElementById('reputation').textContent = 'Building...';
        document.getElementById('inboxPlacement').textContent = '0%';
        
        // Reset alerts
        document.getElementById('assignmentAlert').className = 'alert';
        document.getElementById('campaignAlert').className = 'alert';
        
        // Reset buttons
        document.getElementById('assignBatches').disabled = false;
        document.getElementById('assignBatches').textContent = 'Assign Users to Batches';
        document.getElementById('startCampaign').disabled = true;
        document.getElementById('startCampaign').textContent = 'Start Campaign';
        
        // Hide tier distribution
        document.getElementById('tierDistribution').style.display = 'none';
    }
}

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WarmupDemo();
});
