# Hybrid Pricing Model Strategy

## Executive Summary

The RAG Content Migration System will implement a hybrid pricing model combining subscription tiers with pay-as-you-go usage to maximize market reach, revenue potential, and customer satisfaction. This approach addresses diverse use cases from one-time migrations to ongoing optimization needs.

## Pricing Structure

### Base Model: Subscription + Usage

#### Free Tier
- **Base**: $0/month
- **Included**: 10 pages/month
- **Overage**: Not available (hard limit)
- **Purpose**: Lead generation, trial usage

#### Starter Tier
- **Base**: $29/month
- **Included**: 100 pages/month
- **Overage**: $0.30/page after 100
- **LLMs**: GPT-3.5, Claude Haiku
- **Target**: Small agencies, individual users

#### Professional Tier
- **Base**: $99/month
- **Included**: 1,000 pages/month
- **Overage**: $0.20/page after 1,000
- **LLMs**: All models including GPT-4
- **Features**: API access, priority queue
- **Target**: Growing agencies, active e-commerce

#### Enterprise Tier
- **Base**: Custom ($500+ typical)
- **Included**: Custom volume
- **Overage**: $0.10-0.15/page
- **Features**: White-label, dedicated support
- **Target**: Large agencies, enterprises

#### Pure Pay-As-You-Go
- **No subscription**: $0.50/page
- **Minimum**: $10 initial credit
- **Use case**: One-time migrations
- **Features**: Same as Starter tier

### Additional Usage-Based Charges

#### Priority Processing
- **Standard**: Included in tier
- **Rush (2x speed)**: +$0.10/page
- **Immediate (<1min)**: +$0.25/page

#### Advanced Features
- **Search Console Integration**: +$10/month
- **Automated Scheduling**: +$20/month
- **White-label Dashboard**: +$100/month

## Implementation Requirements

### 1. Metering Infrastructure

#### Core Metrics to Track
```python
# Essential usage metrics
- pages_scraped: Integer
- llm_tokens_used: Integer
- storage_gb_used: Float
- api_calls_made: Integer
- processing_time_minutes: Float
- priority_jobs_count: Integer
```

#### Database Schema Updates
```sql
-- Usage metering table
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  metric_type VARCHAR(50),
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,4),
  total_cost DECIMAL(10,2),
  timestamp TIMESTAMP,
  metadata JSONB
);

-- Billing periods table
CREATE TABLE billing_periods (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  start_date DATE,
  end_date DATE,
  subscription_fee DECIMAL(10,2),
  usage_charges DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  status VARCHAR(20)
);

-- Spending limits table
CREATE TABLE spending_limits (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  monthly_limit DECIMAL(10,2),
  alert_threshold_percent INTEGER DEFAULT 80,
  hard_cap_enabled BOOLEAN DEFAULT false
);
```

### 2. Billing System Changes

#### Replace Polar.sh with Stripe Billing
- **Reason**: Better usage-based billing support
- **Features Needed**:
  - Subscription management
  - Usage reporting API
  - Metered billing
  - Invoice generation
  - Payment method management

#### Alternative: Lago (Open Source)
- **Pros**: Usage-first design, self-hosted option
- **Cons**: Less mature, more setup required
- **Decision**: Start with Stripe, evaluate Lago for scale

### 3. Queue System Enhancements

#### Dynamic Priority Calculation
```python
def calculate_job_priority(user: User, job: Job) -> int:
    base_priority = TIER_PRIORITIES[user.subscription_tier]
    
    # Boost priority based on spending
    spending_boost = min(user.monthly_spending / 100, 5)
    
    # Rush job premium
    rush_boost = 10 if job.is_rush else 0
    
    # Penalize heavy users to prevent monopolization
    usage_penalty = 0
    if user.jobs_today > 100:
        usage_penalty = min(user.jobs_today / 100, 5)
    
    return base_priority + spending_boost + rush_boost - usage_penalty
```

#### Fair Scheduling Algorithm
- Prevent single user from monopolizing resources
- Ensure free tier users get some service
- Balance between tier priority and fairness

### 4. User Experience Requirements

