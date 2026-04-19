import type { Difficulty, Category } from '@/types'

export interface QuestionSeed {
  title: string
  prompt: string
  difficulty: Difficulty
  category: Category
  tags: string[]
  modelAnswer: string
  mermaidDiagram?: string
  asciiDiagram?: string
  studyNotes?: string
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
    mermaidDiagram: `graph LR
  Client -->|POST /shorten| LB[Load Balancer]
  LB --> API[API Servers]
  API --> Cache[(Redis\\nshort→long, TTL 24h)]
  API -->|miss| DB[(PostgreSQL\\nshort_key, long_url)]
  Client -->|GET /:key| LB
  API -->|301/302 redirect| Client`,
    asciiDiagram: `Client
  │
  ├─POST /shorten──► Load Balancer ──► API Servers ──► Hash Service
  │                                         │               │
  │                                      Redis Cache   PostgreSQL
  │                                      (hot keys)    (all keys)
  │
  └─GET /:key──────► Load Balancer ──► API Servers
                                           │
                              Cache HIT ◄──┘──► Cache MISS ──► DB
                                           │
                                      301/302 Redirect`,
    studyNotes: `## Alex Xu Vol 1, Chapter 8 — URL Shortener

### Key Design Decisions

**301 vs 302 Redirect**
- 301 Permanent: browser caches the redirect — reduces server load but breaks click analytics
- 302 Found: every click hits server — enables accurate analytics (preferred for tracking)

**Hash Function**
- Base62 encoding of auto-increment DB ID: chars [0-9 a-z A-Z]
- 6 chars = 62^6 ≈ 56 billion unique keys
- Alternative: MD5/SHA-1 truncated to 7 chars → collision possible, must check DB

**Key Estimates (Alex Xu)**
- 100M URLs created/day → 100M / 86400 ≈ 1160 writes/sec
- Read:Write = 10:1 → 11,600 reads/sec
- 365 days × 10 years × 100M = 365B records
- Storage: 365B × 100 bytes = 36.5TB

**Database Choice**
- SQL (PostgreSQL) for the mapping table — simple CRUD, indexed on short_key
- NoSQL alternative: Cassandra for massive scale with key-value access pattern

**Caching**
- Cache top 20% hot links (Pareto principle — 80% of reads hit 20% of URLs)
- LRU eviction policy
- Redis with TTL 24h

**Analytics (optional)**
- Log each redirect to Kafka → Flink aggregation → store counts in ClickHouse`,
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
    mermaidDiagram: `graph TB
  subgraph sf["Snowflake 64-bit ID Layout"]
    s["1 bit: Sign"]
    t["41 bits: Timestamp (ms since custom epoch)"]
    m["10 bits: Machine ID (datacenter 5 + worker 5)"]
    q["12 bits: Sequence (4096 IDs/ms/node)"]
  end
  Client -->|Request ID| IDS[ID Generator Service]
  IDS --> ZK[ZooKeeper\\nMachine ID Registry]
  ZK -->|assigned machine_id| IDS
  IDS -->|64-bit int| Client`,
    asciiDiagram: `Snowflake 64-bit ID:
┌─────┬──────────────────────────┬──────────────────┬──────────────────┐
│  1  │         41 bits          │     10 bits      │     12 bits      │
│Sign │   Timestamp (epoch ms)   │   Machine ID     │    Sequence      │
└─────┴──────────────────────────┴──────────────────┴──────────────────┘
                                  ├── 5 datacenter ──┤
                                  └── 5 worker ID  ──┘

Capacity: 41 bits → 69 years | 10 bits → 1024 nodes | 12 bits → 4096/ms/node`,
    studyNotes: `## Alex Xu Vol 1, Chapter 7 — Unique ID Generator

### Approaches Compared

| Approach | Pros | Cons |
|---|---|---|
| DB Auto-increment | Simple | Single point of failure; slow |
| UUID | Simple, no coordination | 128-bit, not sortable, not numeric |
| Redis INCR | Fast, numeric | Network hop; persistence complexity |
| Snowflake | Fast, sortable, 64-bit, no coord | Requires clock sync |
| Ticket Server (Flickr) | Numeric, simple | SPOF unless multi-server |

### Snowflake Breakdown (Alex Xu's version)
- Sign bit (1): always 0 — keeps IDs positive
- Timestamp (41): ms since custom epoch (e.g., Nov 4, 2010) → good for 69 years
- Datacenter ID (5): up to 32 datacenters
- Worker ID (5): up to 32 workers per datacenter
- Sequence (12): 4096 IDs per millisecond per worker

### Clock Skew Problem
- NTP can adjust clock backward → duplicate IDs
- Solution: if current_time < last_timestamp, wait or throw exception
- Monitor clock drift with alerts

### Throughput
- Single node: 4096 × 1000ms = 4.096M IDs/second
- 1024 nodes: 4.1B IDs/second globally`,
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
    mermaidDiagram: `graph LR
  Writer[Writer User] -->|POST /tweet| API[API Server]
  API --> TweetDB[(Cassandra\\nTweets)]
  API --> Kafka[Kafka\\ntweet.published]
  Kafka --> FanOut[Fanout Worker]
  FanOut -->|check| Graph[Social Graph\\nMySQL]
  FanOut -->|push: normal users| FeedCache[(Redis\\nSorted Set per user)]
  FanOut -->|skip celebrities| FeedCache
  Reader[Reader User] -->|GET /feed| FeedAPI[Feed API]
  FeedAPI -->|read pre-built feed| FeedCache
  FeedAPI -->|merge celebrity tweets at read| TweetDB`,
    asciiDiagram: `WRITE PATH:
  Writer ──► API ──► Cassandra (tweet store)
                └──► Kafka ──► Fanout Worker
                                    │
                              Social Graph (MySQL)
                              ├── normal user (<10K followers):
                              │   push tweet_id to each follower's Redis sorted set
                              └── celebrity (>10K followers):
                                  skip fanout (pull at read time)

READ PATH:
  Reader ──► Feed API
                ├──► Redis (sorted set by score=timestamp) ← pre-built feed
                └──► Cassandra (fetch celebrity tweets on demand)
                        │
                  Merge + ML rank ──► Response`,
    studyNotes: `## Alex Xu Vol 1, Chapter 11 — News Feed System

### Fan-out Strategies

**Fan-out on Write (Push)**
- When tweet posted: write tweet_id to every follower's feed cache
- Read: O(1) — just ZRANGE from Redis sorted set
- Problem: celebrity with 10M followers = 10M Redis writes per tweet

**Fan-out on Read (Pull)**
- When user opens feed: fetch from all N accounts they follow, merge, sort
- Problem: O(following_count) reads = slow for heavy followers

**Hybrid (Twitter's actual approach)**
- Regular users (<10K followers): fan-out on write
- Celebrities: excluded from fanout; merged at read time from DB
- Threshold is configurable per account

### Feed Cache (Redis)
- Sorted set key: feed:{user_id}
- Score: tweet timestamp (Unix ms)
- Value: tweet_id
- Max size: 800 entries per user (older trimmed)

### Data Storage
- Tweets: Cassandra (time-series, write-heavy, no joins needed)
- Social graph: MySQL (user_id, follower_id, created_at)
- Feed cache: Redis (ephemeral, reconstructible)
- Media: S3 + CloudFront CDN

### Ranking
- Fetch top 500 from cache
- Apply ML ranking model (recency + engagement + relationship strength)
- Return top 20 to client`,
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
    mermaidDiagram: `graph LR
  User -->|upload photo| API[API Server]
  API -->|store original| S3[S3 Raw Storage]
  S3 --> Worker[Resize Worker\\nLambda/Queue]
  Worker -->|thumbnail 150px\\nmedium 640px\\nfull 1080px| S3CDN[S3 + CloudFront CDN]
  Worker -->|update| PhotoDB[(PostgreSQL\\nphoto metadata)]
  PhotoDB --> FanOut[Fanout Service]
  FanOut -->|follower feed| Redis[(Redis\\nFeed Sorted Sets)]
  Reader -->|GET /feed| FeedAPI[Feed API]
  FeedAPI --> Redis
  FeedAPI -->|photo URLs| CDN[CloudFront CDN]`,
    asciiDiagram: `UPLOAD:
  User ──► API Server ──► S3 (raw)
                              └──► Resize Workers (async)
                                        ├──► S3/CDN (150px thumbnail)
                                        ├──► S3/CDN (640px medium)
                                        └──► S3/CDN (1080px full)
                                        └──► PostgreSQL (photo metadata)
                                        └──► Fanout → Redis feed caches

SERVE:
  User ──► Feed API ──► Redis (sorted set) ──► photo_ids
                             └──► PostgreSQL (metadata)
                             └──► CloudFront CDN (actual images)`,
    studyNotes: `## Instagram Design (extended from Alex Xu Vol 1, Chapter 11 principles)

### Photo Upload Pipeline
1. Client uploads to API server (multipart/form-data or pre-signed S3 URL)
2. API stores original to S3, creates DB record with status=processing
3. Message queue (SQS/Kafka) triggers resize workers
4. Workers produce 3 variants: thumbnail, medium, full resolution
5. Update DB record with CDN URLs, status=ready
6. Fan-out to followers' Redis feed caches

### Storage Estimates
- 1B users, 95M photos/day
- Avg photo size: 3MB compressed → 95M × 3MB = 285TB/day raw
- With 3 resolutions: ~570TB/day
- CDN serves 99% of traffic; origin only for cache misses

### CDN Strategy
- Cache-Control: max-age=31536000, immutable (photos never change)
- URL contains content hash: /photos/a3f8b2c4.jpg
- CloudFront → S3 origin on miss
- Serve from nearest PoP globally

### Social Graph
- Follower table: (user_id, follower_id, created_at) — MySQL
- Celebrity accounts: flag for pull-based feed (same hybrid model as Twitter)

### Key vs Twitter difference
- Instagram = image-first; tweet_id in feed cache points to photo metadata
- Stories: separate ephemeral layer (24h TTL in Redis)`,
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
    mermaidDiagram: `graph LR
  Client -->|split into 4MB chunks| Client
  Client -->|PUT chunk + SHA256| UploadSvc[Upload Service]
  UploadSvc -->|dedup check| ChunkStore[(S3\\nkeyed by SHA256 hash)]
  UploadSvc -->|file metadata| MetaDB[(PostgreSQL\\nfiles + chunk index)]
  MetaDB -->|notify| NotifSvc[Notification Service]
  NotifSvc -->|WebSocket/poll| OtherDevices[Other Devices]
  OtherDevices -->|download changed chunks| DownloadSvc[Download Service]
  DownloadSvc -->|presigned URL| ChunkStore`,
    asciiDiagram: `UPLOAD (chunked + dedup):
  Client splits file into 4MB chunks
  For each chunk:
    SHA256 hash → check if exists in S3 (skip if yes = dedup)
    PUT chunk to S3 keyed by hash
  POST metadata → PostgreSQL: {file_id, name, [chunk_hash_1, chunk_hash_2, ...]}

SYNC:
  Change event ──► Notification Service ──► WebSocket push to other devices
  Device ──► GET /delta?cursor=X ──► list of changed file_ids
  Device ──► download only changed chunks (delta sync)

SHARING:
  POST /share {file_id, email, permission} → ACL table → share token`,
    studyNotes: `## Alex Xu Vol 1, Chapter 15 — Google Drive

### Chunked Upload
- Split large files into 4MB chunks
- Each chunk identified by SHA-256 hash
- Benefits: resume interrupted uploads, cross-user deduplication
- Same chunk stored once even if uploaded by millions of users

### Delta Sync Protocol
- Client maintains a local sync cursor (last sync timestamp)
- On reconnect: GET /changes?since={cursor} → server returns changed file_ids
- Client downloads only changed chunks, not full files
- Saves bandwidth on large files with small edits

### Conflict Resolution
- Alex Xu recommends: last-write-wins (simpler)
- Alternative: create conflict copy (Dropbox approach — user sees both versions)
- Prevention: lock file during edit (Google Docs approach — real-time collaboration)

### Storage Architecture
- Chunks: S3 (content-addressed by SHA256)
- File metadata: PostgreSQL (files, file_versions, chunks tables)
- Chunk index: PostgreSQL array column or separate chunk_mappings table
- File versions: each save = new version row pointing to chunk list

### Key Estimates
- 50M users, 10M DAU
- Average file: 500KB → 2 chunks
- 10M users × 2 uploads/day = 20M chunk writes/day
- 10B chunks × 500KB avg = 5PB storage
- Dedup saves ~30% (common files like node_modules, .git)

### Notification Service
- WebSocket for active clients (immediate sync)
- Long polling fallback for firewalled clients
- Notification: {file_id, version, change_type: created|modified|deleted}`,
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
    mermaidDiagram: `graph LR
  User -->|DNS query| GeoDNS[GeoDNS\\nAnycast BGP]
  GeoDNS -->|nearest PoP IP| User
  User -->|GET /asset.jpg| PoP[Edge PoP\\nL1 Cache]
  PoP -->|HIT| User
  PoP -->|MISS| Regional[Regional Hub\\nL2 Cache]
  Regional -->|MISS| Origin[Origin Server\\nS3 / Web Server]
  Origin -->|content + Cache-Control| Regional
  Regional --> PoP
  PoP --> User
  Admin -->|POST /purge| PurgeAPI[Purge API]
  PurgeAPI -->|invalidate| PoP`,
    asciiDiagram: `User ──DNS──► GeoDNS (Anycast) ──► nearest PoP IP

User ──GET /asset──► Edge PoP (L1 Cache, city)
                         │
                   Cache HIT ──► User (< 20ms)
                         │
                   Cache MISS
                         │
                   Regional Hub (L2 Cache, continent)
                         │
                   Cache MISS
                         │
                   Origin Server (S3 / web)
                         │
                   ◄─────┘ (store in L2, L1, serve user)

Cache-Control: max-age=86400
Invalidation: URL versioning | API purge`,
    studyNotes: `## CDN Design (Alex Xu Vol 1, Chapter 1 + System Design concepts)

### Why CDN
- User in Tokyo requesting server in New York: ~150ms RTT
- With CDN edge in Tokyo: ~5ms
- 80% of performance improvement: reduce distance to static assets

### Routing Mechanism
- **Anycast**: same IP announced by all PoPs via BGP — packets naturally routed to nearest PoP
- **GeoDNS**: DNS returns different IPs based on user's geo-IP
- **Hybrid**: Anycast for routing + GeoDNS for load balancing between PoPs

### Cache Invalidation Strategies (ranked by complexity)
1. **Wait for TTL**: simple, stale up to TTL (e.g., 24h)
2. **URL versioning**: /app.v3.js — new deploy = new URL, instant for users
3. **API purge**: POST /purge {urls:[...]} — CDN invalidates across all PoPs (propagates in ~60s)
4. **Surrogate keys**: tag assets, purge by tag

### What to Cache
- ✅ Static: images, CSS, JS, fonts, videos
- ✅ Semi-static: API responses with short TTL (60s)
- ❌ Dynamic: user-specific content, authenticated pages, real-time data

### Tiered Caching (Alex Xu Vol 1)
- L1 (city) → L2 (region) → Origin
- L1 miss → L2 (fast, same region)
- L2 miss → Origin (slow, cross-region)
- Reduces origin load by 90%+`,
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
    mermaidDiagram: `graph LR
  App[App Server] -->|1. cache check| Redis[(Redis Cluster)]
  Redis -->|2a. HIT| App
  Redis -->|2b. MISS| DB[(Database)]
  DB -->|3. data| App
  App -->|4. SET key val EX 3600| Redis
  subgraph eviction["Redis Cluster (16384 hash slots)"]
    M1[Master 1\\nSlots 0-5460]
    M2[Master 2\\nSlots 5461-10922]
    M3[Master 3\\nSlots 10923-16383]
    M1 --- R1[Replica 1]
    M2 --- R2[Replica 2]
    M3 --- R3[Replica 3]
  end`,
    asciiDiagram: `Cache-Aside (Lazy Loading):
  App ──► Redis ──HIT──► App ──► Client
              └──MISS──► DB ──► App ──► Redis (populate) ──► Client

Write-Through:
  App ──► Redis (write) ──► DB (write) ──► Client
       (both updated synchronously)

Write-Behind (Write-Back):
  App ──► Redis (write, async) ──► Client (fast response)
  Redis ──[async]──► DB (eventual flush)

Hot Key Problem:
  "celebrity:123" → 1M req/sec to same Redis slot
  Solution: celebrity:123:shard_1 ... celebrity:123:shard_10
            client picks random shard → spread load`,
    studyNotes: `## Alex Xu Vol 1, Chapter 1 + Distributed Cache Concepts

### Cache Strategies Compared

**Cache-Aside** (most common)
- App manages cache explicitly
- Cold start: first request always misses
- Resilient: if Redis dies, app still works (hits DB)

**Write-Through**
- Writes go to cache AND DB synchronously
- Cache always consistent with DB
- Adds write latency; fills cache with data that may never be read

**Write-Behind**
- Write to cache, async persist to DB
- Best write performance
- Risk: data loss if cache fails before flush

### Cache Stampede (Thundering Herd)
- Problem: hot key TTL expires, thousands of requests all miss simultaneously, all query DB
- Solutions:
  1. **Mutex lock**: first request fetches; others wait and reuse result (Redis SETNX)
  2. **Probabilistic early expiration**: randomly refresh key before TTL expires
  3. **Background refresh**: async process refreshes before TTL; serve slightly stale

### Redis Cluster Internals
- 16384 hash slots assigned across masters
- CLUSTER KEYSLOT key → compute slot = CRC16(key) % 16384
- Cross-slot operations not supported (use hash tags: {user_id}.session)
- Failover: Sentinel or Redis Cluster automatic leader election (~30s)

### Eviction Policies
- allkeys-lru: best general-purpose (evict LRU key from all keys)
- volatile-lru: only evict keys with TTL set
- allkeys-lfu: evict least frequently used (better for popularity skew)
- noeviction: return error when full (use for durable data)`,
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
    mermaidDiagram: `graph LR
  P1[Producer 1] -->|key-based routing| B1[Broker 1\\nLeader: P0, P2]
  P2[Producer 2] -->|round-robin| B2[Broker 2\\nLeader: P1, P3]
  B1 -->|replicate ISR| B2
  B1 -->|replicate ISR| B3[Broker 3\\nReplica]
  B2 -->|replicate ISR| B3
  B3 -->|replicate ISR| B1
  CG1[Consumer Group A] -->|poll P0| B1
  CG1 -->|poll P1| B2
  CG2[Consumer Group B] -->|poll P0,P1| B1
  ZK[ZooKeeper / KRaft] -.->|leader election| B1`,
    asciiDiagram: `Topic: orders (4 partitions, replication factor 3)

  Partition 0: [msg1][msg2][msg3]...  → Broker 1 (leader), Broker 2 (follower), Broker 3 (follower)
  Partition 1: [msg1][msg2][msg3]...  → Broker 2 (leader), Broker 1 (follower), Broker 3 (follower)
  Partition 2: [msg1][msg2][msg3]...  → Broker 3 (leader), Broker 1 (follower), Broker 2 (follower)
  Partition 3: [msg1][msg2][msg3]...  → Broker 1 (leader), Broker 2 (follower), Broker 3 (follower)

Consumer Group A (4 consumers): each owns 1 partition → max parallelism
Consumer Group B (2 consumers): each owns 2 partitions
Consumer Group C (5 consumers): 1 consumer idle (can't exceed partition count)

Offset committed to: __consumer_offsets topic
Delivery guarantee: at-least-once (process then commit offset)`,
    studyNotes: `## Alex Xu Vol 2, Chapter 4 — Distributed Message Queue

### Core Guarantees
- **At-least-once delivery**: consumer commits offset after processing; crash before commit = reprocess
- **Exactly-once**: requires idempotent consumer + transactional producer (expensive)
- **Ordering**: guaranteed within a partition (use same key for ordered messages)

### Write Performance (why Kafka is fast)
1. **Sequential disk writes**: append-only log → SSD handles 500MB/s+
2. **Zero-copy**: sendfile() syscall → data goes kernel buffer → NIC without user-space copy
3. **Batching**: producer batches records (linger.ms=5, batch.size=16KB)
4. **Compression**: snappy/lz4 per batch

### Replication
- ISR (In-Sync Replicas): replicas that are caught up within replica.lag.time.max.ms
- acks=all: producer waits for all ISR to confirm → no data loss
- acks=1: only leader confirms → fast but risk of loss if leader crashes before replication
- acks=0: fire and forget → fastest, may lose messages

### Partition Count Decisions
- More partitions = more parallelism (one consumer per partition max)
- Too many partitions: more files, more leader elections, more memory
- Rule: partitions = max(target throughput / producer throughput, target throughput / consumer throughput)

### Retention
- Time-based: log.retention.hours=168 (7 days default)
- Size-based: log.retention.bytes=1073741824
- Log compaction: for changelog topics — keep only latest value per key (unlimited retention)

### When to use vs alternatives
- Kafka: high throughput, replay, multiple consumers, durable
- RabbitMQ: complex routing, priority queues, per-message ack
- SQS: managed, simple queuing, AWS ecosystem`,
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
    mermaidDiagram: `graph LR
  Trigger[Event Source] -->|POST /notify| API[Notification API]
  API -->|validate + check prefs| PrefDB[(User Prefs\\nMySQL)]
  API -->|rate limit check| Redis[(Redis\\nSlidingWindow)]
  API --> Kafka[Kafka]
  Kafka -->|notifications.push| PushWorker[Push Worker]
  Kafka -->|notifications.email| EmailWorker[Email Worker]
  Kafka -->|notifications.sms| SMSWorker[SMS Worker]
  PushWorker -->|APNs| iOS[iOS Device]
  PushWorker -->|FCM| Android[Android Device]
  EmailWorker -->|SMTP API| SendGrid[SendGrid / SES]
  SMSWorker -->|REST API| Twilio[Twilio]
  PushWorker -->|on failure| DLQ[Dead Letter Queue]`,
    asciiDiagram: `Trigger (order placed, like, mention)
    │
    ▼
Notification Service
    ├── Check user preferences (push=on, email=off, quiet_hours)
    ├── Rate limit check (Redis sliding window)
    └── Publish to Kafka by channel
              │
    ┌─────────┴──────────┬──────────────┐
    ▼                    ▼              ▼
Push Worker         Email Worker    SMS Worker
(consume Kafka)     (consume Kafka) (consume Kafka)
    │                    │              │
    ├── render template   │              │
    ├── call APNs/FCM     │              │
    └── retry on fail     │              │
              │           │              │
          [3 retries with exponential backoff]
              │
          Dead Letter Queue (alert ops, manual replay)`,
    studyNotes: `## Alex Xu Vol 1, Chapter 10 — Notification System

### Channel Architecture
Each channel is independent — separate Kafka topics, separate worker pools:
- Push: APNs (iOS), FCM (Android) — requires device token stored per user
- Email: SendGrid/SES — HTML + plain text variants
- SMS: Twilio — charged per message, use sparingly

### User Preferences
- Stored in DB: {user_id, channel, enabled, quiet_hours_start, quiet_hours_end, locale}
- Cached in Redis (TTL 1h) — preferences rarely change
- Check BEFORE enqueuing to avoid unnecessary processing

### Rate Limiting (Alex Xu's limits)
- Push: 10/hour per user
- Email: 5/day per user
- SMS: 3/day per user
- Implementation: Redis sliding window counter with EXPIRE

### Retry Strategy
- Exponential backoff: 1s, 2s, 4s (3 attempts)
- After 3 failures → Dead Letter Queue (Kafka topic)
- DLQ monitoring: alert on size > threshold; manual replay tool
- Idempotency: store notification_id, skip if already sent

### Template Engine
- Templates in DB: {id, channel, locale, subject, body_html, body_text}
- Variable substitution: {{user.name}}, {{product.title}}
- Localization: same template_id with different locale variants

### Delivery Tracking
- Each send event → analytics Kafka topic
- Metrics: sent, delivered (device ack), opened (pixel/link), clicked
- Delivery receipts: FCM and APNs return delivery status callbacks`,
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
    mermaidDiagram: `graph LR
  User -->|keystrokes| Browser[Browser]
  Browser -->|GET /autocomplete?q=des| CDN[CDN Edge Cache]
  CDN -->|miss| API[Autocomplete API]
  API -->|HGET prefix| Redis[(Redis\\nprefix→top5 JSON)]
  Redis -->|hit| API
  Redis -->|miss| Trie[Trie Service]
  Trie --> API
  API --> CDN --> Browser
  SearchLogger[Search Logger] -->|every query| Kafka[Kafka]
  Kafka --> Flink[Flink Aggregator]
  Flink -->|hourly rebuild| Redis
  Flink -->|weekly full rebuild| Trie`,
    asciiDiagram: `Query Path (< 100ms):
  User types "des"
    │
  GET /autocomplete?q=des&locale=en
    │
  CDN (cache popular prefixes, TTL=60s)
    │
  Redis: HGET autocomplete:des → ["design twitter","design uber","desktop"]
    │ (cache miss)
  Trie Service: walk to node "d"→"e"→"s", return cached top-5
    │
  Response: ["design twitter", "design uber", "designer", "desktop", "dessert"]

Data Pipeline (async, eventual):
  User searches "system design" ──► Kafka ──► Flink ──► aggregate counts
  Every hour: update Redis scores
  Every week: full Trie rebuild from 7-day query log`,
    studyNotes: `## Alex Xu Vol 1, Chapter 13 — Search Autocomplete

### Trie Data Structure
- Each node = one character, stores: character, children map, top-N suggestions cache
- Top-N cached at every node (avoid traversing whole subtree on query)
- Space: ~10GB for English queries (manageable in memory)
- Query complexity: O(prefix_length) after reaching prefix node

### At Scale: Replace Trie with Redis
- Redis HASH: key = prefix, field = query, value = score
- ZREVRANGEBYSCORE autocomplete:{prefix} +inf -inf LIMIT 0 5
- Sharded by first letter(s): autocomplete:a → shard 0, autocomplete:b → shard 1

### Ranking Formula
- score = weekly_search_count × recency_multiplier × quality_score
- Collect via: every search → log → Kafka → Flink window aggregation
- Update Redis scores hourly

### Personalization (Alex Xu)
- User's recent searches: Redis LIST (last 20 queries, RPUSH + LTRIM)
- Blend: 70% global top-5 + 30% user's recent matching prefix
- Merge at read time (server-side blend)

### Filtering
- Blocklist: Bloom filter of banned terms (O(1) check, probabilistic)
- False positive OK: occasionally hides valid query
- False negative not OK: never show banned term

### CDN Caching
- Short TTL (60s) for popular prefixes — 80% of queries are top-1000 prefixes
- Reduces autocomplete server QPS by 60%+

### Numbers
- Google: 5B searches/day, 10% unique prefixes = 500M prefix events/day
- Autocomplete: ~10 keystrokes per search → 50B autocomplete requests/day`,
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
    mermaidDiagram: `graph LR
  UA[User A\\nDevice] -->|WebSocket| CS1[Chat Server 1]
  UB[User B\\nDevice] -->|WebSocket| CS2[Chat Server 2]
  CS1 -->|PUBLISH user:B:inbox| Redis[Redis Pub/Sub\\nor Kafka]
  Redis -->|SUBSCRIBE user:B:inbox| CS2
  CS2 -->|push msg| UB
  CS1 --> Cassandra[(Cassandra\\nMessages)]
  CS2 --> Cassandra
  ServiceDisc[ZooKeeper\\nService Discovery] -.->|which server for user| CS1
  CS1 <-->|heartbeat TTL 60s| PresenceRedis[(Redis\\nPresence Store)]`,
    asciiDiagram: `Connection Layer:
  User A ──WebSocket──► Chat Server 1 (stateful, holds WS connections)
  User B ──WebSocket──► Chat Server 2

Message Routing (A → B, different servers):
  Chat Server 1 ──PUBLISH channel:user_B──► Redis Pub/Sub
                                                │
                              ◄──SUBSCRIBE───────┘
                          Chat Server 2 ──WebSocket──► User B

Message Storage:
  Cassandra table: messages
  PK: (conversation_id, message_id [TimeUUID])
  ORDER BY: message_id DESC
  TTL: configurable (30 days default)

Offline Delivery:
  User B offline → store in Redis queue or DB
  On reconnect → fetch unread since last_seen_at from Cassandra

Group Chat (large groups > 500 members):
  Fan-out on read: members poll conversation from Cassandra
  Avoids N×write fan-out for large groups`,
    studyNotes: `## Alex Xu Vol 1, Chapter 12 — Chat System

### WebSocket vs HTTP Polling
- HTTP Long Polling: client keeps connection open, server responds when data arrives
- WebSocket: bidirectional, persistent, low overhead
- SSE (Server-Sent Events): server → client only
- Chat needs bidirectional → WebSocket

### Inter-Server Message Routing
- Problem: User A on Server 1, User B on Server 2
- Solution A: Redis Pub/Sub (each server subscribes to channels for its connected users)
- Solution B: Kafka topics per user (durable, replayable)
- Alex Xu recommends: Redis Pub/Sub for small-medium scale; Kafka for large scale

### Service Discovery
- ZooKeeper: each chat server registers itself
- Client connects → service discovery → assigned chat server
- On reconnect: may get different server (stateless message routing helps)

### Message Storage (Cassandra)
- Why Cassandra: append-only writes, time-series access pattern, massive scale
- Primary key: (conversation_id) + clustering by message_id (TimeUUID)
- Querying: LIMIT 20 ORDER BY message_id DESC → paginated history
- Index: user_id → conversation_ids (separate table)

### Delivery Receipts
- Sent ✓: message stored in Cassandra
- Delivered ✓✓: recipient's device ACKs via WebSocket
- Read ✓✓ (blue): user opened conversation → READ event sent
- Implementation: message status field + event flow

### Group Chat Scaling
- Small groups (< 100): fan-out on write to all member feeds
- Large groups (> 500): fan-out on read — members pull from conversation
- Trade-off: write amplification vs read latency

### Presence System
- Client: heartbeat every 30s → Redis SET user:{id}:presence timestamp EX 60
- Query: HGET → if TTL expired = offline
- At scale: maintain presence in dedicated service, propagate to friends via pub/sub`,
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
    mermaidDiagram: `graph LR
  Driver[Driver App] -->|POST /location\\nevery 4 seconds| LB[Load Balancer]
  LB --> LocSvc[Location Service]
  LocSvc -->|GEOADD drivers lng lat driver_id| GeoRedis[(Redis GEO\\nCurrent Positions)]
  LocSvc -->|event| Kafka[Kafka\\ndriver.location]
  Kafka --> Analytics[Analytics / ML\\nRoute History]
  Kafka --> S3[(S3\\nLocation History)]
  Rider[Rider App] -->|WebSocket| LocSvc
  LocSvc -->|GEORADIUS 5km| GeoRedis
  GeoRedis -->|nearby drivers| LocSvc
  LocSvc -->|push update| Rider`,
    asciiDiagram: `WRITE (Driver → System):
  Driver App
    │  POST /location {lat, lng} every 4s
    ▼
  Location Service (stateless, many instances)
    ├──► Redis GEO: GEOADD drivers {lng} {lat} {driver_id}
    │    (overwrites previous position for this driver_id)
    └──► Kafka: driver.location topic (for analytics, history, ML)

READ (Rider sees nearby drivers):
  Rider App
    │  WebSocket or GET /drivers/nearby?lat=&lng=&radius=5km
    ▼
  Location Service
    └──► Redis: GEORADIUS drivers {lng} {lat} 5 km COUNT 10 ASC
               → returns 10 nearest driver_ids with distances

ACTIVE RIDE (real-time tracking):
  Driver location update ──► Location Service
    └──► lookup active ride ──► push update to Rider's WebSocket`,
    studyNotes: `## Alex Xu Vol 2, Chapter 2 — Nearby Friends / Location Tracking

### Scale
- 1M active drivers × 1 update/4s = 250,000 writes/second
- Redis GEO handles this with horizontal sharding by city/region

### Redis GEO Internals
- GEOADD: stores coordinates as geohash in a sorted set
- GEORADIUS: finds all points within radius (efficient with geohash proximity)
- Accuracy: ±0.6% of distance
- GEOADD overwrites position for existing member → always current location

### Why Redis over DB
- 250K writes/sec → PostgreSQL would need massive sharding
- Redis GEO: sub-millisecond reads, in-memory sorted set
- Location is ephemeral — no need for durable storage of current position
- Historical locations → Kafka → S3 (cold storage, analytics)

### Proximity Search Alternatives
- **Geohash**: encode coordinates as string prefix → nearby = similar prefix
- **Redis GEO**: uses geohash internally
- **QuadTree**: spatial indexing tree, good for static points (Yelp / Alex Xu Vol 2 Ch 1)
- **H3 (Uber)**: hexagonal hierarchical spatial index

### Geohash vs QuadTree (Alex Xu Vol 2)
- Geohash: simpler, easy to cache prefix-based results
- QuadTree: dynamic, better for sparse datasets, more complex
- Uber uses H3 for driver-to-rider matching

### Active Ride Architecture
- Websocket connection from rider → location service
- Location service subscribes to driver's location stream
- Push updates every 4s or on significant movement (> 10m)`,
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
    mermaidDiagram: `graph LR
  Client -->|API Request| MW[Rate Limiter Middleware]
  MW -->|Lua atomic check+incr| Redis[(Redis\\nSliding Window Counter)]
  Redis -->|count le limit| API[Backend API Server]
  Redis -->|count gt limit| R429[429 Too Many Requests]
  API -->|response| Client
  MW -->|X-RateLimit-Limit\\nX-RateLimit-Remaining\\nX-RateLimit-Reset| Client`,
    asciiDiagram: `Sliding Window Counter (recommended):

  current_time = 1700000061
  window_size  = 60s, limit = 100 req/min

  Redis keys:
    rate:{user}:1700000000 → 80  (prev window)
    rate:{user}:1700000060 → 30  (current window)

  overlap_ratio = (60 - 1) / 60 = 0.983
  estimate = 80 × 0.983 + 30 = 108.6  → REJECT (> 100)

Token Bucket:
  [●●●●●●●●●●] capacity=10 tokens
  Refill: +1/sec  |  Request: consume 1 token
  Burst allowed up to capacity; else 429`,
    studyNotes: `## Alex Xu Vol 1, Chapter 4 — Rate Limiter

### Algorithms Compared

**Token Bucket** — allows controlled bursts; used by Stripe, Amazon
**Leaking Bucket** — smooth output rate; good for payment processing
**Fixed Window** — simple; burst at boundary flaw
**Sliding Window Log** — accurate; high memory (O(req/window) per user)
**Sliding Window Counter** — recommended: memory-efficient, accurate within 0.1%

### Distributed Implementation
- All app servers share one Redis cluster
- Lua script: atomic INCR + TTL check (prevents race condition)
- If Redis fails: fail open (allow) or fail closed (deny) — choose based on risk

### Required Response Headers (Alex Xu)
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000120
Retry-After: 59 (on 429)

### Hard vs Soft Throttling
- Hard: requests above limit strictly rejected
- Soft: allow 10% overage (marketing campaigns, burst forgiveness)

### Rate Limit Tiers
- IP-based: unauthenticated endpoints, abuse prevention
- User/API key: per-customer quotas
- Endpoint: expensive endpoints (AI, exports) get tighter limits
- Global: protect backend regardless of source`,
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
    mermaidDiagram: `graph LR
  Clients --> VIP[Virtual IP / Anycast]
  VIP --> LBA[LB Active\\nLayer 7 / TLS termination]
  VIP -.->|VRRP failover| LBP[LB Passive\\nStandby]
  LBA -->|Round Robin| B1[Backend 1]
  LBA --> B2[Backend 2]
  LBA --> B3[Backend 3]
  LBA -.->|removed: unhealthy| B4[Backend 4]
  LBA -->|GET /health every 5s| B1
  LBA -->|GET /health every 5s| B2`,
    asciiDiagram: `Clients ──► Virtual IP (Anycast / keepalived)
                  │
        ┌─────────┴──────────────────────┐
        │   Active Load Balancer (L7)    │
        │   TLS termination              │
        │   Cookie / header inspection   │
        └──────┬────────────────────────┘
               │  Active-Passive HA via VRRP
        ┌──────┴──────┐
        │  Algorithms │  Round Robin | Least Conn | IP Hash | Consistent Hash
        └──────┬──────┘
    ┌──────────┼──────────┐
    ▼          ▼          ▼
 Backend1   Backend2   Backend3   (Backend4 REMOVED — health check failed)
 /health✓   /health✓   /health✓`,
    studyNotes: `## Load Balancer Design

### L4 vs L7
- L4: IP+port routing, no HTTP inspection, lower CPU, faster
- L7: reads HTTP headers/URL/cookies, content-based routing, A/B testing, canary

### Algorithm Selection
- Round Robin: equal-capacity servers, stateless requests
- Least Connections: long-lived connections (WebSocket, streaming)
- IP Hash: legacy stateful apps (prefer Redis-backed sessions instead)
- Consistent Hashing: cache affinity, minimize reshuffling on scale events

### Sticky Sessions
- Cookie-based: LB injects Set-Cookie: LB_SERVER=backend3
- Better approach: move session state to Redis → all backends are stateless → no stickiness needed

### TLS Termination
- Certificate lives on LB; backend traffic is plain HTTP (internal network)
- Benefits: centralised cert management, offload crypto from backends
- mTLS option: re-encrypt traffic to backends (zero-trust)

### High Availability
- Active-Passive (keepalived + VRRP): VIP floats to standby on failure (<1s)
- Active-Active (DNS round-robin): both handle traffic; DNS TTL=30s for fast failover
- Anycast (BGP): same /32 IP from multiple PoPs; nearest PoP serves traffic`,
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
    mermaidDiagram: `stateDiagram-v2
  [*] --> Closed
  Closed --> Closed : request OK / failure rate < 50%
  Closed --> Open : failure rate >= 50% in 60s window
  Open --> Open : fail fast, return fallback
  Open --> HalfOpen : wait timeout (30s)
  HalfOpen --> Closed : probe succeeds
  HalfOpen --> Open : probe fails`,
    asciiDiagram: `           failure rate > 50%
  ┌──────────┐  (min 10 calls)   ┌──────────┐
  │  CLOSED  │ ────────────────► │   OPEN   │
  │ (normal) │                   │fail fast │
  └──────────┘                   └──────────┘
       ▲                              │
       │ probe success       timeout  │ (30s)
       │                    ┌─────────┘
       │             ┌──────┴──────┐
       └─────────────│  HALF-OPEN  │
                     │  1 probe req│
                     └─────────────┘
                      probe fails → back to OPEN

Fallback options (in order of preference):
  1. Stale cached response
  2. Default / empty response
  3. Alternative service
  4. Fail fast with clear error`,
    studyNotes: `## Circuit Breaker Pattern

### Why It Matters
Without CB: Service A waits for slow Service B → A threads exhaust → A fails → cascade
With CB: after threshold, A fails instantly → returns fallback → threads freed → A stays healthy

### Three States
- **Closed**: normal; track failures in sliding window
- **Open**: all requests rejected immediately; return fallback; wait for timeout
- **Half-Open**: allow N probe requests; enough success → Closed; any fail → Open

### Key Config (Resilience4j defaults)
- failureRateThreshold: 50%
- minimumNumberOfCalls: 10 (don't trip on first call)
- slidingWindowSize: 10 calls (or time-based: 60s)
- waitDurationInOpenState: 60s
- permittedCallsInHalfOpenState: 5

### Bulkhead Pattern (companion)
- Limit concurrent calls to a dependency (e.g., max 10 threads for Service B)
- Prevents B's slowness from consuming all of A's thread pool
- Isolate failures like ship compartments

### Slow Call Handling
- CB can also open on slow calls (not just errors)
- slowCallDurationThreshold: 2000ms
- slowCallRateThreshold: 50% of calls slower than threshold → trip

### Libraries
- Java: Resilience4j (modern), Hystrix (Netflix, deprecated)
- Go: gobreaker (sony)
- Node.js: opossum
- .NET: Polly`,
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
    mermaidDiagram: `graph LR
  Seed[Seed URLs] --> Frontier[URL Frontier\\nPriority Queue]
  Frontier --> Scheduler[Domain Scheduler\\npoliteness enforcement]
  Scheduler --> Fetcher[HTTP Fetcher\\n100 workers]
  Fetcher --> RobotsCache[robots.txt Cache\\nRedis]
  Fetcher -->|HTML| Parser[HTML Parser]
  Parser -->|links| Dedup[URL Dedup\\nBloom Filter]
  Dedup -->|new| Frontier
  Parser -->|content| S3[S3 Raw HTML]
  S3 --> Indexer[Elasticsearch\\nIndexer]`,
    asciiDiagram: `URL Frontier (two-level):
  Front queues (priority by PageRank / freshness):
    [High]   news.ycombinator.com, github.com
    [Medium] medium.com, stackoverflow.com
    [Low]    random blogs

  Back queues (per-domain FIFO + crawl-delay):
    github.com:   [url1, url2, url3]  ← min 1s between requests
    medium.com:   [url1]
    example.com:  [url1, url2]

Dedup pipeline:
  URL → canonicalize (lowercase, strip tracking params)
      → Bloom filter check (5MB for 1B URLs, probabilistic)
      → Redis SET confirmed check (exact, slower)

Content dedup:
  HTML → SimHash (64-bit fingerprint) → Hamming distance < 3 → near-duplicate → skip`,
    studyNotes: `## Alex Xu Vol 1, Chapter 9 — Web Crawler

### URL Frontier (Alex Xu's two-level design)
1. Front queues: prioritized by importance (PageRank, update frequency, domain authority)
2. Back queues: one FIFO per domain, ensures politeness
3. Selector: picks from front queues by weight → routes to domain's back queue
4. Worker: pulls URL from back queue, enforces crawl-delay, fetches page

### Politeness Rules
- robots.txt: fetch and cache per domain (Redis TTL 24h)
- Crawl-Delay directive in robots.txt: honor minimum wait
- Identify yourself: User-Agent: "MyBot/1.0 (+http://mybot.example.com)"
- Never crawl Disallow paths

### Deduplication Strategy
- URL dedup: Bloom filter (fast, small, ~0.1% false positive rate)
- Canonicalize first: lowercase host, remove default ports, sort query params, resolve relative URLs
- Content dedup: SimHash of page text shingles → 64-bit fingerprint
  - Hamming distance < 3 → near-duplicate → skip indexing

### Storage Pipeline
- Raw HTML → S3 (gzip compressed, ~70KB avg per page)
- Extracted links → Kafka → URL Frontier workers
- Structured content → Elasticsearch (for search index)
- Link graph → graph DB (Neo4j / custom) for PageRank computation

### Scale (Alex Xu estimates)
- 1B pages, avg 500KB uncompressed → 500TB
- Compressed ~100KB avg → 100TB
- 10K pages/sec → 864M/day
- DNS resolution bottleneck: cache aggressively, distribute DNS resolvers

### BFS vs Priority
- Pure BFS: discovers linked-from-many pages faster (good)
- Priority BFS: weight URLs by estimated quality → crawl important pages first`,
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
    mermaidDiagram: `graph LR
  Client -->|PUT /bucket/key| GW[API Gateway\\nAuth + Routing]
  GW --> Meta[Metadata Service\\nPostgreSQL]
  GW --> DataSvc[Data Service]
  DataSvc -->|Erasure Code RS 6+3\\nshard 1| DN1[Data Node AZ-1]
  DataSvc -->|shard 2| DN2[Data Node AZ-2]
  DataSvc -->|shard 3| DN3[Data Node AZ-3]
  Client -->|GET /bucket/key| GW
  GW -->|lookup location| Meta
  Meta -->|node list| GW
  GW -->|parallel fetch 6 shards| DataSvc`,
    asciiDiagram: `Object Upload (PUT /bucket/photos/cat.jpg):
  Client ──► API Gateway (auth, route)
                  ├──► Metadata Service (PostgreSQL)
                  │    stores: bucket+key → object_id → shard locations
                  └──► Data Service
                            │
               Erasure Coding RS(6,3):
               split into 6 data + 3 parity = 9 shards
                  ├── shard 1 → Node A (AZ-1)
                  ├── shard 2 → Node B (AZ-1)
                  ├── shard 3 → Node C (AZ-2)
                  ├── shard 4 → Node D (AZ-2)
                  ├── shard 5 → Node E (AZ-3)
                  ├── shard 6 → Node F (AZ-3)
                  ├── parity P1 → Node G
                  ├── parity P2 → Node H
                  └── parity P3 → Node I
               Survive loss of ANY 3 nodes → reconstruct from remaining 6

Multipart Upload (>5MB files):
  InitiateMultipartUpload → upload_id
  PUT part 1 (5MB) → ETag1
  PUT part 2 (5MB) → ETag2
  CompleteMultipartUpload [ETag1, ETag2] → object assembled`,
    studyNotes: `## Alex Xu Vol 2, Chapter 9 — Object Storage

### Key Concepts

**Object vs Block vs File Storage**
- Object: flat key-value, HTTP API, immutable, unlimited scale → S3
- Block: raw device, low latency, mutable → EBS (used by databases)
- File: hierarchical, mountable → EFS, NFS

**Data Path vs Metadata Path**
- Metadata: bucket + key → object_id → shard locations (PostgreSQL, strongly consistent)
- Data: actual bytes stored across data nodes (erasure coded)

### Erasure Coding RS(6,3)
- Split object into 6 data chunks + compute 3 parity chunks = 9 total
- Store each chunk on a different node (different AZ ideally)
- Can reconstruct from ANY 6 of 9 chunks → tolerate 3 node failures
- Storage overhead: 9/6 = 1.5× (vs 3× for triple replication)
- CPU cost: encoding on write, decoding on degraded read

### Durability
- S3: 99.999999999% (11 nines) durability
- Background scrubbing: read all objects, verify checksums, repair if corrupted
- Cross-region replication: replicate to second region for disaster recovery

### Multipart Upload
- Parts ≥ 5MB (except last)
- Each part has MD5 ETag for integrity
- Parts uploaded in parallel → fast for large files
- Resume: if part fails, retry only that part
- Abort: clean up partial parts after timeout

### Lifecycle Policies
- Standard → Standard-IA (30d) → Glacier (90d) → Deep Archive (180d) → Delete
- Saves 70%+ on storage cost for old data`,
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
    mermaidDiagram: `graph LR
  Client -->|POST /index/_doc| Coord[Coordinator Node]
  Coord -->|shard = hash mod N| Primary[Primary Shard]
  Primary -->|tokenize + index| Segment[Lucene Segments\\nInverted Index]
  Primary -->|replicate| Replica[Replica Shards]
  SearchClient -->|GET /_search| Coord
  Coord -->|scatter to all shards| Primary
  Coord -->|scatter| Replica
  Primary -->|local top-K| Coord
  Replica -->|local top-K| Coord
  Coord -->|merge + BM25 rank| SearchClient`,
    asciiDiagram: `Inverted Index (core structure):
  doc1: "system design interview"
  doc2: "design patterns for systems"

  Term       → Posting List
  "design"   → [doc1(pos:1, freq:1), doc2(pos:0, freq:1)]
  "system"   → [doc1(pos:0, freq:1), doc2(pos:3, freq:1)]
  "interview"→ [doc1(pos:2, freq:1)]

  Query "system design":
    intersect("system") ∩ intersect("design") → [doc1, doc2]
    BM25 score → doc1 ranked higher (shorter, exact phrase match)

Distributed (5 primary shards, 1 replica each):
  Write: Coordinator → Primary Shard (hash(doc_id) % 5) → replicate to replica
  Read:  Coordinator ──scatter──► all 5 primaries
                     ◄──gather── top-K per shard
                     merge + global sort → return top-10`,
    studyNotes: `## Elasticsearch / Distributed Search

### Indexing Pipeline (NRT)
1. Document → in-memory buffer (not yet searchable)
2. Refresh (every 1s default): buffer → in-memory Lucene segment → searchable
3. Flush (every 30min or 512MB): segments → fsync to disk (durable)
4. Segment merge: background process merges small segments → fewer, larger ones
5. Translog (WAL): written on every index op, replayed on crash recovery

### BM25 Scoring
- Improvement over TF-IDF:
  - TF saturation: term appearing 100× vs 10× doesn't score 10× higher
  - Length normalization: shorter doc with match scores higher than long doc
- Boost: title match (2×) > body match (1×) > tag match (0.5×)
- Recency boost: multiply score by freshness factor for news/social

### Sharding Strategy
- Shard count: set at index creation, cannot change (requires reindex)
- Target: 10–50GB per shard, < 200M docs per shard
- Too many shards: coordination overhead, memory per shard for metadata
- Rule of thumb: total_storage / 30GB = number of primary shards

### Mapping Types
- keyword: exact match, aggregations, sorting (stored as-is)
- text: full-text search (tokenized, analyzed, not sortable)
- date, long, geo_point: typed for range queries and geo search

### When to Use
- ✅ Full-text search with ranking
- ✅ Log analytics (ELK stack)
- ✅ Faceted search (filter by category + price range)
- ❌ Primary datastore (use with source-of-truth DB)
- ❌ ACID transactions needed (use PostgreSQL)`,
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
    mermaidDiagram: `graph LR
  Creator -->|upload| UploadSvc[Upload Service]
  UploadSvc -->|raw video| S3Raw[S3 Raw Storage]
  S3Raw --> Kafka[Kafka\\nvideo.uploaded]
  Kafka --> Transcoder[Transcoding Workers\\nFFmpeg]
  Transcoder -->|HLS 240p 480p 1080p| CDN[S3 + CloudFront CDN]
  Viewer -->|GET /feed| FeedAPI[Feed API]
  FeedAPI --> Rec[Recommendation Engine\\nFAISS ANN]
  Rec -->|ranked video_ids| FeedAPI
  Viewer -->|stream HLS| CDN
  Events[Watch events\\nlikes skips shares] --> Kafka2[Kafka]
  Kafka2 --> Flink[Flink\\nEmbedding Updates]
  Flink --> Rec`,
    asciiDiagram: `UPLOAD PIPELINE:
  Creator ──► S3 (raw) ──► Kafka ──► Transcoding Workers
                                           │
                              FFmpeg → HLS segments (2s each)
                              240p / 480p / 1080p variants
                                           │
                                    S3 + CloudFront CDN (immutable)

RECOMMENDATION (two-stage):
  Stage 1 — Retrieval:
    user_embedding (from watch history)
    FAISS ANN search → top-1000 candidate videos

  Stage 2 — Ranking:
    lightweight ML model → predict watch completion rate
    features: watch%, likes, shares, account relationship, recency
    → top-50 → serve

FEED SERVING:
  GET /feed?cursor=abc
    │
  Feed API → Redis (pre-computed feed) → [video_id_1, video_id_2, ...]
  While watching video N → prefetch metadata for N+1 and N+2
  HLS player: adaptive bitrate based on bandwidth (switches resolution mid-stream)`,
    studyNotes: `## Short Video Feed Design

### Video Upload Pipeline
1. Creator uploads → S3 (raw, any format)
2. Kafka event → triggers transcoding workers
3. FFmpeg: transcode to H.264, produce HLS segments (2s each)
4. Multiple renditions: 240p (mobile), 480p (standard), 1080p (WiFi)
5. HLS manifest (.m3u8) lists renditions → client picks based on bandwidth
6. Segments stored in S3, served via CloudFront (TTL=forever, immutable)

### Recommendation System
Two-stage pipeline (similar to YouTube, TikTok):

**Stage 1 — Candidate Retrieval** (fast, broad)
- User embedding = weighted sum of watched video embeddings
- FAISS ANN search: cosine similarity → top-1000 candidates in <10ms

**Stage 2 — Ranking** (slower, precise)
- Lightweight ML model (LightGBM or small NN)
- Features: predicted watch completion, like probability, share probability
- Negative signals: "not interested" clicks, fast skip
- Output: top-50 ranked videos

**Embedding Updates**
- Watch events → Kafka → Flink streaming → update user & video embeddings in real-time
- FAISS index rebuilt periodically (every few minutes) or updated incrementally

### Feed Serving
- Cursor-based pagination (stateful session, no repeated videos)
- Pre-generate next page while current plays (3-video lookahead)
- Redis cache: pre-computed feed per user (invalidated on new video from followed accounts)

### CDN for Video
- Segment size: 2s per HLS chunk (~500KB at 480p)
- Hot videos: 100% CDN cache hit (served from edge in <20ms)
- Long-tail: served from S3 directly or regional cache
- Pre-warms: predicted viral content pre-pushed to edge PoPs`,
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
    mermaidDiagram: `graph LR
  Client -->|PUT key,val| Coord[Coordinator\\nAny Node]
  Coord -->|CRC16 hash mod ring| Ring[Consistent Hash Ring]
  Ring --> N1[Node 1 Primary]
  N1 -->|replicate N=3| N2[Node 2 Replica]
  N1 -->|replicate N=3| N3[Node 3 Replica]
  N2 -.->|gossip| N3
  N3 -.->|gossip| N1
  Client2 -->|GET key| Coord2[Any Coordinator]
  Coord2 -->|quorum read R=2| N1
  Coord2 -->|quorum read R=2| N2
  Coord2 -->|return latest version| Client2`,
    asciiDiagram: `Consistent Hash Ring (N=3 replication):

         0°  Node A
        ╱
  270° ─┼─ 90°    key "user:123" hashes to 47°
        ╲          → assigned to Node A (primary)
        180°       → replicated to next 2 nodes: Node B, Node C
         Node B, Node C

Virtual nodes: each physical node = 150 vnodes → even distribution
On node add: only 1/N of keys migrate (not full rebalance)

Quorum (N=3):
  W=2, R=2 → W+R=4 > N=3 → strong consistency
  W=1, R=1 → eventual consistency (fast reads/writes, may read stale)
  W=3, R=1 → fast reads, slow writes (write-heavy: bad; read-heavy: good)

LSM Tree (write path):
  Write → WAL (durability) → MemTable (in-memory sorted)
  MemTable full → flush to SSTable (immutable, disk)
  Read → MemTable → newest SSTable → older SSTables (Bloom filter: skip non-existent keys)
  Compaction: merge SSTables, remove tombstones`,
    studyNotes: `## Alex Xu Vol 1, Chapter 6 — Key-Value Store

### Core Design Decisions

**Partitioning: Consistent Hashing**
- Hash ring (0 to 2^32 - 1)
- Each node placed at multiple positions (virtual nodes / vnodes)
- Key maps to first node clockwise from its hash position
- Adding a node: only keys between new node and its predecessor migrate

**Replication**
- Preference list: next N distinct physical nodes clockwise from key's position
- Place replicas in different AZs for fault tolerance
- Coordinator writes to all N in parallel, waits for W acks

**Tunable Consistency (CAP tradeoffs)**
- R + W > N → strong consistency (read-your-writes guaranteed)
- R + W <= N → eventual consistency (higher availability, lower latency)
- DynamoDB: eventual by default, optional strongly consistent reads (2× cost)

### Storage Engine: LSM Tree
1. Write → append to WAL (crash recovery)
2. Write → MemTable (in-memory, sorted by key, ~64MB)
3. MemTable full → flush to SSTable (disk, immutable, sorted)
4. Read: MemTable → newest SSTable → older SSTables (newest wins)
5. Bloom filter per SSTable: O(1) check if key might exist (skip SSTables)
6. Compaction: merge overlapping SSTables, remove deleted keys (tombstones)

### Conflict Resolution
- **Last-Write-Wins (LWW)**: use wall clock timestamp — simple but risks losing writes if clocks skew
- **Vector Clocks**: each write tagged with (node, counter) — detect concurrent writes, let client merge
- **CRDTs**: data types that merge automatically (counter, set, map) — no conflicts possible

### Failure Detection: Gossip Protocol
- Each node maintains membership list (node → heartbeat counter + timestamp)
- Every 1s: pick random peer, exchange lists, merge (take higher counter)
- Node marked suspicious if no heartbeat update in T seconds
- Phi Accrual: probabilistic suspicion score based on heartbeat interval distribution

### Anti-Entropy: Merkle Trees
- Divide key space into ranges, build hash tree of each range
- Two nodes compare Merkle root → if equal, keys are in sync → done
- If different, bisect and recurse → find exact diverged ranges in O(log n)
- Repair only diverged ranges (efficient for large key spaces)`,
  },
  {
    title: 'Design a Proximity Service',
    prompt:
      "Design a service like Yelp that returns nearby businesses given a user's location and search radius. The system must handle 100M DAU, support radii of 0.5–20 km, and return results with low latency.",
    difficulty: 'Medium',
    category: 'Location',
    tags: ['geohash', 'quadtree', 'redis', 'mysql', 'spatial-index'],
    modelAnswer: `## Proximity Service Design

### Requirements
- Functional: search nearby businesses by lat/long + radius (0.5, 1, 2, 5, 20 km); view business details; CRUD for business owners
- Non-functional: 100M DAU, 5K search QPS, low latency, high availability, eventual consistency for writes

### API
- GET /v1/search/nearby?lat=&long=&radius= → paginated business list
- GET /v1/businesses/{id} → business detail
- POST/PUT/DELETE /v1/businesses → owner CRUD (low volume)

### Core Algorithm: Geohash
Geohash recursively divides earth into a grid and encodes each cell as a base-32 string.
Each extra character = 32x finer resolution.

Radius to precision mapping:
- 0.5 km, 1 km → precision 6 (~1.2 km cells)
- 2 km, 5 km → precision 5 (~4.9 km cells)
- 20 km → precision 4 (~39 km cells)

Query steps:
1. Compute user's geohash at the target precision
2. Fetch all businesses in that cell from the index
3. Fetch 8 neighboring cells (fix boundary problem — adjacent points can have different hashes)
4. Filter by exact Haversine distance
5. Sort and paginate

Expand search: if too few results, remove last character (step up one precision level = 32x larger area).

### Storage
geohash_index table (MySQL):
- geohash VARCHAR(6) + business_id BIGINT → PRIMARY KEY
- ~1.7 GB total — fits in memory on a single server

business table (MySQL):
- business_id, name, lat, long, address, star_rating

Redis Cache:
- Key: "geohash:{hash}" → List<business_id>, TTL 24h
- Key: "business:{id}" → JSON object, TTL 24h
- Caches all 3 precision levels (4, 5, 6)

### Architecture
- Load Balancer → Location-Based Service (LBS, stateless) + Business Service
- LBS: Redis → MySQL replica on cache miss
- Business Service: writes to MySQL primary, triggers nightly batch to rebuild geohash index
- Multi-region deployment for latency and data residency

### Scale
- Read:Write = 100:1 → cache aggressively at geohash granularity (not raw lat/long)
- Geohash index (1.7 GB) fits in Redis — no DB sharding needed
- Nightly propagation of business edits acceptable (changes rarely need to be instant)

### Alternatives Considered
- Quadtree: in-memory tree, supports k-NN queries, harder to implement; 2-min startup to build from 200M records
- Google S2: Hilbert curve mapping, arbitrary polygons, used by Google/Uber; most powerful but hardest to explain`,
    mermaidDiagram: `graph TD
  Client -->|search request| LB[Load Balancer]
  LB --> LBS[Location-Based Service\\nstateless, horizontally scaled]
  LB --> BS[Business Service]
  LBS --> RC[(Redis Cache\\ngeohash→business_ids\\nbusiness_id→details\\nTTL 24h)]
  LBS -->|cache miss| GI[(Geohash Index\\nMySQL replica\\n~1.7 GB)]
  LBS -->|detail fetch| BD[(Business DB\\nMySQL replica)]
  BS --> BDW[(Business DB\\nMySQL primary)]
  BDW -->|nightly batch| GI
  RC -.->|miss| GI`,
    asciiDiagram: `User (lat, long, radius)
  |
  v
Load Balancer
  |
  |---> Location-Based Service (stateless)
  |         |
  |         |-- 1. compute geohash at precision P
  |         |-- 2. fetch target cell + 8 neighbors
  |         |         |
  |         |    Redis Cache --miss--> MySQL Geohash Index
  |         |         |                  (geohash -> business_ids)
  |         |         v
  |         |-- 3. Haversine distance filter
  |         --- 4. fetch business details -> return
  |
  ---> Business Service (low QPS)
            |
       MySQL Primary --nightly batch--> Geohash Index`,
    studyNotes: `## Alex Xu Vol 2, Chapter 1 — Proximity Service

### Why Geohash Wins in Interviews
- Simple string prefix operations — no tree construction, no in-memory management
- Native Redis string keys — cache geohash cells directly
- Boundary problem solved by querying 9 cells (target + 8 neighbors)
- Easy to explain: "divide earth into grids, encode as base-32 string"

### Precision Cheat Sheet
| Precision | Cell Size | Search Radius |
|-----------|-----------|---------------|
| 4 | ~39 km | 20 km |
| 5 | ~4.9 km | 2-5 km |
| 6 | ~1.2 km | 0.5-1 km |

### Boundary Problem
Two points physically adjacent can have completely different geohash strings if they straddle a cell boundary. Always query 9 cells. All geohash libraries provide a neighbors() function.

### Expanding Radius
Remove the last character of the geohash to jump one precision level up (32x larger area). Repeat until you have >= K results.

### Scale Numbers
- 100M DAU x 5 searches/day / 86,400s = ~5,000 QPS
- 200M businesses x 8 bytes/entry x 6 precision levels ≈ 1.7 GB index — fits in Redis
- Multi-region deployment: Redis + MySQL replicas per region

### Business Updates
- Changes propagate nightly (not real-time) — acceptable because business info rarely changes
- Nightly batch job rebuilds geohash index from business table

### Why Not Quadtree?
- Requires 2+ minutes to build from 200M records at startup
- Must handle graceful warm-up (health-checks during build)
- Updates require tree re-traversal or incremental patching — complex
- Geohash index is just SQL rows — trivially replicable and cacheable`,
  },
  {
    title: 'Design Nearby Friends',
    prompt:
      'Design a real-time feature like Facebook Nearby Friends where opted-in users can see friends within a 5-mile radius with distance and last-seen time, updated every 30 seconds. Scale to 100M DAU.',
    difficulty: 'Hard',
    category: 'Location',
    tags: ['websocket', 'redis-pubsub', 'cassandra', 'geohash', 'fan-out'],
    modelAnswer: `## Nearby Friends Design

### Requirements
- Functional: see opted-in friends within 5 miles; distance + last-seen timestamp; refreshes every ~30s; opt-out
- Non-functional: 100M DAU, 10M concurrent users, low latency (seconds), eventual consistency fine

### Scale Estimates
- 10M concurrent users sending location every 30s → 334K location updates/sec
- Each user has ~400 friends, 10% online → ~40 online friends per user
- Fan-out: 334K x 40 = ~14M pushes/sec

### Transport: WebSocket
HTTP polling at 334K QPS would require 334K x 40 = 13M DB reads/sec. Impossible.
WebSocket: persistent, full-duplex, client holds one connection.

Messages:
- Client to Server: location_update {lat, long, timestamp} every 30s
- Server to Client: friend_location_update {friend_id, lat, long, distance, timestamp}
- Server to Client: init_nearby_friends (on connect, send initial list)

### Core Mechanism: Redis Pub/Sub Fan-out
Each user gets a dedicated pub/sub channel: channel:user_{id}

Flow on location update from User A:
1. Write {lat, long, ts} to Redis Location Cache (key: user:{id}, TTL: 10 min)
2. Append to Cassandra location history
3. Publish to channel:user_A
4. All WebSocket servers that host one of A's friends are subscribed to channel:user_A
5. Each server receives the message, computes Haversine distance to the friend
6. If distance <= 5 miles → push update to friend's WebSocket connection

Redis pub/sub servers: 14M pushes/sec / 100K per server = ~140 Redis servers

### Architecture
- Load Balancer → WebSocket Servers (stateful) + REST API Servers (stateless)
- Service Discovery (Zookeeper/etcd): tracks user_id → WebSocket server mapping
- Redis Location Cache: latest position per user (TTL 10 min, auto-evicts stale)
- Redis Pub/Sub: ~140 shards, consistent hashing assigns user channels to shards
- Cassandra: append-only location history (user_id, timestamp → lat/long)
- MySQL: user profiles + friend graph (sharded by user_id)

### Storage
Redis Location Cache:
- Key: user:{id}, Value: {lat, long, ts}, TTL: 600s

Cassandra Location History:
- Partition key: user_id, Clustering key: timestamp DESC
- Write-optimized LSM tree; handles millions of writes/sec

Friendship DB (MySQL):
- users(user_id, name, opt_in_nearby)
- friendships(user_id, friend_id)

### Key Design Decisions
- Push vs Pull: Push fan-out via pub/sub. Pull would require 13M reads/sec on friendship DB.
- Redis Pub/Sub vs Kafka: Pub/sub is ephemeral (no persistence), lower latency. Location updates are fire-and-forget.
- WebSocket vs SSE: WebSocket preferred for bidirectional flow.
- Max friends cap: 5,000 friends to bound worst-case fan-out per update.`,
    mermaidDiagram: `graph TD
  Mobile[Mobile Client] -->|WebSocket| LB[Load Balancer]
  LB -->|Persistent WS| WSS[WebSocket Server Pool\\nstateful, 1 per user]
  WSS -->|Publish location| RPS[(Redis Pub/Sub\\n~140 shards\\nchannel per user)]
  WSS -->|Write position| RLC[(Redis Location Cache\\nuser→lat/long/ts\\nTTL 10min)]
  WSS -->|Append| CH[(Cassandra\\nLocation History)]
  WSS -->|Read friends| FDB[(Friendship DB\\nMySQL sharded)]
  RPS -->|Push to subscribers| WSS
  WSS -->|Push update| Mobile
  SD[Service Discovery\\nZookeeper] -.->|user→server mapping| WSS
  LB --> REST[REST API Servers\\nstateless]
  REST --> FDB`,
    asciiDiagram: `Mobile Client
  |  (sends location every 30s)
  |
  v
Load Balancer
  |
  v
WebSocket Server (stateful, holds persistent connections)
  |
  |-- 1. Write to Redis Location Cache (TTL 10 min)
  |         user:{id} -> {lat, long, ts}
  |
  |-- 2. Append to Cassandra Location History
  |         (user_id, timestamp) -> {lat, long}
  |
  --- 3. Publish to Redis Pub/Sub: channel:user_{id}
            |
            v (fan-out to ~40 subscribers)
       WebSocket Servers that host A's online friends
            |
            |-- 4. Compute Haversine distance
            --- 5. If <= 5 miles -> push to friend's WebSocket connection

Service Discovery (Zookeeper): user_id -> WebSocket server address`,
    studyNotes: `## Alex Xu Vol 2, Chapter 3 — Nearby Friends

### Key Numbers
| Metric | Value |
|--------|-------|
| Concurrent users | 10M |
| Location update interval | 30 seconds |
| Location update QPS | 334,000/sec |
| Avg online friends per user | ~40 |
| Fan-out QPS | ~14 million/sec |
| Redis pub/sub servers needed | ~140 |

### Why WebSocket (Not HTTP Polling)
Polling at 334K QPS x 40 friends = 13M DB reads/sec — impossible.
WebSocket persistent connection: client holds one long-lived connection. Server pushes updates down the same pipe.

### Redis Pub/Sub Architecture
Each active user gets a channel: channel:user_{id}
- No persistent state (messages not stored) — ephemeral by design
- Losing one location update is acceptable (next one arrives in 30s)
- Consistent hashing assigns channels to servers → minimizes reshuffling on scale events
- 140 servers x 100K pushes/server/sec = 14M pushes/sec capacity

### WebSocket Server — Stateful Considerations
- Each server tracks which friends are subscribed to which channels
- On reconnect: consistent hashing in LB routes client to same server → minimal resubscription
- Graceful shutdown: drain mode → stop accepting new connections → clients reconnect naturally
- Service Discovery (Zookeeper): maps user_id → server address for direct routing

### Location Cache TTL Design
- TTL 10 minutes: auto-evicts stale positions without explicit cleanup
- If user goes offline (no update for 10 min), cache entry expires → removed from nearby friends list automatically

### Geohash Extension for Nearby Strangers
1. Pool of geohash channels (e.g., channel:geohash_9q8yy)
2. User subscribes to their current geohash + 8 neighbors
3. On movement across cell boundary: unsubscribe old + subscribe new
4. Anyone publishing to that channel appears on your radar

### Redis Pub/Sub vs Kafka
| Feature | Redis Pub/Sub | Kafka |
|---------|--------------|-------|
| Persistence | No | Yes |
| Latency | Sub-ms | Low ms |
| Fan-out | Native | Consumer groups |
| Best for | Ephemeral real-time | Durable event stream |
Location updates are ephemeral → Redis Pub/Sub wins`,
  },
  {
    title: 'Design Google Maps',
    prompt:
      'Design a mapping service like Google Maps that supports map tile rendering, place search, route planning, and live traffic updates. The system should scale globally and deliver low-latency map interactions on mobile and web clients.',
    difficulty: 'Hard',
    category: 'Location',
    tags: ['map-tiles', 'routing', 'traffic', 'geospatial', 'cdn'],
    modelAnswer: `## Google Maps Design

### Requirements
- Functional: pan/zoom map, place search, route planning, ETA, traffic overlays
- Non-functional: global coverage, low latency on mobile, high availability, frequent traffic refreshes

### Core Subsystems
- Tile Service: serves raster/vector map tiles for each zoom level
- Search Service: geospatial index for addresses, POIs, autocomplete
- Routing Service: computes shortest/fastest path between origin and destination
- Traffic Service: ingests GPS probes and road events, updates edge weights

### Map Tiles
- Pre-render base map tiles offline from road/building/source datasets
- Key by {z}/{x}/{y}; store in object storage and serve through CDN
- Vector tiles reduce bandwidth and let clients style dynamically

### Search
- Geospatial index over places using S2 cells or geohash
- Autocomplete index by prefix + popularity
- Query flow: prefix search + nearby ranking + exact place lookup

### Routing
- Model road network as weighted graph: intersections = nodes, road segments = edges
- Use A* with heuristics for city-scale routing; contraction hierarchies for faster long-distance routes
- Return primary route plus alternatives

### Traffic
- Clients upload anonymized GPS samples
- Stream processing aggregates speed per road segment every few seconds
- Routing service uses dynamic edge weights for ETA and reroutes

### Storage
- Road graph + metadata: sharded graph store or specialized routing DB
- Place metadata: distributed key-value / search index
- Traffic state: in-memory cache + append-only stream for history

### Scale
- CDN handles most tile reads
- Search and routing are stateless API layers over indexed stores
- Traffic pipeline is write-heavy; route requests are CPU-heavy`,
    mermaidDiagram: `graph LR
  Client[Mobile/Web Client] -->|tiles| CDN[CDN]
  CDN --> TileStore[(Object Storage\\nvector/raster tiles)]
  Client -->|search| SearchAPI[Search API]
  SearchAPI --> PlaceIndex[(Geospatial Place Index)]
  Client -->|route request| RouteAPI[Routing API]
  RouteAPI --> RoadGraph[(Road Graph Store)]
  RouteAPI --> TrafficCache[(Traffic Cache)]
  Client -->|GPS probes| Ingest[Traffic Ingestion]
  Ingest --> Stream[Kafka / Stream Processor]
  Stream --> TrafficCache`,
    asciiDiagram: `MAP VIEW:
  Client ──► CDN ──► Tile Store
            (z/x/y tiles cached at edge)

SEARCH:
  Client ──► Search API ──► Geospatial Place Index
                          └──► Prefix/Autocomplete Index

ROUTING:
  Client ──► Routing API ──► Road Graph
                          └──► Traffic Cache

TRAFFIC:
  GPS Probes ──► Ingestion ──► Stream Processing ──► Road segment speeds`,
    studyNotes: `## Alex Xu Vol 2 — Google Maps

### Interview Framing
- Split the system into 4 parts: tiles, search, routing, traffic
- Clarify that map browsing is a read-heavy CDN problem, while routing is a graph algorithm problem

### Tile Pyramid
- World map is divided into tiles by zoom level
- Tile key format: z/x/y
- CDN cache hit ratio is critical because tile reads dominate traffic
- Vector tiles are preferred on modern clients because they are smaller and styleable

### Routing Algorithms
- Dijkstra works conceptually but is too slow at global scale
- A* improves single-route performance with a distance heuristic
- Contraction hierarchies or precomputed shortcuts help for fast long routes

### Traffic Updates
- GPS samples update edge weights on the road graph
- Stream processor computes average speed per segment over short windows
- Route ETA becomes a function of both static distance and dynamic traffic

### Key Trade-offs
- Precompute aggressively for tiles and road hierarchy
- Compute on demand for route requests
- Keep traffic in memory for fast reads; persist the raw event stream for replay and analytics`,
  },
  {
    title: 'Design a Distributed Message Queue',
    prompt:
      'Design a distributed message queue like Kafka or Pulsar that supports durable publish/subscribe messaging, horizontal scaling, consumer replay, and high throughput across multiple brokers.',
    difficulty: 'Hard',
    category: 'Messaging',
    tags: ['kafka', 'partitioning', 'replication', 'consumer-groups', 'log'],
    modelAnswer: `## Distributed Message Queue Design

### Requirements
- Functional: publish, subscribe, replay by offset, ordering within partition, retention
- Non-functional: high throughput, durability, horizontal scaling, fault tolerance

### Data Model
- Topic → partitions
- Partition = append-only log of messages
- Message identified by monotonically increasing offset

### Write Path
1. Producer sends message to topic
2. Broker routes to partition (round robin or key-based hashing)
3. Leader appends message to local log and fsyncs based on durability policy
4. Followers replicate the message
5. Ack after leader-only or quorum replication depending on settings

### Read Path
- Consumers pull from assigned partitions
- Each consumer group stores offsets independently
- Replay = reset offset and read old messages again

### Partitioning
- Hash on message key to preserve ordering for related events
- More partitions = more parallelism, but higher coordination overhead

### Replication
- Each partition has one leader and N-1 followers
- Controller elects a new leader on broker failure
- In-sync replicas (ISR) determine safe ack policies

### Storage
- Sequential disk append for high throughput
- Segment logs into files; older segments rolled and compacted or deleted by retention policy
- Index maps offset → file position for fast reads

### Consumer Groups
- Each partition assigned to at most one consumer in a group
- Rebalance on consumer join/leave
- Exactly-once is hard; at-least-once is the common baseline

### Scale
- Add brokers to host more partitions
- Retention and compaction control storage growth
- Batch produce/fetch requests to improve throughput`,
    mermaidDiagram: `graph LR
  Producer --> LB[Broker Endpoint]
  LB --> Leader[Partition Leader]
  Leader --> Log[(Append-only Log)]
  Leader --> F1[Follower Broker 1]
  Leader --> F2[Follower Broker 2]
  ConsumerA[Consumer Group A] --> Leader
  ConsumerB[Consumer Group B] --> Leader
  Controller[Controller / Metadata Service] -.-> Leader
  Controller -.-> F1
  Controller -.-> F2`,
    asciiDiagram: `TOPIC orders

  Partition 0: Broker A (leader) -> Broker B/C replicas
  Partition 1: Broker B (leader) -> Broker A/C replicas
  Partition 2: Broker C (leader) -> Broker A/B replicas

WRITE:
  Producer -> partition leader -> append log -> replicate -> ack

READ:
  Consumer group stores offsets
  Replay = seek to older offset and read again`,
    studyNotes: `## Alex Xu Vol 2 — Distributed Message Queue

### Core Idea
- Treat each partition as a durable append-only log
- Consumers track their own offsets instead of the broker deleting messages after read

### Why Kafka-style Logs Scale
- Sequential disk writes are fast
- Zero-copy and batched fetches reduce CPU overhead
- Partitioning spreads throughput across brokers

### Ordering
- Global ordering is expensive and usually unnecessary
- Guarantee ordering only within a partition
- Use a partition key to keep related events together

### Delivery Semantics
- At-most-once: fastest, may lose messages
- At-least-once: retries can duplicate messages
- Exactly-once: possible but operationally expensive

### Important Trade-offs
- More partitions increase concurrency but also rebalance cost
- Stronger durability settings reduce throughput
- Long retention improves replay/debugging but increases storage cost`,
  },
  {
    title: 'Design a Metrics Monitoring and Alerting System',
    prompt:
      'Design a monitoring platform like Prometheus + Alertmanager that collects service metrics, stores time-series data, supports dashboards, and triggers alerts when rules are violated.',
    difficulty: 'Hard',
    category: 'Infrastructure',
    tags: ['timeseries', 'prometheus', 'alerting', 'aggregation', 'pull-model'],
    modelAnswer: `## Metrics Monitoring and Alerting System

### Requirements
- Functional: scrape metrics, query time ranges, build dashboards, define alert rules, send notifications
- Non-functional: low ingestion latency, durable storage, high cardinality control, near-real-time alerts

### Data Model
- Metric name + labels + timestamp + value
- Example: http_requests_total{service="api", status="500"} 42 @ ts

### Collection
- Agents or exporters expose /metrics
- Collector service scrapes on intervals (15s/30s) or receives pushed metrics for short-lived jobs
- Batch and compress samples before writing

### Storage
- In-memory buffer for recent writes
- Time-series database on disk using WAL + immutable blocks
- Downsample old data for long-term retention

### Query Layer
- Query by metric name, labels, time window, aggregation function
- Common ops: sum, avg, rate, p95, group-by label

### Alerting
- Rule engine periodically evaluates queries
- Alert states: pending -> firing -> resolved
- Deduplicate alerts and group by service/team before sending

### Scale
- Shard by metric or tenant
- Use remote write to long-term object storage for history
- Guard against cardinality explosions from unbounded labels`,
    mermaidDiagram: `graph LR
  App[Application / Exporter] --> Scraper[Scraper Service]
  Scraper --> Ingest[Ingestion Layer]
  Ingest --> TSDB[(Time-Series DB)]
  TSDB --> Query[Query API]
  Query --> Dash[Dashboards]
  Query --> Rules[Alert Rule Engine]
  Rules --> Notify[Notification Router]
  Notify --> Email[Email/Slack/PagerDuty]`,
    asciiDiagram: `EXPORTERS ──► SCRAPERS ──► INGESTION ──► TSDB
                                      │
                                      ├──► Query API ──► Dashboards
                                      └──► Rule Engine ──► Alert Notifications`,
    studyNotes: `## Alex Xu — Metrics Monitoring and Alerting

### Core Split
- Monitoring = collect, store, query metrics
- Alerting = evaluate rules and notify owners

### Key Challenges
- High cardinality labels can blow up storage
- Scrape failures must not silently hide outages
- Alerts need deduplication and suppression to avoid fatigue

### Design Notes
- Pull-based scraping is simpler for service discovery and liveness checks
- Keep recent data hot for fast dashboards; archive older data cheaply
- Alert rules usually run on short intervals, e.g. every 30s
- Group alerts by team/service to reduce noisy pages`,
  },
  {
    title: 'Design Ad Click Event Aggregation',
    prompt:
      'Design a system that ingests ad impression and click events, aggregates them in near real time, detects fraud, and produces billing/reporting data for advertisers.',
    difficulty: 'Hard',
    category: 'Messaging',
    tags: ['stream-processing', 'kafka', 'aggregation', 'fraud-detection', 'adtech'],
    modelAnswer: `## Ad Click Event Aggregation

### Requirements
- Functional: ingest impressions/clicks, aggregate by ad/campaign, near-real-time dashboards, billing-grade counts
- Non-functional: massive write throughput, exactly-once or idempotent aggregation, low-latency analytics

### Event Pipeline
- Clients emit impression and click events
- Events land in Kafka for durable buffering
- Stream processor validates schema, enriches metadata, and aggregates counters

### Storage
- Raw immutable events in object storage for audit and replay
- Real-time aggregates in ClickHouse / Druid
- Billing tables in a durable OLTP/warehouse system

### Fraud Detection
- Deduplicate by event_id
- Detect suspicious click bursts by IP/device/fingerprint
- Delay final billing until anti-fraud checks complete

### Aggregation Dimensions
- campaign_id, ad_id, region, device_type, time bucket
- Compute CTR = clicks / impressions

### Scale
- Partition by campaign_id or ad_id
- Use tumbling windows (1 min / 5 min) for real-time stats
- Late arrivals update prior windows within an allowed lateness period`,
    mermaidDiagram: `graph LR
  Client --> Edge[Event Collector]
  Edge --> Kafka[Kafka]
  Kafka --> Stream[Stream Processor]
  Stream --> Fraud[Fraud Detection]
  Stream --> Agg[(Real-time Aggregates)]
  Kafka --> Lake[(Raw Event Lake)]
  Fraud --> Billing[(Billing Store)]
  Agg --> Dash[Advertiser Dashboard]`,
    asciiDiagram: `Events ──► Collector ──► Kafka ──► Stream Processing
                                        │        ├──► Fraud Detection
                                        │        ├──► Real-time Aggregates
                                        │        └──► Billing Output
                                        └──► Raw Event Lake`,
    studyNotes: `## Alex Xu — Ad Click Event Aggregation

### Interview Focus
- Separate raw event durability from real-time aggregation
- Billing data requires stronger correctness than dashboard data

### Important Patterns
- Immutable event log for replay
- Windowed aggregation for dashboard freshness
- Idempotent updates or exactly-once stream processing
- Fraud filtering before final settlement

### Trade-offs
- Near-real-time views can tolerate small lag
- Final billing usually waits for reconciliation and anti-fraud checks`,
  },
  {
    title: 'Design a Hotel Reservation System',
    prompt:
      'Design a hotel reservation system that supports room search, availability checks, booking, payment, and cancellation while preventing overbooking across many properties.',
    difficulty: 'Hard',
    category: 'Storage',
    tags: ['inventory', 'booking', 'transactions', 'locking', 'availability'],
    modelAnswer: `## Hotel Reservation System

### Requirements
- Functional: search hotels, view room types, reserve room, pay, cancel, refund
- Non-functional: no overbooking, consistent inventory, good read latency, high availability

### Inventory Model
- Property -> room_type -> date -> remaining_inventory
- Availability is tracked per date bucket, not as one global room count

### Booking Flow
1. Search service returns available room types
2. User selects room and dates
3. Reservation service creates a provisional hold with TTL
4. Payment succeeds -> confirm booking and decrement inventory permanently
5. Hold expires or payment fails -> release inventory

### Consistency
- Use DB transactions or compare-and-swap on inventory rows
- Prevent overbooking with row-level locking on (hotel_id, room_type, date)

### Storage
- OLTP database for inventory, reservations, payments
- Search index for hotel metadata and text search
- Cache hot inventory reads carefully with short TTLs

### Cancellation
- Refund policy depends on booking conditions
- On cancel, increment inventory for affected dates if refundable/eligible`,
    mermaidDiagram: `graph LR
  User --> Search[Search API]
  Search --> Catalog[(Hotel Catalog/Search Index)]
  User --> Reserve[Reservation Service]
  Reserve --> Inv[(Inventory DB)]
  Reserve --> Hold[(Hold Store / TTL)]
  Reserve --> Pay[Payment Service]
  Pay --> Reserve
  Reserve --> Booking[(Reservation DB)]`,
    asciiDiagram: `SEARCH: User -> Search API -> Catalog + Availability

BOOK:
  User -> Reservation Service
       -> lock inventory rows by date
       -> create hold
       -> take payment
       -> confirm reservation

CANCEL:
  Reservation Service -> refund logic -> release inventory`,
    studyNotes: `## Alex Xu — Hotel Reservation System

### Core Difficulty
- Reads are easy; writes are hard because availability must stay consistent

### Key Design
- Track inventory per room type per date
- Use temporary holds during checkout to avoid races
- Confirm only after payment succeeds

### Trade-offs
- Strong consistency on booking path
- Eventual consistency is acceptable for search index updates
- Cache availability carefully or you will oversell rooms`,
  },
  {
    title: 'Design a Distributed Email Service',
    prompt:
      'Design an email delivery platform like SendGrid or SES that sends transactional and bulk email, tracks delivery status, handles retries, and protects sender reputation.',
    difficulty: 'Hard',
    category: 'Messaging',
    tags: ['smtp', 'queues', 'retry', 'deliverability', 'bulk-email'],
    modelAnswer: `## Distributed Email Service

### Requirements
- Functional: send email via API, templates, retries, delivery/bounce tracking, unsubscribe support
- Non-functional: high throughput, reliable delivery, rate limiting, reputation protection

### Pipeline
- API accepts send request and validates sender/template
- Requests go to a durable queue
- Workers expand templates and hand off to outbound SMTP relays
- Webhooks ingest bounce, complaint, open, and click events

### Deliverability
- Warm up IPs gradually
- Enforce per-domain rate limits (Gmail, Outlook, Yahoo)
- Use SPF, DKIM, DMARC

### Retry Logic
- Temporary failures: exponential backoff
- Permanent failures: mark bounced and suppress future sends

### Storage
- Metadata DB for message status and templates
- Event stream for webhooks and analytics
- Suppression list DB for unsubscribed/complaining recipients

### Multi-Tenancy
- Isolate customers by API keys and quotas
- Prevent abusive senders from hurting global sender reputation`,
    mermaidDiagram: `graph LR
  Client --> API[Email API]
  API --> Queue[Durable Queue]
  Queue --> Worker[Render/Send Workers]
  Worker --> SMTP[SMTP Relay Pool]
  SMTP --> Inbox[Recipient Domains]
  Inbox --> Webhook[Webhook/Event Ingest]
  Webhook --> Status[(Message Status DB)]
  Worker --> Status`,
    asciiDiagram: `Client -> Email API -> Queue -> Send Workers -> SMTP Relays -> Recipient Mail Servers
                                                |
                                                └──► Status DB / Analytics / Suppression Lists`,
    studyNotes: `## Alex Xu — Distributed Email Service

### Main Themes
- Queue all sends before delivery
- Separate API acceptance from outbound SMTP throughput
- Protect sender reputation with throttling and suppression lists

### Operational Needs
- Retries for transient SMTP failures
- Bounce/complaint ingestion changes future eligibility
- Per-tenant quotas prevent abuse`,
  },
  {
    title: 'Design a Real-time Gaming Leaderboard',
    prompt:
      'Design a gaming leaderboard that ranks players globally and by region in real time, supports friend views, and updates instantly as scores change.',
    difficulty: 'Medium',
    category: 'Real-time',
    tags: ['leaderboard', 'redis', 'sorted-set', 'ranking', 'top-k'],
    modelAnswer: `## Real-time Gaming Leaderboard

### Requirements
- Functional: update scores, top N leaderboard, player rank lookup, nearby ranks, friend leaderboard
- Non-functional: low latency, high write throughput, real-time updates

### Core Data Structure
- Redis Sorted Set
- member = player_id, score = player_score

### Operations
- Update score: ZADD leaderboard score player_id
- Get top 100: ZREVRANGE leaderboard 0 99 WITHSCORES
- Get user rank: ZREVRANK leaderboard player_id
- Get nearby players: rank-5 to rank+5

### Partitioning
- Separate leaderboards by season/game mode/region
- For massive scale, shard by logical leaderboard rather than one global set

### Durability
- Redis for hot state
- Periodically snapshot to durable DB / object storage
- Event log of score updates for replay

### Friend Leaderboard
- Fetch friend IDs from social graph
- Intersect with leaderboard ranks or maintain cached friend subsets`,
    mermaidDiagram: `graph LR
  GameClient --> API[Score API]
  API --> Redis[(Redis Sorted Sets)]
  API --> Log[Score Update Log]
  Redis --> Query[Leaderboard Query API]
  Query --> ClientView[Game Client / UI]
  Query --> Social[Friend Graph]`,
    asciiDiagram: `Score Update -> API -> Redis Sorted Set
Top N Query -> Query API -> Redis
Friend View -> Query API + Friend Graph -> filtered ranks`,
    studyNotes: `## Alex Xu — Real-time Gaming Leaderboard

### Why Redis Sorted Set
- Native support for score ordering and rank lookup
- Excellent for top-N and nearby-rank queries

### Important Considerations
- Partition leaderboards by season/mode/region
- Persist snapshots because Redis is not your only source of truth
- Friend leaderboard usually combines social graph + global leaderboard data`,
  },
  {
    title: 'Design a Payment System',
    prompt:
      'Design a payment platform that authorizes, captures, settles, and refunds transactions while integrating with external payment processors and maintaining strong financial correctness.',
    difficulty: 'Hard',
    category: 'Infrastructure',
    tags: ['payments', 'ledger', 'idempotency', 'settlement', 'refunds'],
    modelAnswer: `## Payment System

### Requirements
- Functional: authorize payment, capture funds, settle to merchants, refund, dispute support
- Non-functional: correctness, idempotency, auditability, security, high availability

### Core Services
- Payment API
- Idempotency service
- Ledger
- Processor integration service
- Settlement/reconciliation service

### Flow
1. Client submits payment intent with idempotency key
2. System validates request and creates payment record
3. Processor handles card/bank authorization
4. On success, write immutable ledger entries
5. Capture and settle later depending on merchant flow

### Ledger
- Double-entry bookkeeping
- Every money movement creates balanced debit/credit records
- Never update balances directly without ledger entries

### Reconciliation
- Compare internal ledger with processor reports
- Any mismatch enters manual or automated recovery flow

### Security
- Tokenize sensitive payment data
- Minimize PCI scope
- Strong audit logging and access controls`,
    mermaidDiagram: `graph LR
  Client --> API[Payment API]
  API --> Idem[Idempotency Store]
  API --> Proc[Processor Gateway]
  Proc --> External[External Payment Processor]
  API --> Ledger[(Immutable Ledger)]
  Ledger --> Recon[Reconciliation Service]
  Recon --> Reports[Settlement Reports]`,
    asciiDiagram: `Client -> Payment API -> Processor Gateway -> External Processor
                 -> Ledger -> Reconciliation -> Settlement`,
    studyNotes: `## Alex Xu — Payment System

### Core Principles
- Idempotency is mandatory
- Ledger is the source of truth
- Reconciliation catches processor/internal mismatches

### Interview Focus
- Separate authorization, capture, settlement, refund
- Use double-entry bookkeeping
- Never trust external callbacks without verification`,
  },
  {
    title: 'Design a Digital Wallet',
    prompt:
      'Design a digital wallet like PayPal or Cash App that stores balances, supports peer-to-peer transfers, top-ups, withdrawals, and transaction history with strong financial consistency.',
    difficulty: 'Hard',
    category: 'Infrastructure',
    tags: ['wallet', 'ledger', 'transfers', 'balances', 'fintech'],
    modelAnswer: `## Digital Wallet

### Requirements
- Functional: wallet balance, top-up, withdraw, transfer to another user, transaction history
- Non-functional: no lost money, no double spend, auditability, low latency

### Core Model
- Wallet account per user/currency
- Balance derived from ledger entries, with cached available balance for fast reads

### Transfer Flow
1. Validate sender has sufficient available balance
2. Create transfer record with idempotency key
3. Write double-entry ledger entries: sender debit, receiver credit
4. Update derived balance cache

### Top-up / Withdrawal
- Top-up via bank/card payment rails
- Withdrawal via ACH/bank transfer/card rails
- External movement reconciled against internal ledger

### Consistency
- Use transactions on the ledger write path
- Prevent double spend with account versioning or row locks

### Storage
- Ledger DB for immutable transactions
- Profile/account DB
- Analytics/history store for user timelines`,
    mermaidDiagram: `graph LR
  User --> WalletAPI[Wallet API]
  WalletAPI --> Accounts[(Wallet Accounts)]
  WalletAPI --> Ledger[(Double-entry Ledger)]
  WalletAPI --> Rails[Bank/Card Rails]
  Ledger --> Balance[Derived Balance Cache]
  WalletAPI --> History[Transaction History]`,
    asciiDiagram: `P2P Transfer:
  Sender -> Wallet API -> Ledger debit
                        -> Ledger credit -> Receiver
                        -> Balance cache update

Top-up / Withdrawal:
  Wallet API <-> External payment rails`,
    studyNotes: `## Alex Xu — Digital Wallet

### Distinction from Payment System
- Payment system moves money between customer and merchant
- Wallet system also manages stored user balances and P2P transfers

### Design Notes
- Ledger first, balance second
- Double spend prevention is critical
- External top-up/withdrawal must reconcile with internal wallet state`,
  },
  {
    title: 'Design a Stock Exchange',
    prompt:
      'Design a stock exchange that accepts buy and sell orders, matches them with low latency, maintains an order book, and publishes market data while ensuring fairness and correctness.',
    difficulty: 'Hard',
    category: 'Real-time',
    tags: ['matching-engine', 'order-book', 'trading', 'latency', 'market-data'],
    modelAnswer: `## Stock Exchange

### Requirements
- Functional: place/cancel order, match trades, maintain order book, publish trades/quotes
- Non-functional: ultra-low latency, fairness, deterministic matching, high availability

### Order Book
- Separate buy and sell books per symbol
- Buy side sorted by highest price first
- Sell side sorted by lowest price first
- Within same price level, match FIFO by time

### Matching Engine
- Single writer per symbol or partition to keep deterministic order
- On new order: try to match against opposite side, execute trades, then rest remaining quantity
- Market data published after each book change

### Persistence
- Write-ahead log for all order events
- Replay log to rebuild order books after restart

### Market Data
- Publish top-of-book, depth, and trade events to subscribers
- Separate trading path from analytics/reporting path

### Risk Controls
- Pre-trade risk checks on balance/position limits
- Circuit breakers and symbol halts on extreme volatility

### Scale
- Partition by symbol
- Keep matching engine in memory for speed
- Replicate logs and hot standby nodes for recovery`,
    mermaidDiagram: `graph LR
  Trader --> Gateway[Order Gateway]
  Gateway --> Risk[Risk Checks]
  Risk --> Match[Matching Engine]
  Match --> Book[(In-memory Order Book)]
  Match --> WAL[Write-Ahead Log]
  Match --> Market[Market Data Feed]
  WAL --> Replay[Recovery / Replay]`,
    asciiDiagram: `Order Flow:
  Trader -> Gateway -> Risk Check -> Matching Engine -> Order Book
                                               |-> Trade Execution
                                               |-> Market Data
                                               |-> WAL`,
    studyNotes: `## Alex Xu — Stock Exchange

### Interview Focus
- Matching engine is the core
- Deterministic ordering matters more than horizontal write scaling per symbol

### Important Rules
- Price-time priority
- Single sequenced stream per symbol/book
- WAL for recovery and auditing

### Architecture Theme
- Hot path in memory
- Durable event log underneath
- Market data fan-out separated from matching path`,
  },
  {
    title: 'Design a Web Crawler',
    prompt:
      'Design a web crawler that discovers and downloads pages from the public web, respects robots.txt and rate limits, avoids duplicates, and keeps a search index fresh.',
    difficulty: 'Hard',
    category: 'Search',
    tags: ['crawler', 'robots.txt', 'deduplication', 'frontier', 'indexing'],
    modelAnswer: `## Web Crawler

### Requirements
- Functional: seed URLs, fetch pages, extract links, deduplicate URLs/content, honor robots.txt, refresh pages periodically
- Non-functional: internet-scale throughput, politeness, fault tolerance, freshness, storage efficiency

### High-Level Flow
1. Seed service adds initial URLs into the crawl frontier
2. URL scheduler picks the next URL based on priority and host politeness rules
3. Fetchers download pages and record HTTP metadata
4. Parsers extract text, metadata, canonical URLs, and outlinks
5. Dedup services remove duplicate URLs and near-identical content
6. Indexer sends parsed content into the search index

### Core Components
- Frontier queue: distributed priority queue keyed by URL
- Host scheduler: enforces per-domain concurrency and crawl delay
- Robots service: caches robots.txt and allow/deny rules per host
- URL seen set: Bloom filter or hash set to avoid revisiting the same URL too often
- Content dedup store: hash page content (for example SimHash for near duplicates)

### Storage
- Raw page store in object storage
- Metadata DB for crawl status, last fetch time, HTTP code, checksum
- Search index stores normalized text, title, links, and ranking signals

### Important Trade-offs
- Freshness vs bandwidth: popular pages re-crawled more often
- Breadth-first crawling discovers sites quickly; priority crawling improves search quality
- Bloom filters are memory-efficient but allow false positives` ,
    mermaidDiagram: `graph LR
  Seed[Seed URLs] --> Frontier[URL Frontier / Priority Queue]
  Frontier --> Scheduler[Host Scheduler]
  Scheduler --> Robots[Robots.txt Cache]
  Scheduler --> Fetcher[Fetcher Workers]
  Fetcher --> Parser[HTML Parser]
  Parser --> Dedup[URL + Content Dedup]
  Dedup --> Indexer[Indexer]
  Parser --> Frontier
  Indexer --> Search[(Search Index)]
  Fetcher --> Raw[(Raw Page Store)]`,
    asciiDiagram: `SEEDS -> FRONTIER -> HOST SCHEDULER -> FETCHERS -> PARSER
                                             |              |
                                             |              +-> Raw page store
                                             +-> robots.txt cache

PARSER -> URL dedup -> frontier
PARSER -> content dedup -> indexer -> search index`,
    studyNotes: `## Primer-style notes - Web Crawler

### Main Interview Themes
- The crawler is usually separate from the search serving path
- Politeness matters: respect robots.txt, crawl-delay, and per-host rate limits
- Deduplication happens twice:
  - URL-level dedup to avoid fetching the same URL repeatedly
  - Content-level dedup to avoid indexing mirrored pages

### Freshness Strategy
- Highly popular news pages get recrawled frequently
- Low-value or stale pages get a long recrawl interval
- Store last fetched time and change frequency hints per URL

### Scale Strategy
- Partition frontier by host or URL hash
- Keep per-host queues so one large domain does not starve others
- Use object storage for raw HTML and a separate inverted index for search` ,
  },
  {
    title: 'Design a Personal Finance Tracker',
    prompt:
      'Design a system like Mint that aggregates accounts from multiple banks, imports transactions, categorizes spending, tracks budgets, and alerts users about unusual activity.',
    difficulty: 'Hard',
    category: 'Infrastructure',
    tags: ['aggregation', 'webhooks', 'ledger', 'banking', 'budgets'],
    modelAnswer: `## Personal Finance Tracker

### Requirements
- Functional: link bank accounts, import balances and transactions, categorize spend, budget tracking, alerts
- Non-functional: strong security, eventual consistency with external institutions, auditability, good UX on stale data

### Data Ingestion
- Use an aggregator or direct bank integrations to connect accounts
- Pull periodic syncs and ingest webhook updates when institutions support them
- Every imported transaction is stored as immutable raw financial data

### Core Services
- Account-linking service for OAuth/token exchange with banks
- Sync service to pull balances and new transactions
- Categorization service to label merchants and spending categories
- Budget service to compute monthly totals and limit breaches
- Alerting service for low balance, large purchase, duplicate charge, or unusual merchant

### Storage
- User/account metadata in OLTP DB
- Immutable transaction store for imported financial events
- Derived materialized views for monthly spending and budgets

### Correctness
- External bank feeds are not perfectly real-time
- Transactions can start as pending and later settle with different amounts
- De-duplicate by institution transaction ID plus fallback heuristics

### Security
- Encrypt tokens at rest
- Minimize stored secrets and sensitive fields
- Strong audit logs and scoped access controls` ,
    mermaidDiagram: `graph LR
  User --> Link[Account Linking Service]
  Link --> Bank[Bank Aggregator / Bank APIs]
  Bank --> Sync[Sync + Webhook Ingest]
  Sync --> Tx[(Transaction Store)]
  Sync --> Accounts[(Account Metadata DB)]
  Tx --> Categorize[Categorization Service]
  Categorize --> Budget[Budget / Insights Service]
  Budget --> Alerts[Alerting]
  Budget --> UI[User Dashboard]`,
    asciiDiagram: `User -> Account Linking -> Bank APIs/Aggregator
                               |
                               v
                       Sync + Webhook Ingest
                          |             |
                          v             v
                  Account Metadata   Transaction Store
                                        |
                                        v
                            Categorization / Budgeting / Alerts`,
    studyNotes: `## Primer-style notes - Personal Finance Tracker

### Core Difficulty
- Your system does not control the source of truth for balances; banks do
- Imported data is delayed, corrected, and sometimes duplicated

### Design Principles
- Keep raw transactions immutable
- Build categorized and budgeted views as derived data
- Show "last synced" clearly to users because consistency is external

### Good Interview Points
- Pending vs posted transactions
- Handling revoked bank tokens and expired credentials
- Budget alerts should be asynchronous, not block account sync` ,
  },
  {
    title: 'Design a Social Graph Service',
    prompt:
      'Design the data structures and APIs for a social graph that stores follow and friend relationships, supports mutual connections, follower counts, friend suggestions, and celebrity-scale fan-out.',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['graph', 'followers', 'friends', 'adjacency-list', 'fanout'],
    modelAnswer: `## Social Graph Service

### Requirements
- Functional: follow/unfollow, friend connect, list followers/following, mutual friends, follower counts, recommendations
- Non-functional: low-latency reads, large celebrity accounts, high write volume during spikes

### Data Model
- Directed edges for follows: user_a -> user_b
- Optional undirected friendship represented as two confirmed directed edges or one relation record
- Store adjacency lists rather than doing deep graph traversals in OLTP

### APIs
- POST /follow
- DELETE /follow
- GET /users/{id}/followers
- GET /users/{id}/following
- GET /users/{id}/mutuals?with=other_user

### Storage
- Edge store partitioned by source user ID
- Counter cache for follower and following counts
- Recommendation pipeline computed asynchronously from graph signals

### Scale Concerns
- Celebrities have millions of inbound edges; shard large adjacency lists
- Cursor pagination is mandatory for followers/following lists
- Use separate online serving path and offline batch path for "people you may know"

### Trade-offs
- Graph databases are expressive but not always required for simple follow lists
- For interview scope, adjacency lists in MySQL/Cassandra plus caches are usually enough` ,
    mermaidDiagram: `graph LR
  User --> API[Social Graph API]
  API --> Edge[(Edge Store)]
  API --> Count[(Counter Cache)]
  Edge --> Mutual[Mutual / Query Service]
  Edge --> Reco[Recommendation Pipeline]
  Reco --> Suggest[(Suggestion Store)]
  Mutual --> Client[Client]
  Suggest --> Client`,
    asciiDiagram: `WRITE:
  User -> Social Graph API -> Edge Store
                           -> Counter Cache

READ:
  Followers/Following -> Edge Store + Cache
  Mutuals -> Query Service over adjacency lists
  Suggestions -> Offline pipeline -> Suggestion Store`,
    studyNotes: `## Primer-style notes - Social Graph

### Recommended framing
- Separate graph storage from feed generation; they are different systems
- Optimize for adjacency list lookups, not arbitrary graph analytics in the hot path

### Common Patterns
- Partition edges by user ID
- Precompute counts instead of counting huge edge sets on every request
- Suggestions use offline jobs: mutual counts, imported contacts, shared school/company, engagement signals

### Interview Trade-offs
- Simple follow APIs: relational or wide-column store works well
- Rich multi-hop graph exploration: graph DB may help, but often not needed for the core product path` ,
  },
  {
    title: 'Design a Search Query Cache',
    prompt:
      'Design a query cache for a search engine that stores the results of popular queries, reduces load on ranking servers, and handles invalidation when the index changes.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['query-cache', 'redis', 'ranking', 'ttl', 'invalidation'],
    modelAnswer: `## Search Query Cache

### Requirements
- Functional: cache popular query results, low-latency lookup, invalidate stale entries, support pagination
- Non-functional: high hit rate, memory efficiency, predictable freshness

### Cache Key
- Normalize the query text
- Include language, region, safe-search mode, device type, and page number in the key
- Example: q=best+pizza|lang=en|geo=nyc|page=1

### Read Path
1. User query hits search frontend
2. Frontend checks cache for ranked document IDs
3. On hit: fetch snippets/doc metadata and return
4. On miss: ranking stack computes results, store top N doc IDs in cache

### Write / Invalidation
- TTL handles most churn for tail queries
- Index version or generation number can be part of the key for cheap global invalidation
- Very hot queries can be proactively refreshed

### Data Stored
- Ranked document IDs and lightweight scoring metadata
- Do not store entire documents in the query cache

### Trade-offs
- Larger cache improves hit rate but costs memory
- Short TTL improves freshness but lowers hit ratio
- Query normalization is critical to avoid duplicate cache entries` ,
    mermaidDiagram: `graph LR
  User --> Frontend[Search Frontend]
  Frontend --> Cache[(Query Cache)]
  Cache -->|miss| Rank[Ranking Service]
  Rank --> Index[(Search Index)]
  Rank --> Cache
  Frontend --> Snippets[Document Metadata/Snippet Service]
  Snippets --> User`,
    asciiDiagram: `User -> Search Frontend -> Query Cache
                              | hit
                              v
                         Return ranked doc IDs

Miss -> Ranking Service -> Search Index -> Cache populate -> Response`,
    studyNotes: `## Primer-style notes - Search Query Cache

### Why cache query results
- Search traffic is highly skewed; a small set of hot queries drives a large portion of reads
- Caching top result IDs saves expensive ranking work

### Good design details
- Normalize whitespace, casing, locale, and filters before key generation
- Include index generation in the key when global reindexing is common
- Cache only the top K ranked document IDs, not full rendered pages

### Failure mode to discuss
- A stale cache can serve outdated results after major reindexing
- A key design bug can mix results across languages or regions` ,
  },
  {
    title: 'Design Amazon Sales Ranking by Category',
    prompt:
      'Design a system that continuously computes best-seller rankings by category for an e-commerce site, updates quickly after purchases, and serves ranking pages with low latency.',
    difficulty: 'Medium',
    category: 'Real-time',
    tags: ['ranking', 'stream-processing', 'top-k', 'ecommerce', 'aggregation'],
    modelAnswer: `## Sales Ranking by Category

### Requirements
- Functional: update category rankings after purchases, support top-N lists, handle many categories, show near-real-time leaderboards
- Non-functional: low-latency reads, high write throughput, eventual consistency acceptable within a short window

### Event Flow
- Orders emit purchase events after payment confirmation
- Stream processor aggregates counts by category and product
- Ranking store keeps top K products per category

### Core Model
- Product can belong to multiple categories
- For each category, maintain a sorted ranking by weighted sales score
- Score can be simple unit count or a time-decayed metric to reflect recent trends

### Storage
- Raw order events in event log / object storage
- Aggregation state in stream processor state store
- Serving store in Redis sorted sets or a low-latency key-value store

### Read Path
- Category page reads precomputed top N product IDs
- Fetch product metadata and inventory from product services

### Trade-offs
- Batch updates are simpler but less fresh
- Streaming updates are fresher but operationally more complex
- Ranking on revenue vs unit count changes incentives and behavior` ,
    mermaidDiagram: `graph LR
  Checkout[Checkout / Order Service] --> Events[Purchase Events]
  Events --> Stream[Stream Aggregator]
  Stream --> Rank[(Category Ranking Store)]
  Stream --> Lake[(Raw Event Lake)]
  Rank --> CategoryAPI[Category Page API]
  CategoryAPI --> Catalog[Product Catalog]
  CategoryAPI --> User[User]`,
    asciiDiagram: `Orders -> Purchase Events -> Stream Aggregation -> Ranking Store
                                               |
                                               +-> Raw event lake

Category page -> Ranking Store -> Product Catalog -> Response`,
    studyNotes: `## Primer-style notes - Sales Ranking

### Main idea
- Never compute top sellers by scanning all orders on page load
- Precompute rankings continuously and serve from a hot store

### Good interview details
- Use payment-confirmed order events, not cart adds
- Returns and cancellations should emit compensating events
- Time-decayed scores are often more useful than all-time counts

### Scaling pattern
- Partition aggregation by category
- Keep only top K items per category in the serving layer
- Store raw immutable events so rankings can be recomputed if logic changes` ,
  },
]
