# Detailed Web Scraping Architecture Plan for RAG Content Migration System

## Table of Contents
1. [Overview](#overview)
2. [Core Scraping Architecture](#core-scraping-architecture)
3. [Concurrent User Handling](#concurrent-user-handling)
4. [Database Architecture & Modularity](#database-architecture--modularity)
5. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
6. [Edge Cases & Handling](#edge-cases--handling)
7. [Queue Management System](#queue-management-system)
8. [Scalability Considerations](#scalability-considerations)
9. [Monitoring & Observability](#monitoring--observability)
10. [Failure Recovery Strategies](#failure-recovery-strategies)

## Overview

This document provides a comprehensive plan for building a robust, scalable web scraping system that can handle multiple concurrent users while maintaining modularity and reliability. The system is designed to be the foundation of a SaaS product serving agencies and e-commerce businesses.

### Key Requirements
- Handle 100+ concurrent scraping jobs
- Support 1000+ users with varying subscription tiers
- Process 1M+ pages per month across all users
- Maintain 99.9% uptime for scraping services
- Modular architecture allowing component swapping
- Cost-effective operation at scale

## Core Scraping Architecture

### 1. Modular Component Design

```
┌─────────────────────────────────────────────────────────────────┐
│                          API Gateway                             │
│                   (Rate Limiting & Auth)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   Job Orchestrator    │
                    │  (Queue Management)    │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────┴────────┐    ┌────────┴────────┐    ┌────────┴────────┐
│ Scraper Worker │    │ Scraper Worker  │    │ Scraper Worker  │
│   Instance 1   │    │   Instance 2    │    │   Instance N    │
└────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   Storage Layer       │
                    │  (Supabase/S3)       │
                    └───────────────────────┘
```

### 2. Component Responsibilities

#### API Gateway
- **Purpose**: Single entry point for all scraping requests
- **Technologies**: FastAPI with middleware
- **Responsibilities**:
  - Authentication via Clerk JWT validation
  - Rate limiting per user/tier
  - Request validation
  - Load balancing to workers

#### Job Orchestrator
- **Purpose**: Manage scraping job lifecycle
- **Technologies**: Redis + Celery/BullMQ
- **Responsibilities**:
  - Job queuing with priority levels
  - Worker assignment
  - Progress tracking
  - Retry management
  - Dead letter queue handling

#### Scraper Workers
- **Purpose**: Actual scraping execution
- **Technologies**: Crawl4AI + Playwright
- **Responsibilities**:
  - Page fetching
  - JavaScript rendering
  - Content extraction
  - Error handling
  - Result storage

#### Storage Layer
- **Purpose**: Persistent data storage
- **Technologies**: Supabase (PostgreSQL) + S3-compatible storage
- **Responsibilities**:
  - Structured data (metadata, user info)
  - Raw HTML/content storage
  - Vector embeddings
  - Temporary cache

## Concurrent User Handling

### 1. Multi-Tenancy Strategy

```
User Request Flow:
1. User A requests scraping of site X
2. User B requests scraping of site Y
3. User C requests scraping of site X (same as User A)

System Handling:
- Separate job queues per priority tier
- Resource pooling with tenant isolation
- Shared cache for common resources
- Independent progress tracking
```

### 2. Resource Allocation

#### Per-Tier Limits
```
Free Tier:
- Max concurrent jobs: 1
- Queue priority: Low
- Worker allocation: Shared pool
- Rate limit: 10 pages/hour

Starter Tier ($29):
- Max concurrent jobs: 3
- Queue priority: Medium
- Worker allocation: Shared pool
- Rate limit: 100 pages/hour

Pro Tier ($99):
- Max concurrent jobs: 10
- Queue priority: High
- Worker allocation: Dedicated workers available
- Rate limit: 500 pages/hour

Enterprise:
- Max concurrent jobs: Unlimited
- Queue priority: Highest
- Worker allocation: Dedicated worker pool
- Rate limit: Custom
```

### 3. Detailed Resource Impact Analysis

#### Resource Bottlenecks
**The Problem:**
- Each scraping job uses ~500MB-1GB RAM (browser instance)
- CPU spikes during page rendering
- Network bandwidth consumption
- Database write conflicts

**Example Scenario:**
```
10 users start scraping simultaneously:
- 10 browser instances = 5-10GB RAM
- 10 concurrent network requests
- 10 parallel database writes
- Potential for 100+ pages/minute
```

#### Queue-Based Solution
```
User A requests 50 pages → Queue
User B requests 100 pages → Queue  
User C requests 20 pages → Queue

Worker Pool (3 workers):
- Worker 1: Processing User A's job 1
- Worker 2: Processing User B's job 1  
- Worker 3: Processing User C's job 1
```

**Benefits:**
- Predictable resource usage
- Fair distribution
- No resource spikes

### 4. Resource Management Strategies

#### Worker Recycling
```python
# Each worker handles 100 pages then restarts
# Prevents memory leaks
# Clears browser cache
# Fresh start = consistent performance
```

#### Domain-Based Throttling
```python
# Prevent overwhelming single sites
rate_limits = {
    "default": 1 request per 2 seconds,
    "shopify.com": 1 request per 1 second,
    "wordpress.com": 2 requests per second
}

# If User A and User B both scrape example.com:
# Their requests interleave with delays
```

#### Database Write Batching
```python
# Instead of:
# Page 1 scraped → Write to DB
# Page 2 scraped → Write to DB

# Do:
# Pages 1-10 scraped → Batch write to DB
# Reduces database load by 90%
```

### 5. Real-World Concurrent Usage Scenarios

#### Scenario 1: Launch Day (10 users)
```
Resources needed:
- 1 server ($40/month)
- 3 concurrent workers
- 8GB RAM, 4 CPUs

Performance:
- Each user waits 2-5 minutes
- System remains responsive
- No crashes
```

#### Scenario 2: Growth Phase (100 users)
```
Resources needed:
- 3 servers ($120/month)
- 10 concurrent workers
- 24GB RAM, 12 CPUs
- Redis queue ($20/month)

Performance:
- Average wait: 5-10 minutes
- Higher tiers get priority
- System auto-scales
```

#### Scenario 3: Black Friday Peak (500 users)
```
Resources needed:
- 10 servers ($400/month)
- 30 concurrent workers
- Kubernetes orchestration
- Multiple Redis instances

Performance:
- Graceful degradation
- Free tier temporarily disabled
- Paid users unaffected
```

### 6. Cost Per Concurrent User
```
MVP Phase:
- 10 concurrent users: $40/month = $4/user
- Profitable at $29/month tier

Growth Phase:
- 100 concurrent users: $140/month = $1.40/user
- Very profitable

Scale Phase:
- 1000 concurrent users: $500/month = $0.50/user
- Excellent margins
```

### 7. Overload Handling

**What happens when overloaded:**
```
1. New jobs queued, not rejected
2. Free tier gets "Queue position: 1,847"
3. Paid tiers see minimal impact
4. Auto-scaling kicks in
5. Email notification if wait > 1 hour
```

**Circuit Breakers:**
```python
if queue_depth > 10,000:
    disable_free_tier_scraping()
    
if memory_usage > 90%:
    pause_new_job_acceptance()
    
if error_rate > 20%:
    alert_admin()
    reduce_worker_count()
```

### 8. Why This Architecture Works

**Predictable Scaling:**
- Add workers = linear performance increase
- Add servers = linear capacity increase
- No exponential resource problems

**Fair Resource Distribution:**
- Everyone gets service
- Paying users get priority
- No one user can hog resources

**Cost Effective:**
- Only pay for what you use
- Auto-scale down during quiet times
- Efficient resource utilization

**User Experience:**
- Real-time progress updates
- Accurate time estimates
- Clear communication about delays

**Key Insight:** You don't need to handle 100 simultaneous scrapes, you need to handle 100 queued scrapes efficiently. The queue system transforms an impossible resource problem into a manageable scheduling problem.

### 9. Isolation Strategies

#### Database Level
- Row Level Security (RLS) in Supabase
- Separate schemas per large enterprise client
- Connection pooling with user context

#### Worker Level
- Docker containers per worker
- Memory limits per job
- CPU throttling based on tier
- Network isolation

#### Storage Level
- User-specific buckets/folders
- Encryption at rest with user-specific keys
- Access logs per tenant

## Database Architecture & Modularity

### 1. Core Database Schema

#### Modular Table Design
```sql
-- Jobs table (can be moved to different queue system)
jobs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  job_type VARCHAR(50), -- 'scrape', 'optimize', 'export'
  status VARCHAR(50),
  priority INTEGER,
  metadata JSONB,
  created_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_details JSONB
)

-- Scraping results (can be moved to different storage)
scraping_results (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  url TEXT,
  status_code INTEGER,
  content_hash VARCHAR(64),
  metadata JSONB,
  created_at TIMESTAMP
)

-- Content storage (can be moved to S3/blob storage)
content_store (
  id UUID PRIMARY KEY,
  result_id UUID REFERENCES scraping_results(id),
  storage_type VARCHAR(20), -- 'database', 's3', 'azure'
  storage_path TEXT,
  content_type VARCHAR(50),
  size_bytes BIGINT,
  compression VARCHAR(20)
)
```

### 2. Abstraction Layers

#### Storage Interface
```
Interface: IContentStorage
- save_content(content, metadata) -> storage_id
- get_content(storage_id) -> content
- delete_content(storage_id) -> bool
- list_content(filters) -> list

Implementations:
- SupabaseStorage (MVP)
- S3Storage (Scale)
- AzureStorage (Enterprise)
- LocalStorage (Development)
```

#### Queue Interface
```
Interface: IJobQueue
- enqueue(job) -> job_id
- dequeue(worker_id) -> job
- update_status(job_id, status) -> bool
- get_progress(job_id) -> progress

Implementations:
- RedisQueue (MVP)
- RabbitMQQueue (Scale)
- AWSQueue (Enterprise)
- InMemoryQueue (Development)
```

### 3. Migration Strategy

#### Phase 1: MVP (0-1000 users)
- Supabase for everything
- Simple Redis queue
- Local file cache

#### Phase 2: Growth (1000-10k users)
- Move large content to S3
- Dedicated Redis cluster
- CDN for static content

#### Phase 3: Scale (10k+ users)
- Separate read/write databases
- Multiple queue systems by region
- Global edge storage

## Common Pitfalls & Solutions

### 1. Rate Limiting & Blocking

#### Pitfall: IP-based blocking
**Solutions:**
- Rotating proxy pools (residential for Pro+)
- User-agent randomization
- Request interval randomization (2-5 seconds)
- Cloudflare bypass techniques

**Implementation:**
```
Proxy Pool Management:
- Free tier: Datacenter proxies (cheap, often blocked)
- Paid tiers: Residential proxies (expensive, rarely blocked)
- Enterprise: Dedicated proxy infrastructure

User-Agent Rotation:
- Pool of 50+ real browser user agents
- Match user agent with appropriate headers
- Update pool monthly
```

#### Pitfall: JavaScript challenges
**Solutions:**
- Headless browser with stealth plugins
- Cookie persistence
- Human-like interaction patterns
- CAPTCHA handling service (2captcha for Pro+)

### 2. Memory & Resource Management

#### Pitfall: Memory leaks in long-running scrapers
**Solutions:**
- Worker recycling every 100 jobs
- Memory monitoring with auto-restart
- Streaming large content instead of loading
- Garbage collection optimization

**Implementation:**
```
Worker Lifecycle:
1. Start worker with 2GB memory limit
2. Monitor memory usage every 30 seconds
3. Soft restart at 80% memory usage
4. Hard kill at 95% memory usage
5. Log memory patterns for debugging
```

#### Pitfall: Disk space exhaustion
**Solutions:**
- Streaming uploads to S3
- Automatic cleanup of temp files
- Compression before storage
- Storage quotas per user

### 3. Data Quality Issues

#### Pitfall: Incomplete page loads
**Solutions:**
- Multiple wait strategies
- Content validation
- Screenshot on failure
- Retry with different methods

**Wait Strategies:**
```
1. Wait for network idle (2 seconds no requests)
2. Wait for specific selectors
3. Wait for document ready + timeout
4. Custom JavaScript execution
5. Combination of above with fallbacks
```

#### Pitfall: Dynamic content changes
**Solutions:**
- Content fingerprinting
- Change detection algorithms
- Version control for scraped content
- Notification system for major changes

## Edge Cases & Handling

### 1. Site-Specific Edge Cases

#### Infinite scroll pages
**Handling:**
- Detect scroll patterns
- Set maximum scroll depth
- Use API endpoints when available
- Paginate results

#### Single Page Applications (SPAs)
**Handling:**
- Wait for route changes
- Intercept API calls
- Use framework-specific selectors
- State management detection

#### Authentication-required content
**Handling:**
- Cookie storage per user
- OAuth flow automation (with user consent)
- Session management
- Credential encryption

#### Geographic restrictions
**Handling:**
- Proxy selection by country
- VPN integration for Enterprise
- Clear error messaging
- Alternative data sources

### 2. Scale-Related Edge Cases

#### Thundering herd (many users scraping same site)
**Handling:**
- Request deduplication
- Shared cache with TTL
- Rate limiting per domain
- Queue coalescence

**Implementation:**
```
Deduplication Logic:
1. Check if URL recently scraped (<1 hour)
2. If yes, return cached result to new requesters
3. If no, add to queue with dedup key
4. Multiple requests for same URL join existing job
5. All requesters notified when complete
```

#### Database connection exhaustion
**Handling:**
- Connection pooling with limits
- Read replicas for queries
- Query optimization
- Circuit breakers

#### Storage quota exceeded
**Handling:**
- Pre-flight storage checks
- User notification system
- Automatic cleanup policies
- Upgrade prompts

### 3. Business Logic Edge Cases

#### Subscription downgrade mid-job
**Handling:**
- Grandfather current jobs
- Queue priority adjustment
- Grace period (24 hours)
- Clear communication

#### Payment failure during usage
**Handling:**
- 3-day grace period
- Reduced limits
- Data export enabled
- Automatic retry

## Queue Management System

### 1. Queue Architecture

```
┌─────────────────────┐
│   Priority Queue    │
├─────────────────────┤
│ Enterprise (P0)     │
│ Pro (P1)           │
│ Starter (P2)       │
│ Free (P3)          │
└─────────────────────┘
         │
         ↓
┌─────────────────────┐
│  Fair Scheduler     │
│ - Round robin per   │
│   priority level    │
│ - Starvation       │
│   prevention       │
└─────────────────────┘
         │
         ↓
┌─────────────────────┐
│  Worker Pool        │
│ - Auto-scaling     │
│ - Health checks    │
│ - Load balancing   │
└─────────────────────┘
```

### 2. Job Lifecycle

```
States:
PENDING → QUEUED → RUNNING → COMPLETED
                ↓         ↓
              FAILED   CANCELLED
                ↓
            RETRY_QUEUED
```

### 3. Retry Strategy

```
Retry Configuration:
- Network errors: 3 retries, exponential backoff
- Rate limits: 5 retries, linear backoff
- Parsing errors: 1 retry with different strategy
- Hard failures: No retry, manual investigation

Backoff Formula:
- Attempt 1: Immediate
- Attempt 2: 5 seconds
- Attempt 3: 30 seconds
- Attempt 4: 2 minutes
- Attempt 5: 10 minutes
```

## Scalability Considerations

### 1. Horizontal Scaling

#### Worker Scaling
```
Metrics for scaling:
- Queue depth > 100 jobs: Add workers
- Average wait time > 5 minutes: Add workers
- CPU usage < 20%: Remove workers
- Memory usage > 80%: Add workers

Scaling limits:
- Minimum workers: 2
- Maximum workers: 50
- Scale up rate: 2 workers/minute
- Scale down rate: 1 worker/5 minutes
```

#### Database Scaling
```
Read scaling:
- Read replicas for analytics
- Caching layer (Redis)
- Query result caching
- Connection pooling

Write scaling:
- Batch inserts
- Async writes
- Write buffer
- Partitioning by date
```

### 2. Vertical Scaling

#### When to scale up vs out
```
Scale UP when:
- Complex JavaScript rendering needed
- Large page processing
- Memory-intensive operations

Scale OUT when:
- High job volume
- Geographic distribution needed
- Fault tolerance required
```

## Monitoring & Observability

### 1. Key Metrics

#### System Health
- Worker availability
- Queue depth by priority
- Database connection pool status
- Storage usage percentage
- API response times

#### Business Metrics
- Jobs per hour by tier
- Success rate by domain
- Average job duration
- Cost per job
- Revenue per job

### 2. Alerting Rules

```
Critical Alerts:
- Worker pool < 50% capacity
- Queue depth > 1000 jobs
- Database connections > 80%
- Storage > 90% full
- Success rate < 80%

Warning Alerts:
- Unusual traffic patterns
- High retry rates
- Memory usage trending up
- Cost per job increasing
```

### 3. Debugging Tools

#### Job Tracing
- Unique trace ID per job
- Detailed timing logs
- Screenshot on failure
- Network request logs
- Decision tree logging

#### Performance Profiling
- Slow query logging
- Memory profiling
- CPU flamegraphs
- Network bottleneck analysis

## Failure Recovery Strategies

### 1. Graceful Degradation

```
Service Degradation Levels:
Level 0: Full service
Level 1: Disable free tier scraping
Level 2: Disable JavaScript rendering
Level 3: Queue-only mode (accept but don't process)
Level 4: Read-only mode
Level 5: Maintenance mode
```

### 2. Data Recovery

#### Backup Strategy
```
Continuous backups:
- Database: Every 5 minutes
- Job queue: Every 1 minute
- User uploads: Real-time to S3

Daily backups:
- Full database dump
- Configuration snapshot
- User data export

Weekly backups:
- Archived to cold storage
- Encrypted off-site copy
```

#### Recovery Procedures
```
1. Service failure:
   - Auto-failover to standby
   - DNS update (< 5 minutes)
   - Queue replay from checkpoint

2. Data corruption:
   - Point-in-time recovery
   - Consistency checking
   - User notification

3. Complete disaster:
   - Restore from off-site backup
   - Rebuild from infrastructure as code
   - Gradual service restoration
```

### 3. Communication Plan

```
Incident Response:
1. Automated status page update
2. Email to affected users
3. In-app notification
4. Public postmortem
```

## Implementation Priorities

### Phase 1: MVP (Weeks 1-4)
1. Basic queue system with Redis
2. Single worker implementation
3. Simple retry logic
4. Database storage only
5. Manual monitoring

### Phase 2: Reliability (Weeks 5-8)
1. Multi-worker support
2. Comprehensive error handling
3. Basic monitoring dashboard
4. Automated testing suite
5. Documentation

### Phase 3: Scale (Months 3-6)
1. Auto-scaling workers
2. Advanced queue features
3. S3 storage integration
4. Performance optimization
5. Full observability

### Phase 4: Enterprise (Months 6-12)
1. Multi-region support
2. Custom proxy infrastructure
3. Advanced analytics
4. White-label options
5. SLA guarantees

## Conclusion

This architecture provides a solid foundation for a scraping system that can start simple and scale to millions of pages per month. The modular design ensures that components can be swapped out as requirements change, while the comprehensive error handling and monitoring ensure reliability at scale.

The key to success is starting with the MVP implementation and gradually adding complexity as user demand grows. This approach minimizes initial development time while ensuring the system can scale when needed.