#### Real-time Usage Dashboard
- Current month usage with visual progress bars
- Spending to date with projections
- Usage history and trends
- Downloadable usage reports

#### Spending Controls
- Set monthly spending limits
- Alerts at 50%, 80%, 100% of limit
- Auto-pause option at limit
- Pre-approval for large jobs (>1000 pages)

#### Transparent Pricing Calculator
- Interactive calculator on pricing page
- Clear examples for different use cases
- No hidden fees or surprise charges

## Revenue Impact Analysis

### Projected Revenue Increase
- **Current Model**: $45 ARPU (average revenue per user)
- **Hybrid Model**: $65-80 ARPU projected
- **Increase**: 44-78% revenue uplift

### Customer Acquisition Benefits
- **Lower Barrier**: PAYG option for hesitant users
- **Upsell Path**: PAYG → Starter → Pro
- **Reduced Churn**: Users can scale down vs cancel

### Risk Mitigation
- **Base Revenue**: 70% from subscriptions (stable)
- **Growth Revenue**: 30% from usage (scalable)
- **Protection**: Spending caps prevent bill shock

## Technical Architecture Updates

### API Changes
```python
# New endpoints needed
POST /api/v1/usage/report
GET /api/v1/usage/current-period
GET /api/v1/usage/history
POST /api/v1/billing/spending-limit
GET /api/v1/billing/invoice/{period}
POST /api/v1/jobs/estimate-cost
```

### Service Updates
```python
# usage_service.py
class UsageService:
    async def track_usage(
        self,
        user_id: UUID,
        metric_type: MetricType,
        quantity: float,
        metadata: dict = None
    ):
        """Track usage with real-time billing updates"""
        
    async def check_limits(
        self,
        user_id: UUID,
        estimated_usage: dict
    ) -> UsageCheckResult:
        """Pre-flight check for usage limits"""
        
    async def get_current_usage(
        self,
        user_id: UUID
    ) -> UsageSnapshot:
        """Real-time usage and spending data"""
```

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
1. Implement usage tracking infrastructure
2. Set up Stripe billing integration
3. Create usage dashboard UI
4. Add spending limit controls

### Phase 2: Pricing Launch (Week 3-4)
1. Migrate existing users (grandfather current pricing)
2. Enable PAYG option for new users
3. Launch usage-based priority queue
4. Monitor and adjust pricing

### Phase 3: Optimization (Month 2+)
1. Analyze usage patterns
2. Refine pricing based on data
3. Add advanced features (burst pricing, etc.)
4. Expand payment options

## Competitive Advantages

### vs Pure Subscription
- **Flexibility**: Customers pay for actual usage
- **Fairness**: Light users aren't overcharged
- **Scalability**: Heavy users can grow without switching

### vs Pure PAYG
- **Predictability**: Base subscription provides stability
- **Commitment**: Reduces churn vs no commitment
- **Value**: Included pages offer better unit pricing

## Success Metrics

### Financial KPIs
- ARPU increase: Target 50%+ within 6 months
- Revenue predictability: Maintain 70%+ from subscriptions
- Usage revenue: Grow to 30% of total

### Customer KPIs
- Conversion rate: PAYG to subscription >20%
- Churn reduction: <3% monthly (from 5%)
- NPS improvement: +10 points

### Operational KPIs
- Bill shock incidents: <1% of users
- Usage tracking accuracy: >99.9%
- Payment failures: <2%

## Risk Management

### Technical Risks
- **Metering Accuracy**: Implement redundant tracking
- **Billing Disputes**: Clear audit logs and reports
- **System Overload**: Queue management and caps

### Business Risks
- **Revenue Volatility**: 70/30 subscription/usage split
- **Competitor Response**: Unique value proposition
- **Customer Confusion**: Clear communication and UI

## Conclusion

The hybrid pricing model positions the RAG Content Migration System for sustainable growth by:
1. Addressing diverse customer needs
2. Maximizing revenue potential
3. Maintaining predictable base revenue
4. Enabling fair resource allocation

This model requires sophisticated metering and billing infrastructure but will significantly expand our addressable market and revenue potential while maintaining the flexibility customers need.