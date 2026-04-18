import type { Difficulty, Category } from '@/types'

export interface QuestionSeed {
  title: string
  prompt: string
  difficulty: Difficulty
  category: Category
  tags: string[]
  modelAnswer: string
}

export const questions: QuestionSeed[] = [
  {
    title: 'Design a URL Shortener',
    prompt:
      'Design a service like bit.ly that takes long URLs and returns short aliases. The system must handle millions of URLs, provide fast redirects, and optionally track click analytics.',
    difficulty: 'Medium',
    category: 'URL/ID',
    tags: ['hashing', 'sql', 'redis', 'cdn'],
    modelAnswer: `## URL Shortener Design

### Requirements
- Functional: shorten URL, redirect short → original, analytics (optional)
- Non-functional: 100M URLs, <10ms redirect latency, 99.9% uptime

### API
- POST /shorten { url } → { shortUrl }
- GET /:key → 301/302 redirect

### Hash Service
- Generate 6-char Base62 key (62^6 = 56B unique keys)
- On collision: append counter, rehash
- Pre-generate key pool for high throughput

### Storage
- SQL (PostgreSQL): id, short_key, original_url, created_at, user_id
- Redis: short_key → original_url (hot keys, TTL 24h)
- Read path: Redis → DB on miss → populate cache

### Redirect
- 301 (Moved Permanently): browser caches, reduces server load, loses analytics
- 302 (Found): every request hits server, enables click counting
- Use 302 for analytics; 301 for read-heavy with no analytics

### Scale
- Read:Write = 100:1 → cache aggressively
- Shard DB by short_key hash
- CDN in front for popular links`,
  },
  {
    title: 'Design a Unique ID Generator',
    prompt:
      'Design a distributed system that generates globally unique IDs at high throughput. IDs should be sortable by time and work across multiple data centers.',
    difficulty: 'Medium',
    category: 'URL/ID',
    tags: ['distributed', 'snowflake', 'uuid'],
    modelAnswer: `## Unique ID Generator

### Requirements
- Globally unique, ~64-bit integer
- Sortable by generation time
- 10K+ IDs/sec per node

### Approach: Twitter Snowflake
- 1 bit: sign (always 0)
- 41 bits: millisecond timestamp (69 years from epoch)
- 10 bits: machine ID (1024 nodes)
- 12 bits: sequence number per ms (4096/ms/node)

### Implementation
- Each node knows its machine ID at startup (from ZooKeeper or config)
- Sequence resets to 0 each millisecond
- On overflow (>4096/ms): wait for next ms

### Clock Skew
- Problem: NTP sync can move clock backward
- Solution: refuse to generate IDs if current time < last timestamp; alert ops

### Alternatives
- UUID v4: random, not sortable, 128 bits
- Database auto-increment: single point of failure
- Redis INCR: network hop per ID

### Trade-offs
- Snowflake: fast, sortable, no network hop — requires clock sync
- UUID: simple, no coordination — not sortable`,
  },
  {
    title: 'Design Twitter Feed',
    prompt:
      'Design the Twitter home feed — when a user opens Twitter, they see a ranked list of tweets from accounts they follow. The system must handle celebrity accounts (millions of followers) and deliver feeds in under 200ms.',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['fanout', 'redis', 'kafka', 'cdn', 'ranking'],
    modelAnswer: `## Twitter Feed Design

### Requirements
- Home timeline: tweets from followed accounts, reverse-chronological + ranked
- 300M DAU, 500M tweets/day
- Read latency < 200ms

### Fan-out Approaches

**Fan-out on Write (push model)**
- On tweet: write to every follower's feed cache (Redis sorted set)
- Read: O(1) — just read from cache
- Problem: celebrity with 10M followers = 10M writes per tweet

**Fan-out on Read (pull model)**
- On read: fetch tweets from all followed accounts, merge, rank
- Problem: O(following_count) reads per page load

**Hybrid (Twitter's actual approach)**
- Normal users (<10K followers): fan-out on write
- Celebrities: fan-out on read (fetched and merged at read time)
- Threshold: configurable per account

### Storage
- Tweets: Cassandra (write-heavy, time-series, append-only)
- Feed cache: Redis sorted set (score = timestamp, value = tweet_id)
- User graph: MySQL (follower/following relationships)

### Ranking
- Fetch top-N from cache → apply ML ranking → return page
- Ranking considers: recency, engagement, relationship strength

### Media
- Images/video: S3 + CloudFront CDN
- Tweet contains media_url, not binary`,
  },
  {
    title: 'Design Instagram',
    prompt:
      'Design a photo-sharing social network like Instagram. Users upload photos, follow others, and see a feed of recent photos from accounts they follow.',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['cdn', 'sql', 'cassandra', 'redis', 'fanout'],
    modelAnswer: `## Instagram Design

### Core Features
- Upload photo with caption
- Follow users
- Home feed (followed accounts, ranked)
- Profile page

### Photo Upload Flow
1. Client → API server: POST /photos (multipart)
2. API server → S3: store original
3. Background worker: resize to multiple resolutions (thumbnail, medium, full)
4. Store resized versions in S3, record URLs in DB
5. Fan-out tweet to followers' feeds

### Storage
- Photos: S3 + CloudFront CDN (serve closest edge)
- Metadata (caption, user_id, timestamp): PostgreSQL
- Social graph: PostgreSQL (user_id, follower_id, created_at)
- Feed cache: Redis sorted set per user

### Feed Generation
- Hybrid fan-out (same as Twitter): push for regular users, pull for celebrities
- Feed entry contains photo_id only; full data fetched on render

### Key Numbers
- 1B users, 95M photos/day
- Read:Write ≈ 100:1
- Photo storage: 95M × 3MB avg = 285TB/day → use S3 lifecycle policies

### CDN Strategy
- CloudFront origin = S3
- Cache-Control: max-age=31536000 (photos are immutable)
- Serve user's closest PoP`,
  },
  {
    title: 'Design Google Drive / Dropbox',
    prompt:
      'Design a cloud file storage service. Users can upload, download, and sync files across devices. Support folders, sharing, and versioning.',
    difficulty: 'Hard',
    category: 'Storage',
    tags: ['s3', 'sql', 'sync', 'delta', 'chunking'],
    modelAnswer: `## Cloud File Storage Design

### Key Challenges
- Large file uploads (chunking)
- Sync across devices (delta sync)
- Conflict resolution

### Upload Flow (Chunked)
1. Client splits file into 4MB chunks, computes SHA-256 per chunk
2. POST /upload/init → server returns upload_id
3. For each chunk: PUT /upload/{upload_id}/chunk/{n} → server checks if chunk hash exists (dedup)
4. POST /upload/complete → server assembles metadata

### Storage
- Chunks: S3 (keyed by SHA-256 hash — automatic dedup across users)
- File metadata: PostgreSQL (file_id, user_id, name, parent_folder_id, size, version)
- Chunk index: file_id → [chunk_hash_1, chunk_hash_2, ...] (PostgreSQL array)

### Sync Protocol
1. Client polls /changes?since=cursor or uses WebSocket
2. Server sends delta: list of changed file_ids
3. Client fetches only changed chunks (delta sync)
4. Conflict: last-write-wins or create conflict copy

### Sharing
- Share link: POST /share { file_id, permission } → token
- ACL table: (resource_id, user_id, permission)

### Versioning
- Keep last N versions (configurable)
- Each version = new row in file_versions table pointing to same chunks
- Restore: swap current_version_id

### Bandwidth Optimization
- Chunk dedup: same chunk uploaded by 10 users = stored once
- Delta sync: re-upload only changed chunks on edit`,
  },
  {
    title: 'Design a CDN',
    prompt:
      'Design a content delivery network that caches static assets (images, JS, CSS, video) at edge servers worldwide. Explain cache invalidation, origin pull, and how routing works.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['cdn', 'anycast', 'cache', 'ttl', 'dns'],
    modelAnswer: `## CDN Design

### Goal
Serve static content from edge servers close to users, reducing latency from 200ms (cross-ocean) to <20ms.

### Components
- Origin server: canonical source of truth
- Edge PoPs (Points of Presence): 50–100 cities globally, each has cache servers
- DNS: routes user to nearest PoP via anycast or GeoDNS

### Request Flow
1. User: GET assets.example.com/logo.png
2. DNS resolves to nearest PoP IP (anycast: BGP routes to nearest PoP)
3. PoP cache HIT → return cached response
4. PoP cache MISS → fetch from origin, cache with TTL, return to user

### Caching
- Cache-Control: max-age=86400 (set by origin)
- ETag / Last-Modified for conditional requests
- Vary: Accept-Encoding to cache gzip and br separately

### Cache Invalidation
- Wait for TTL (simplest) — stale for up to TTL duration
- URL versioning: /logo.v3.png — change URL on deploy, old TTL irrelevant
- API purge: POST /cdn/purge { urls: [...] } — push invalidation to all PoPs

### Tiered Caching
- L1: edge PoP (city-level)
- L2: regional hub (continent-level)
- Origin: final fallback
- Reduces origin load dramatically

### Health & Failover
- Each PoP has 10+ servers behind a load balancer
- If PoP fails: DNS/BGP fails over to next-nearest PoP`,
  },
  {
    title: 'Design a Cache System (Redis)',
    prompt:
      'Design a distributed caching layer for a high-traffic web application. Cover eviction policies, consistency strategies, and how to handle cache stampede and hot keys.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['redis', 'eviction', 'consistency', 'sharding'],
    modelAnswer: `## Distributed Cache Design

### Role of Cache
Sit between app servers and database; serve reads from memory (sub-ms) instead of DB (10-100ms).

### Cache Strategies

**Cache-Aside (Lazy Loading)**
1. App checks cache
2. Cache miss → app reads DB → writes to cache → returns data
3. Cache hit → return directly
- Pros: only caches what's needed; resilient to cache failure
- Cons: cold start latency; stale data possible

**Write-Through**
- On write: update cache AND DB synchronously
- Pros: cache always fresh
- Cons: write latency doubles; cache fills with rarely-read data

**Write-Behind (Write-Back)**
- Write to cache immediately, async flush to DB
- Pros: fast writes
- Cons: data loss if cache fails before flush

### Eviction Policies
- LRU (Least Recently Used): best general-purpose
- LFU (Least Frequently Used): good for popularity skew
- TTL: always set TTL to prevent stale data accumulation

### Cache Stampede
- Problem: many requests miss simultaneously (after TTL expiry), all hit DB
- Solutions:
  - Mutex lock: first request fetches, others wait
  - Probabilistic early expiration: randomly refresh before TTL expires
  - Background refresh: async refresh before TTL, serve stale briefly

### Hot Keys
- Problem: one key receives millions of req/sec (e.g., celebrity user)
- Solutions:
  - Local in-process cache on app server (copy of hot key)
  - Shard hot key: key_1, key_2, key_3 — app picks randomly

### Cluster
- Redis Cluster: 16384 hash slots, each master owns a slot range
- Each master has replicas; failover via Redis Sentinel or Cluster`,
  },
  {
    title: 'Design Apache Kafka',
    prompt:
      'Design a distributed message queue / event streaming platform. Support high-throughput publish-subscribe with durable message storage, consumer groups, and at-least-once delivery.',
    difficulty: 'Hard',
    category: 'Messaging',
    tags: ['kafka', 'partitions', 'consumer-groups', 'replication', 'offset'],
    modelAnswer: `## Distributed Message Queue Design

### Core Concepts
- Topic: named stream of records
- Partition: ordered, immutable log; unit of parallelism
- Producer: writes to topic (chooses partition via key hash or round-robin)
- Consumer Group: each partition consumed by exactly one member

### Write Path
1. Producer → Broker leader of target partition
2. Leader appends to partition log (segment file on disk)
3. Replicate to ISR (In-Sync Replicas): acks=all → wait for all ISR to confirm
4. Return offset to producer

### Read Path
1. Consumer polls broker: FETCH topic=orders, partition=2, offset=1042
2. Broker returns records from offset
3. Consumer processes, commits offset (to __consumer_offsets topic)
4. On crash + restart: resume from last committed offset (at-least-once)

### Durability
- Each partition replicated across N brokers (default 3)
- Leader election via ZooKeeper / KRaft if leader fails
- Log compaction: keep only latest value per key (for changelog topics)

### Throughput
- Sequential disk writes (append-only log) = 500MB/s+
- Zero-copy transfer: sendfile() bypasses kernel↔user copy
- Batching: producer batches records, consumer fetches batches

### Consumer Groups
- 4 partitions, 4 consumers → each consumer owns 1 partition
- 4 partitions, 2 consumers → each consumer owns 2 partitions
- Adding consumer → rebalance (brief pause)

### Retention
- Time-based: delete segments older than 7 days
- Size-based: delete oldest when log exceeds 100GB`,
  },
  {
    title: 'Design a Notification System',
    prompt:
      'Design a notification system that delivers push notifications, emails, and SMS to millions of users. Support user preferences, rate limiting, and retry on failure.',
    difficulty: 'Medium',
    category: 'Messaging',
    tags: ['kafka', 'fcm', 'sendgrid', 'twilio', 'rate-limiting'],
    modelAnswer: `## Notification System Design

### Channels
- Push: APNs (iOS), FCM (Android)
- Email: SendGrid / SES
- SMS: Twilio

### Architecture

**Ingestion Layer**
- POST /notifications { user_id, type, template_id, data }
- Validate, enrich with user preferences
- Publish to Kafka topic per channel: notifications.push, notifications.email, notifications.sms

**Worker Layer (per channel)**
- Kafka consumer group per channel
- Workers dequeue, render template, call provider API
- On failure: retry with exponential backoff (3 attempts), then dead-letter queue

**User Preferences Service**
- GET /preferences/{user_id} → { push: true, email: false, sms: true, quiet_hours: "22:00-08:00" }
- Check preferences before enqueuing per channel

### Rate Limiting
- Per user: max 10 push/hour, 5 email/day, 3 SMS/day
- Sliding window counter in Redis
- If limit exceeded: drop or schedule for next window

### Template Engine
- Templates stored in DB: { id, channel, subject, body_html, body_text }
- Mustache/Handlebars rendering server-side
- Localization: template has locale variants

### Retry & DLQ
- Max 3 retries with exponential backoff (1s, 2s, 4s)
- Failed after 3: move to DLQ Kafka topic
- Ops alert on DLQ growth; manual replay tool

### Tracking
- Delivery event → analytics Kafka topic
- Track: sent, delivered, opened, clicked (pixel/link tracking for email)`,
  },
  {
    title: 'Design Google Search Autocomplete',
    prompt:
      'Design the search query autocomplete feature that shows suggestions as the user types. Suggestions should be ranked by popularity and personalized. Handle 10K requests per second.',
    difficulty: 'Medium',
    category: 'Search',
    tags: ['trie', 'redis', 'kafka', 'ranking'],
    modelAnswer: `## Search Autocomplete Design

### Requirements
- Return top-5 suggestions for prefix in <100ms
- Ranked by popularity (global + personalized)
- Update rankings based on recent search volume

### Data Structure: Trie
- Trie node: char → children map + top-5 suggestions cached at each node
- Insert: walk/create path, update top-5 at each node if new query > min score
- Query: walk to prefix node → return cached top-5 (O(prefix_length))
- Tradeoff: memory-heavy; store in Redis as hash (prefix → JSON top-5)

### Scale: Distributed Approach
- Shard trie by first letter (or first 2 letters)
- Each shard served by dedicated Redis cluster
- Trie rebuilt periodically (every 1h) from aggregated search logs

### Ranking
- Score = query_count (weekly) × recency_weight
- Collect: every search → Kafka → Flink aggregation → sorted set per prefix
- Redis ZSET: prefix → { query: score } → ZREVRANGE → top-5

### Personalization
- Blend: 70% global score + 30% user's own recent searches
- User's recent searches: Redis list (last 20 queries)
- Merge at query time: fetch global top-5 + user recents → re-rank

### API
- GET /autocomplete?q=des&locale=en → ["design twitter", "design uber", ...]
- Cache-Control: max-age=60 (suggestions stable for 60s)
- CDN caches popular prefixes

### Filtering
- Block autocomplete for offensive terms (blocklist check O(1) with Bloom filter)`,
  },
  {
    title: 'Design a Chat Application',
    prompt:
      'Design a real-time chat system like WhatsApp or Slack. Support 1:1 messaging, group chats, message history, online/offline status, and message delivery receipts.',
    difficulty: 'Hard',
    category: 'Real-time',
    tags: ['websocket', 'kafka', 'cassandra', 'redis', 'presence'],
    modelAnswer: `## Chat Application Design

### Real-Time Layer
- WebSocket connections: each client maintains persistent WS to a chat server
- Chat server holds: user_id → WebSocket connection map
- Problem: user A on server 1, user B on server 2 — how does A's message reach B?
- Solution: pub/sub via Redis or Kafka (inter-server message bus)

### Message Flow (1:1)
1. A sends message → A's chat server
2. Chat server publishes to Redis channel: "user:{B_id}"
3. B's chat server subscribes to "user:{B_id}" → receives message
4. B's chat server pushes over WebSocket to B
5. Message stored in Cassandra

### Offline Handling
- If B is offline: no WS connection; message queued in Redis/Kafka
- On B reconnect: server sends unread messages (pulled from DB by last_seen timestamp)

### Message Storage (Cassandra)
- messages (conversation_id, message_id TimeUUID, sender_id, body, sent_at)
- PRIMARY KEY (conversation_id, message_id) WITH CLUSTERING ORDER BY (message_id DESC)

### Group Chat
- Group message → fan-out to all members
- For large groups (>500): fan-out via Kafka topic per group
- Members fetch messages from DB (pull model) to avoid N×write fan-out

### Presence
- Client sends heartbeat every 30s
- Redis: user_id → last_seen_timestamp (TTL 60s)
- Online = last_seen within 60s

### Delivery Receipts
- Sent (✓): message stored in DB
- Delivered (✓✓): receiver's device received over WS — ack sent to sender
- Read (blue ✓✓): receiver opened conversation — read receipt sent`,
  },
  {
    title: 'Design Uber Live Location Tracking',
    prompt:
      'Design the real-time location tracking system for a ride-sharing app. Drivers send GPS coordinates every 4 seconds; riders see driver location updated in real time.',
    difficulty: 'Hard',
    category: 'Real-time',
    tags: ['websocket', 'redis', 'geospatial', 'kafka'],
    modelAnswer: `## Live Location Tracking Design

### Requirements
- 1M drivers sending location every 4s = 250K writes/sec
- Rider sees driver location update within 5s
- Find nearby drivers within radius

### Write Path (Driver → System)
1. Driver mobile app → POST /location { driver_id, lat, lng, timestamp } every 4s
2. Location service writes to Redis GEO: GEOADD drivers lng lat driver_id
3. Also publishes to Kafka topic: driver.location (for audit, ML, analytics)

### Read Path (Rider sees driver)
- Option A: Polling — rider polls GET /driver/{id}/location every 3s
- Option B: WebSocket push — location service pushes updates to rider's WS connection
- Choice: WebSocket for active ride; polling for "find drivers nearby" list

### Nearby Driver Search
- Redis GEORADIUS drivers lng lat 5 km COUNT 10 ASC
- Returns up to 10 closest drivers within 5km

### Driver Location Storage
- Redis GEO: current location only (overwrite on each update)
- Kafka → S3: full location history (for analytics, replay)
- Trip route: store sampled locations in PostgreSQL during active ride

### Scale
- 250K writes/sec → Redis cluster (horizontal sharding by driver_id hash)
- Separate Redis cluster per city/region
- Location service is stateless; deploy many instances behind LB`,
  },
  {
    title: 'Design a Rate Limiter',
    prompt:
      'Design a rate limiter that restricts API usage to N requests per time window per user. It must work in a distributed environment where requests hit different servers.',
    difficulty: 'Medium',
    category: 'Infrastructure',
    tags: ['redis', 'sliding-window', 'token-bucket', 'middleware'],
    modelAnswer: `## Rate Limiter Design

### Algorithms

**Fixed Window Counter**
- Redis: INCR user:{id}:window:{minute}; EXPIRE to window end
- Simple; burst at window boundary (100 at 0:59, 100 at 1:01 = 200 in 2s)

**Sliding Window Counter (recommended)**
- Estimate: current_count = prev_window_count × overlap_ratio + current_window_count
- Memory-efficient; approximate but accurate within 0.1%

**Token Bucket**
- Each user has bucket of N tokens; refill at rate R/sec
- Allows bursts up to bucket capacity

### Distributed Implementation
- Shared state in Redis (all app servers hit same Redis)
- Lua script for atomic check-and-increment (prevents race conditions)
- If count > limit: return 429 Too Many Requests

### Response Headers
- X-RateLimit-Limit: 100
- X-RateLimit-Remaining: 43
- X-RateLimit-Reset: epoch when window resets
- Retry-After: seconds until retry allowed, on 429

### Tiers
- IP-based: protect unauthenticated endpoints
- User-based: per API key / user_id
- Endpoint-based: stricter limits on expensive endpoints`,
  },
  {
    title: 'Design a Load Balancer',
    prompt:
      'Design a layer 7 (HTTP) load balancer that distributes traffic across backend servers. Cover algorithms, health checks, sticky sessions, and how to make the load balancer itself highly available.',
    difficulty: 'Medium',
    category: 'Infrastructure',
    tags: ['load-balancing', 'health-check', 'consistent-hashing', 'ha'],
    modelAnswer: `## Load Balancer Design

### Layer 7 LB
- Terminates TLS, reads HTTP headers, routes based on URL/header/cookie
- Reverse proxy: client talks to LB, LB forwards to backends

### Algorithms
- Round Robin: simple, even distribution; ignores server load
- Least Connections: route to server with fewest active connections
- IP Hash: same client → same server (poor man's sticky sessions)
- Consistent Hashing: minimal reshuffling when adding/removing servers

### Health Checks
- Active: LB sends GET /health to each backend every 5s
- Passive: detect failures from 5xx responses (circuit breaker)
- Remove unhealthy backend from pool; re-add after N consecutive successes

### Sticky Sessions
- Problem: stateful apps need same server
- Solution A: LB sets cookie with server_id
- Solution B (better): move session to shared store (Redis) — stateless backends

### TLS Termination
- LB handles TLS (cert stored on LB); backend traffic is HTTP
- Reduces CPU on backends; simpler cert management

### High Availability of LB
- Active-Passive: standby LB takes over if active fails (via keepalived + VIP)
- Active-Active: DNS round-robin across 2 LBs
- Anycast: BGP announces same IP from multiple PoPs`,
  },
  {
    title: 'Design a Circuit Breaker',
    prompt:
      'Design the circuit breaker pattern for a microservices system. Explain states, transitions, thresholds, and how it prevents cascading failures.',
    difficulty: 'Easy',
    category: 'Infrastructure',
    tags: ['resilience', 'microservices', 'circuit-breaker', 'fallback'],
    modelAnswer: `## Circuit Breaker Pattern

### Problem
Service A calls Service B. B is slow/failing. Without circuit breaker: A's thread pool exhausts waiting for B → A fails → upstream C fails (cascade).

### States
- **Closed** (normal): requests flow through; failure count tracked
- **Open** (tripped): requests fail immediately (no network call); fallback returned
- **Half-Open** (recovery probe): 1 test request allowed; if success → Closed; if fail → Open

### Transitions
- Closed → Open: failure rate > threshold (e.g., 50% of last 60s)
- Open → Half-Open: after timeout (e.g., 30s)
- Half-Open → Closed: probe request succeeds
- Half-Open → Open: probe request fails

### Thresholds
- Minimum calls before evaluating: 10
- Failure rate threshold: 50%
- Slow call threshold: >2s = slow; if >50% slow → Open
- Open duration: 30s before trying Half-Open

### Fallback Strategies
- Return cached response (stale but acceptable)
- Return default value (empty list, "unavailable" message)
- Call alternative service
- Fail fast with clear error (better UX than timeout)

### Metrics to Monitor
- State transitions (alert on Open)
- Failure rate per service
- Fallback invocation rate`,
  },
  {
    title: 'Design a Web Crawler',
    prompt:
      'Design a distributed web crawler that can index billions of web pages. Cover URL frontier management, politeness, deduplication, and how to scale.',
    difficulty: 'Hard',
    category: 'Infrastructure',
    tags: ['distributed', 'queue', 'bloom-filter', 'robots-txt'],
    modelAnswer: `## Web Crawler Design

### Components
1. URL Frontier (priority queue of URLs to crawl)
2. Fetcher (downloads HTML)
3. Parser (extracts links + content)
4. Dedup store (seen URLs)
5. Storage (raw HTML + extracted data)

### URL Frontier
- Two-level queue: priority queue (importance) → per-domain FIFO queues
- Per-domain queues enforce politeness (crawl-delay from robots.txt)
- Selector: picks from high-priority domain queues; enforces ≥1s between requests to same domain

### Politeness
- Respect robots.txt: fetch /robots.txt before first crawl; cache per domain
- Crawl-delay directive: honor wait time between requests
- User-Agent: identify crawler honestly

### Deduplication
- URL level: Bloom filter (fast, probabilistic; rare false positives OK)
- Content level: SimHash of page content → detect near-duplicate pages

### Storage
- Raw HTML: S3 (compressed, deduplicated)
- Extracted links: pushed back to URL frontier queue (Kafka)
- Structured content: Elasticsearch for search index

### Scale
- 1B pages, avg 100KB = 100TB raw HTML
- 10K pages/sec = 864M pages/day
- 100 crawler workers, each handling 100 req/sec`,
  },
  {
    title: 'Design Amazon S3',
    prompt:
      'Design a scalable object storage service. Objects are stored in buckets, identified by keys. Support upload, download, delete, and listing with pagination.',
    difficulty: 'Hard',
    category: 'Storage',
    tags: ['distributed', 'consistent-hashing', 'erasure-coding', 'replication'],
    modelAnswer: `## Object Storage Design (S3)

### API
- PUT /buckets/{bucket}/{key} — upload object
- GET /buckets/{bucket}/{key} — download object
- DELETE /buckets/{bucket}/{key}
- GET /buckets/{bucket}?prefix=&marker= — list objects

### Architecture
- Metadata service: stores bucket/key → object location mapping
- Data nodes: store actual bytes, replicated across AZs
- Gateway: routes requests, handles auth

### Data Placement
- Consistent hashing ring: distribute objects across data nodes
- Each object replicated to 3 nodes (primary + 2 replicas)
- Quorum writes (W=2), quorum reads (R=2), N=3 → eventual consistency

### Durability
- Erasure coding (RS 6+3): split object into 6 data + 3 parity shards
- Survive loss of any 3 shards
- Background scrubbing: detect and repair bit rot

### Large Object Upload
- Multipart upload: client splits into parts ≥5MB
- Each part uploaded independently
- CompleteMultipartUpload assembles parts server-side`,
  },
  {
    title: 'Design Elasticsearch',
    prompt:
      'Design a distributed full-text search engine. Support indexing documents, full-text search with ranking, and filtering. Handle millions of documents.',
    difficulty: 'Hard',
    category: 'Search',
    tags: ['inverted-index', 'lucene', 'sharding', 'ranking'],
    modelAnswer: `## Distributed Search Engine Design

### Core: Inverted Index
- Forward index: doc_id → [word1, word2, ...]
- Inverted index: word → [doc_id, position, frequency, ...]
- Query "design system" → intersect posting lists for "design" ∩ "system"

### Indexing Pipeline
1. POST /index { id, title, body, tags }
2. Tokenize: lowercase, remove stop words, stem ("designing" → "design")
3. Build inverted index entries
4. Store in immutable segment files (Lucene segments)
5. Periodically merge small segments into larger ones

### Ranking (BM25)
- TF (term frequency in doc) × IDF (inverse document frequency)
- BM25 improves on TF-IDF: saturates at high TF, normalizes by doc length
- Boost factors: title match > body match; recency boost

### Distributed Architecture
- Index split into N primary shards (e.g., 5)
- Each shard replicated to M replicas (e.g., 1)
- Routing: shard = hash(doc_id) % N
- Coordinator node: scatter query to all shards, gather + merge + sort results

### Near Real-Time
- In-memory buffer → searchable in 1s (refresh interval)
- Durable: write-ahead log (translog) → fsync periodically`,
  },
  {
    title: 'Design TikTok / YouTube Shorts Feed',
    prompt:
      'Design a short-video feed that auto-plays the next video as the user scrolls. The recommendation engine must personalize the feed based on watch history and engagement signals.',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['cdn', 'ml', 'streaming', 'kafka', 'redis'],
    modelAnswer: `## Short Video Feed Design

### Components
1. Upload pipeline
2. Video storage + CDN delivery
3. Recommendation engine
4. Feed API

### Upload Pipeline
1. POST /videos → S3 raw storage
2. Transcoding job: FFmpeg → multiple resolutions (240p, 480p, 1080p) + HLS segments
3. Store HLS manifest + segments in S3
4. CDN (CloudFront) serves segments

### Video Delivery
- HLS (HTTP Live Streaming): adaptive bitrate based on network speed
- Preload next 2 videos while current plays
- CDN cache: segments cached at edge, TTL = forever (immutable)

### Recommendation Engine
- Input signals: watch time %, likes, shares, skips, account follows
- Emit events to Kafka on each signal
- Flink processes events → update user embedding + video embedding
- ANN search (FAISS): find top-K videos similar to user's interest vector
- Re-rank by predicted CTR (lightweight ML model)

### Feed API
- GET /feed → returns list of { video_id, manifest_url, thumbnail_url }
- Server pre-fetches next page; client requests when 3 videos remain
- Feed is stateful per session (cursor-based)`,
  },
  {
    title: 'Design a Key-Value Store',
    prompt:
      'Design a distributed key-value store like DynamoDB or Cassandra. Support get, put, and delete. Handle replication, consistency, and partitioning across multiple nodes.',
    difficulty: 'Hard',
    category: 'Storage',
    tags: ['consistent-hashing', 'replication', 'quorum', 'gossip', 'vector-clock'],
    modelAnswer: `## Distributed Key-Value Store Design

### API
- GET /key → value (or 404)
- PUT /key { value } → 200
- DELETE /key → 200

### Partitioning
- Consistent hashing ring: each node owns a range of the hash space
- Virtual nodes (vnodes): each physical node = 150 virtual nodes → even distribution
- On node add/remove: only adjacent ranges rebalance

### Replication
- Each key replicated to N nodes (default N=3)
- Preference list: N clockwise nodes from key's position on ring
- Coordinator (first node) handles client request, fans out to replicas

### Consistency (Tunable)
- W = write quorum, R = read quorum, N = replication factor
- Strong consistency: R + W > N (e.g., R=2, W=2, N=3)
- Eventual consistency: W=1, R=1 (faster, may read stale)
- DynamoDB default: R=1, W=1 with eventual consistency

### Conflict Resolution
- Last-Write-Wins (LWW): use timestamp; risk of data loss
- Vector clocks: track causal history; detect concurrent writes → client resolves

### Failure Detection
- Gossip protocol: each node periodically exchanges state with random peers
- Phi Accrual failure detector: probabilistic "is node X dead?"

### Anti-Entropy
- Merkle trees: efficient comparison of key ranges between replicas
- Background repair: sync diverged replicas`,
  },
]
