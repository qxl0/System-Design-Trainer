export interface ReferenceLink {
  id: string
  title: string
  url: string
  note: string
  tags: string[]
  relatedQuestions?: string[]
}

export interface ReferenceSection {
  id: string
  folderId: string
  title: string
  description: string
  links: ReferenceLink[]
}

export interface ReferenceFolder {
  id: string
  title: string
  description: string
  itemIds: string[]
}

export interface ConceptCard {
  id: string
  title: string
  summary: string
  body: string
  tags: string[]
  relatedQuestions?: string[]
}

export interface ConceptGroup {
  id: string
  folderId: string
  title: string
  description: string
  cards: ConceptCard[]
}

export const powersOfTwo = [
  { power: '2^10', exact: '1,024', approx: '1 thousand', unit: '1 KB' },
  { power: '2^20', exact: '1,048,576', approx: '1 million', unit: '1 MB' },
  { power: '2^30', exact: '1,073,741,824', approx: '1 billion', unit: '1 GB' },
  { power: '2^40', exact: '1,099,511,627,776', approx: '1 trillion', unit: '1 TB' },
  { power: '2^50', exact: '1,125,899,906,842,624', approx: '1 quadrillion', unit: '1 PB' },
]

export const latencyNumbers = [
  { label: 'L1 cache reference', value: '0.5 ns' },
  { label: 'Branch mispredict', value: '5 ns' },
  { label: 'L2 cache reference', value: '7 ns' },
  { label: 'Mutex lock/unlock', value: '25 ns' },
  { label: 'Main memory reference', value: '100 ns' },
  { label: 'Compress 1 KB with Zippy', value: '10 us' },
  { label: 'Send 1 KB over 1 Gbps network', value: '10 us' },
  { label: 'Read 4 KB randomly from SSD', value: '150 us' },
  { label: 'Round trip within same datacenter', value: '500 us' },
  { label: 'Read 1 MB sequentially from SSD', value: '1 ms' },
  { label: 'HDD seek', value: '10 ms' },
  { label: 'Cross-Atlantic / cross-continent packet round trip', value: '150 ms' },
]

export const referenceFolders: ReferenceFolder[] = [
  {
    id: 'appendix',
    title: 'appendix',
    description: 'Quick numbers and cheat sheets for estimation.',
    itemIds: ['powers-of-two', 'latency-numbers'],
  },
  {
    id: 'patterns',
    title: 'patterns',
    description: 'Common architecture patterns and trade-offs for system design.',
    itemIds: [
      'caching-patterns',
      'consistency-replication',
      'data-partitioning',
      'load-balancing',
      'rate-limiting',
      'failure-patterns',
    ],
  },
  {
    id: 'playbooks',
    title: 'playbooks',
    description: 'Interview frameworks and structured approaches.',
    itemIds: ['how-to-approach-interviews'],
  },
  {
    id: 'production-systems',
    title: 'production-systems',
    description: 'Real-world architecture writeups and engineering blogs.',
    itemIds: ['real-world-architectures', 'company-architecture-deep-dives', 'engineering-blogs'],
  },
  {
    id: 'foundational-papers',
    title: 'foundational-papers',
    description: 'Primary sources and canonical distributed systems papers.',
    itemIds: ['primary-papers-and-foundational-systems'],
  },
]

export const referenceSections: ReferenceSection[] = [
  {
    id: 'how-to-approach-interviews',
    folderId: 'playbooks',
    title: 'How To Approach Interviews',
    description: 'Use these when you want a repeatable framework before diving into individual designs.',
    links: [
      {
        id: 'system-design-primer',
        title: 'System Design Primer',
        url: 'https://github.com/donnemartin/system-design-primer/blob/master/README.md?plain=1',
        note: 'The original curated primer with topic summaries, interview prompts, and appendix sections.',
        tags: ['primer', 'interview', 'overview'],
      },
      {
        id: 'palantir-interview-guide',
        title: 'How to ace a systems design interview',
        url: 'https://web.archive.org/web/20210505130322/https://www.palantir.com/2011/10/how-to-rock-a-systems-design-interview/',
        note: 'A practical framework for structuring system design interview discussions.',
        tags: ['interview', 'framework'],
      },
      {
        id: 'hired-in-tech-system-design',
        title: 'The system design interview',
        url: 'http://www.hiredintech.com/system-design',
        note: 'A straightforward walkthrough of requirements, estimation, and trade-offs.',
        tags: ['interview', 'estimation', 'tradeoffs'],
      },
      {
        id: 'harvard-scalability-lecture',
        title: 'Scalability Lecture at Harvard',
        url: 'https://www.youtube.com/watch?v=-W9F__D3oY4',
        note: 'A good broad refresher on scaling patterns and bottlenecks.',
        tags: ['scalability', 'video', 'overview'],
      },
    ],
  },
  {
    id: 'real-world-architectures',
    folderId: 'production-systems',
    title: 'Real-World Architectures',
    description: 'Read these to see how large systems actually evolved under production load.',
    links: [
      {
        id: 'twitter-timelines-at-scale',
        title: 'Twitter timelines at scale',
        url: 'https://blog.x.com/engineering/en_us/a/2013/new-tweets-per-second-record-and-how',
        note: 'Timeline fanout, storage, and scale lessons from Twitter engineering.',
        tags: ['feed', 'fanout', 'social'],
        relatedQuestions: ['Design Twitter Feed'],
      },
      {
        id: 'netflix-tech-blog',
        title: 'Netflix Tech Blog',
        url: 'https://netflixtechblog.com/',
        note: 'A broad archive of streaming, resilience, data, and platform architecture articles.',
        tags: ['streaming', 'resilience', 'platform'],
      },
      {
        id: 'uber-engineering',
        title: 'Uber Engineering',
        url: 'https://www.uber.com/blog/engineering/',
        note: 'Marketplace, storage, observability, and platform scaling posts.',
        tags: ['marketplace', 'reliability', 'scalability'],
      },
      {
        id: 'pinterest-engineering',
        title: 'Pinterest Engineering',
        url: 'https://medium.com/pinterest-engineering',
        note: 'Feed, ranking, infrastructure, and product-scale architecture posts.',
        tags: ['ranking', 'feed', 'social'],
        relatedQuestions: ['Design Twitter Feed', 'Design Instagram'],
      },
      {
        id: 'dropbox-tech-blog',
        title: 'Dropbox Tech Blog',
        url: 'https://dropbox.tech/',
        note: 'Storage, sync, metadata, and developer infrastructure lessons.',
        tags: ['storage', 'sync', 'metadata'],
        relatedQuestions: ['Design Google Drive / Dropbox'],
      },
      {
        id: 'discord-engineering',
        title: 'Discord Engineering',
        url: 'https://discord.com/blog/tag/engineering',
        note: 'Good modern references for chat, realtime infra, and voice/video scaling.',
        tags: ['realtime', 'chat', 'websocket'],
      },
      {
        id: 'slack-engineering',
        title: 'Slack Engineering',
        url: 'https://slack.engineering/',
        note: 'Search, reliability, eventing, and collaboration-system architecture.',
        tags: ['search', 'messaging', 'reliability'],
      },
      {
        id: 'cloudflare-blog',
        title: 'Cloudflare Blog',
        url: 'https://blog.cloudflare.com/',
        note: 'Networking, edge, caching, DDoS defense, and global systems design.',
        tags: ['cdn', 'caching', 'networking'],
        relatedQuestions: ['Design a URL Shortener', 'Design a Search Query Cache'],
      },
    ],
  },
  {
    id: 'company-architecture-deep-dives',
    folderId: 'production-systems',
    title: 'Company Architecture Deep Dives',
    description: 'Start here when you want company-specific examples rather than general theory.',
    links: [
      {
        id: 'amazon-builders-library',
        title: 'Amazon Builders Library',
        url: 'https://aws.amazon.com/builders-library/',
        note: 'Amazon’s strongest public source for architecture, operations, and distributed systems lessons.',
        tags: ['amazon', 'distributed-systems', 'operations'],
        relatedQuestions: ['Design Amazon Sales Ranking by Category'],
      },
      {
        id: 'google-research',
        title: 'Google Research',
        url: 'https://research.google/pubs/',
        note: 'Primary papers for systems like MapReduce, Bigtable, GFS, Spanner, and Dapper.',
        tags: ['papers', 'google', 'distributed-systems'],
        relatedQuestions: ['Design a Web Crawler', 'Design a Search Query Cache'],
      },
      {
        id: 'meta-engineering',
        title: 'Meta Engineering',
        url: 'https://engineering.fb.com/',
        note: 'TAO, caching, feed systems, storage, and machine learning infrastructure.',
        tags: ['social-graph', 'feed', 'cache'],
        relatedQuestions: ['Design Twitter Feed', 'Design Instagram', 'Design a Social Graph Service'],
      },
      {
        id: 'linkedin-engineering',
        title: 'LinkedIn Engineering',
        url: 'https://linkedin.github.io/',
        note: 'Kafka, search, recommendation, and data platform design references.',
        tags: ['kafka', 'search', 'recommendations'],
        relatedQuestions: ['Design a Social Graph Service', 'Design Ad Click Event Aggregation'],
      },
      {
        id: 'airbnb-engineering',
        title: 'Airbnb Engineering',
        url: 'https://airbnb.tech/',
        note: 'Search, marketplace, service platform, and frontend/backend scaling.',
        tags: ['search', 'marketplace', 'platform'],
        relatedQuestions: ['Design a Hotel Reservation System'],
      },
      {
        id: 'spotify-engineering',
        title: 'Spotify Engineering',
        url: 'https://engineering.atspotify.com/',
        note: 'Data, recommendation, developer platform, and reliability engineering.',
        tags: ['reliability', 'data', 'recommendation'],
      },
    ],
  },
  {
    id: 'engineering-blogs',
    folderId: 'production-systems',
    title: 'Engineering Blogs',
    description: 'A saved reading list for browsing patterns across multiple teams and companies.',
    links: [
      {
        id: 'stripe-engineering',
        title: 'Stripe Engineering',
        url: 'https://stripe.com/blog/engineering',
        note: 'Payments, APIs, resilience, and developer platform design.',
        tags: ['payments', 'api', 'reliability'],
        relatedQuestions: ['Design a Payment System', 'Design a Digital Wallet'],
      },
      {
        id: 'shopify-engineering',
        title: 'Shopify Engineering',
        url: 'https://shopify.engineering/',
        note: 'Commerce, flash-sale scale, platform engineering, and performance.',
        tags: ['ecommerce', 'performance', 'platform'],
        relatedQuestions: ['Design Amazon Sales Ranking by Category'],
      },
      {
        id: 'doordash-engineering',
        title: 'DoorDash Engineering',
        url: 'https://doordash.engineering/',
        note: 'Dispatch, logistics, marketplace design, and experimentation infrastructure.',
        tags: ['marketplace', 'logistics', 'realtime'],
      },
      {
        id: 'instacart-engineering',
        title: 'Instacart Engineering',
        url: 'https://tech.instacart.com/',
        note: 'Good marketplace and realtime logistics references.',
        tags: ['marketplace', 'realtime', 'delivery'],
      },
      {
        id: 'figma-engineering',
        title: 'Figma Engineering',
        url: 'https://www.figma.com/blog/section/engineering/',
        note: 'Realtime collaboration, multiplayer sync, and browser-heavy architecture.',
        tags: ['realtime', 'collaboration', 'sync'],
      },
      {
        id: 'reddit-engineering',
        title: 'Reddit Engineering',
        url: 'https://www.redditinc.com/blog/topics/engineering',
        note: 'Caching, ranking, search, and feed-style traffic patterns.',
        tags: ['ranking', 'search', 'feed'],
        relatedQuestions: ['Design Twitter Feed', 'Design a Search Query Cache'],
      },
      {
        id: 'datadog-engineering',
        title: 'Datadog Engineering',
        url: 'https://www.datadoghq.com/blog/engineering/',
        note: 'Observability, event pipelines, agents, and time-series systems.',
        tags: ['observability', 'metrics', 'timeseries'],
        relatedQuestions: ['Design Metrics Monitoring and Alerting System'],
      },
      {
        id: 'github-engineering',
        title: 'GitHub Engineering',
        url: 'https://github.blog/engineering/',
        note: 'Scaling a large developer platform with APIs, storage, and CI systems.',
        tags: ['platform', 'api', 'storage'],
      },
    ],
  },
  {
    id: 'primary-papers-and-foundational-systems',
    folderId: 'foundational-papers',
    title: 'Primary Papers And Foundational Systems',
    description: 'Use primary sources when you want to ground system design answers in canonical systems.',
    links: [
      {
        id: 'mapreduce-paper',
        title: 'MapReduce',
        url: 'https://research.google/pubs/pub62/',
        note: 'Foundational batch data processing paper from Google.',
        tags: ['batch', 'mapreduce', 'paper'],
      },
      {
        id: 'bigtable-paper',
        title: 'Bigtable',
        url: 'https://research.google/pubs/pub27898/',
        note: 'Core wide-column datastore paper referenced in many interview discussions.',
        tags: ['bigtable', 'storage', 'paper'],
        relatedQuestions: ['Design Twitter Feed'],
      },
      {
        id: 'gfs-paper',
        title: 'The Google File System',
        url: 'https://research.google/pubs/pub51/',
        note: 'Classic distributed file system design paper.',
        tags: ['filesystem', 'storage', 'paper'],
        relatedQuestions: ['Design Google Drive / Dropbox'],
      },
      {
        id: 'dynamo-paper',
        title: 'Dynamo: Amazon’s Highly Available Key-value Store',
        url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
        note: 'Key primary source for eventual consistency, quorums, and partition tolerance.',
        tags: ['dynamo', 'eventual-consistency', 'paper'],
        relatedQuestions: ['Design a URL Shortener', 'Design a Search Query Cache'],
      },
      {
        id: 'spanner-paper',
        title: 'Spanner',
        url: 'https://research.google/pubs/pub39966/',
        note: 'Globally distributed relational database with externally consistent transactions.',
        tags: ['spanner', 'transactions', 'paper'],
        relatedQuestions: ['Design a Payment System', 'Design a Digital Wallet'],
      },
      {
        id: 'dapper-paper',
        title: 'Dapper',
        url: 'https://research.google/pubs/pub36356/',
        note: 'Canonical distributed tracing infrastructure paper.',
        tags: ['tracing', 'observability', 'paper'],
        relatedQuestions: ['Design Metrics Monitoring and Alerting System'],
      },
    ],
  },
]

export const referenceTables = [
  {
    id: 'powers-of-two',
    folderId: 'appendix',
    title: 'Powers of Two',
    description: 'Useful for fast storage and cardinality estimates in interviews.',
  },
  {
    id: 'latency-numbers',
    folderId: 'appendix',
    title: 'Latency Numbers',
    description: 'Canonical order-of-magnitude timings for reasoning about bottlenecks.',
  },
]

export const conceptGroups: ConceptGroup[] = [
  {
    id: 'caching-patterns',
    folderId: 'patterns',
    title: 'Caching Patterns',
    description: 'How to read from and write to caches relative to the database.',
    cards: [
      {
        id: 'cache-aside',
        title: 'Cache-Aside (Lazy Loading)',
        summary: 'App checks cache first; on miss, loads from DB and populates cache.',
        tags: ['cache', 'redis', 'lazy-loading'],
        relatedQuestions: ['Design a Cache System (Redis)', 'Design Twitter Feed'],
        body: `### How it works
1. **Read**: check cache → hit: return value. Miss: query DB → write to cache → return.
2. **Write**: update DB, then invalidate (or update) the cache entry.

### Pros
- Cache only holds data that is actually requested
- Cache outage is non-fatal — reads fall through to DB

### Cons
- First request after a miss is slow (cold start penalty)
- Window of staleness between a DB write and cache invalidation

### When to use
Read-heavy workloads with tolerable staleness. The default starting pattern for most caches.`,
      },
      {
        id: 'write-through',
        title: 'Write-Through',
        summary: 'Every write goes to cache and DB synchronously before returning to the caller.',
        tags: ['cache', 'consistency', 'write'],
        relatedQuestions: ['Design a Cache System (Redis)'],
        body: `### How it works
On every write: update cache → update DB → return success (both writes complete before responding).

### Pros
- Cache is always consistent with DB (no stale reads immediately after writes)
- Simple mental model

### Cons
- Higher write latency (two synchronous writes per operation)
- Cache fills with data that may never be read (wasted memory unless paired with TTLs)

### When to use
Workloads where reads closely follow writes (user profile, settings). Often paired with cache-aside for reads.`,
      },
      {
        id: 'write-behind',
        title: 'Write-Behind (Write-Back)',
        summary: 'Write to cache only; an async worker flushes dirty entries to DB in batches.',
        tags: ['cache', 'async', 'durability', 'write'],
        body: `### How it works
1. Write lands in cache immediately; caller gets a success response.
2. Background worker collects dirty keys and flushes them to DB in batches.

### Pros
- Very low write latency (no synchronous DB write on the hot path)
- Batching reduces DB write throughput requirements

### Cons
- **Data loss risk**: if cache crashes before flush, uncommitted writes are lost
- More complex to implement (dirty-key tracking, flush scheduling, crash recovery)

### When to use
High-write workloads where brief data loss is acceptable: counters, analytics, view counts. Never for financial transactions.`,
      },
      {
        id: 'read-through',
        title: 'Read-Through',
        summary: 'Cache sits in front of DB; on a miss the cache itself fetches and stores the value.',
        tags: ['cache', 'proxy', 'read'],
        body: `### How it works
App reads only from the cache. On a miss: the cache library/proxy fetches from DB, stores the result, then returns it.

### vs Cache-Aside
- **Cache-aside**: application code is responsible for loading the cache on a miss
- **Read-through**: the cache handles population transparently — app code is simpler

### Pros
- Simpler application code (no explicit load-on-miss logic)
- Consistent cache-miss handling across all callers

### Cons
- Cold start is still slow on first access
- Requires a cache provider that supports read-through natively (e.g., DAX for DynamoDB)

### When to use
Managed caches that support the pattern built-in, or when you want to hide caching complexity from application code.`,
      },
      {
        id: 'cache-stampede',
        title: 'Cache Stampede (Thundering Herd on Cache)',
        summary: 'A popular cache key expires; many threads simultaneously miss and hammer the DB.',
        tags: ['cache', 'thundering-herd', 'availability', 'redis'],
        relatedQuestions: ['Design a Cache System (Redis)', 'Design Twitter Feed'],
        body: `### Why it happens
Key TTL expires → 1,000 concurrent requests all miss → all 1,000 hit DB simultaneously → DB overwhelmed.

### Solution 1 — Mutex / Lock
First thread to miss acquires a lock, loads DB, populates cache. Other threads wait on the lock, then read the cache.
- Trade-off: adds latency for waiting threads.

### Solution 2 — Probabilistic Early Expiration (PER)
Before the TTL expires, proactively re-fetch with increasing probability as expiry approaches.
- No lock required; used by Facebook's cache layer.

### Solution 3 — Staggered TTLs
Add random jitter: **TTL = base + random(0, delta)**. Prevents mass simultaneous expiry across all keys of the same type.

### Solution 4 — Cache Warming
Pre-populate cache on deploy or after a flush before opening traffic.`,
      },
    ],
  },
  {
    id: 'consistency-replication',
    folderId: 'patterns',
    title: 'Consistency & Replication',
    description: 'How distributed systems manage copies of data and guarantee freshness.',
    cards: [
      {
        id: 'strong-vs-eventual',
        title: 'Strong vs Eventual Consistency',
        summary: 'Strong: every read sees the latest write. Eventual: replicas converge but may lag.',
        tags: ['consistency', 'replication', 'distributed-systems'],
        body: `| Model | Guarantee | Latency | Examples |
|---|---|---|---|
| **Strong** | Read always returns latest write | Higher (sync replication) | PostgreSQL, Spanner, ZooKeeper |
| **Causal** | Reads respect cause-effect ordering | Medium | MongoDB (sessions), Cosmos DB |
| **Read-your-writes** | You always read your own writes | Low | Most social apps |
| **Eventual** | All replicas converge; reads may lag | Lowest | Cassandra, DynamoDB, DNS |

### When to choose strong consistency
Financial transactions, inventory counts, leader election — anywhere two clients acting on stale data causes real harm.

### When eventual is fine
Social feeds, view counts, like counts, DNS propagation — brief staleness is invisible to users.`,
      },
      {
        id: 'cap-theorem',
        title: 'CAP Theorem',
        summary: 'During a network partition a system must choose between Consistency and Availability.',
        tags: ['cap', 'consistency', 'availability', 'partition'],
        body: `### The three properties
- **C**onsistency — every read returns the latest write (or an error)
- **A**vailability — every request receives a non-error response (not necessarily the latest data)
- **P**artition tolerance — the system continues operating when nodes cannot communicate

### Why P is non-negotiable
Network partitions happen in any real distributed system. You always have P — so the real choice is **C vs A during a partition**.

| Choice | Behavior during partition | Examples |
|---|---|---|
| **CP** | Returns error or stale-safe read | HBase, ZooKeeper, Spanner |
| **AP** | Returns possibly stale data | Cassandra, DynamoDB, CouchDB |

### Interview tip
CAP applies *during* a partition. In normal operation, well-designed systems deliver both C and A. Don't use CAP to justify weak consistency when no partition exists.`,
      },
      {
        id: 'quorum',
        title: 'Quorum (R + W > N)',
        summary: 'When R + W > N, read and write sets overlap — at least one node has the latest write.',
        tags: ['quorum', 'replication', 'consistency'],
        relatedQuestions: ['Design a Key-Value Store'],
        body: `### Variables
- **N** = total replica count (typically 3)
- **W** = nodes that must ACK a write before returning success
- **R** = nodes that must respond to a read (client takes the latest by timestamp/version)

### Common configurations (N = 3)
| W | R | Consistency | Availability |
|---|---|---|---|
| 3 | 1 | Strong | Low (need all 3 up to write) |
| 2 | 2 | Strong (overlap guaranteed) | Medium |
| 1 | 3 | Strong | Low (need all 3 up to read) |
| 1 | 1 | None (eventual only) | High |

### Key insight
**W + R > N** guarantees overlap: at least one node in every read set holds the latest write. This gives strong consistency without a single leader.`,
      },
      {
        id: 'leader-follower',
        title: 'Leader-Follower Replication',
        summary: 'One leader handles all writes; followers replicate and serve reads.',
        tags: ['replication', 'leader', 'mysql', 'postgres', 'kafka'],
        relatedQuestions: ['Design a Distributed Message Queue'],
        body: `### How it works
- **Leader**: accepts all writes; streams WAL / changelog to followers
- **Followers**: apply changes in order; serve read queries

### Sync vs Async replication
- **Sync**: leader waits for follower ACK before responding — no data loss, higher write latency
- **Async**: leader responds immediately after local write — low latency, follower may lag

### Failover
On leader crash: elect a follower as new leader. Risk with async: promoted follower may be behind — potential data loss.

### Pros / Cons
- ✅ Simple consistency model; reads scale by adding followers
- ❌ Single write path is a throughput ceiling
- ❌ Follower reads may return stale data (replication lag)

### Used by
MySQL, PostgreSQL (streaming replication), Redis Sentinel, Kafka partition leaders`,
      },
      {
        id: 'leaderless-replication',
        title: 'Leaderless Replication',
        summary: 'Any node accepts writes; client writes to W nodes and reads from R nodes in parallel.',
        tags: ['replication', 'dynamo', 'cassandra', 'eventual-consistency'],
        relatedQuestions: ['Design a Key-Value Store'],
        body: `### How it works
No designated leader. Client (or a coordinator node) sends writes to all N replicas in parallel, waits for W ACKs. Reads go to R replicas in parallel; client picks the value with the highest version/timestamp.

### Conflict resolution
- **Last-write-wins (LWW)**: highest timestamp wins — simple, but concurrent writes can be silently dropped
- **Vector clocks**: track causality to detect true conflicts; application resolves them
- **CRDTs**: data types that merge automatically without conflicts (counters, sets)

### Anti-entropy
Background process compares replicas using Merkle trees and syncs missing data.

### Used by
Cassandra, Amazon DynamoDB (original Dynamo paper), Riak, Voldemort`,
      },
    ],
  },
  {
    id: 'data-partitioning',
    folderId: 'patterns',
    title: 'Data Partitioning (Sharding)',
    description: 'Strategies for splitting data across nodes when a single machine is not enough.',
    cards: [
      {
        id: 'hash-sharding',
        title: 'Hash Sharding',
        summary: 'shard = hash(key) % N — distributes keys uniformly across N shards.',
        tags: ['sharding', 'hashing', 'distributed-systems'],
        body: `### How it works
Compute a hash of the partition key and take modulo N shards.
Example: user_id 12345 → hash → 7 → shard 7 % 4 = shard 3.

### Pros
- Even distribution across shards (with a good hash function)
- O(1) lookup — no directory needed

### Cons
- **Resharding pain**: adding or removing shards changes N, invalidating *all* existing key-to-shard mappings — full data migration required
- Range queries span all shards (no locality)

### When to use
Key-value stores, user data by user_id, any workload with point lookups and no range queries.

### Upgrade path
Use **consistent hashing** to avoid the resharding problem — only K/N keys move when N changes by 1.`,
      },
      {
        id: 'range-sharding',
        title: 'Range Sharding',
        summary: 'Keys are divided into contiguous sorted ranges; each shard owns one range.',
        tags: ['sharding', 'range', 'hot-spot', 'time-series'],
        body: `### How it works
Define split points on the sorted key space.
Example: users A–M → shard 1, N–Z → shard 2. Or timestamps Jan–Jun → shard 1, Jul–Dec → shard 2.

### Pros
- Range queries are efficient (scan a single shard)
- Natural for time-series data — partition by day/month
- Easy to rebalance by moving split points

### Cons
- **Hot spots**: if access is skewed (all writes go to the "today" shard), one shard bears all load
- Uneven distribution when key distribution is not uniform

### Mitigating hot spots
- Add a random prefix: **key = random(0,9) + ":" + original_key** — spreads writes but breaks range scans
- Cassandra-style compound partition keys with a bucketing component`,
      },
      {
        id: 'consistent-hashing',
        title: 'Consistent Hashing',
        summary: 'Nodes and keys are placed on a ring; a key routes to the next clockwise node.',
        tags: ['consistent-hashing', 'sharding', 'cdn', 'cassandra', 'redis'],
        relatedQuestions: ['Design a Key-Value Store', 'Design a CDN', 'Design a Cache System (Redis)'],
        body: `### How it works
1. Hash both node identifiers and keys to positions on a ring (0 → 2³²)
2. A key is served by the **first node clockwise** from its position
3. Adding a node only takes keys from its immediate clockwise neighbor
4. Removing a node transfers its keys to the next clockwise neighbor

### Virtual nodes
Each physical node maps to K virtual nodes on the ring (typically K = 100–200). Benefits:
- More even load distribution, especially with heterogeneous hardware
- Gradual, incremental rebalancing when topology changes

### Key property
When N changes by 1, only **K/N keys** move — vs all keys in hash sharding.

### Used by
Cassandra, DynamoDB, Redis Cluster, Memcached (ketama hashing), CDN edge routing`,
      },
      {
        id: 'directory-sharding',
        title: 'Directory-Based Sharding',
        summary: 'A lookup service explicitly maps keys (or key ranges) to shards.',
        tags: ['sharding', 'directory', 'flexibility'],
        body: `### How it works
A central directory (shard map) stores the mapping of key ranges → shard IDs. Clients query the directory (or cache it locally) before every data request.

### Pros
- **Most flexible**: any key can be moved to any shard without changing a hash function
- Supports heterogeneous shards (different capacities)
- Incremental, surgical rebalancing — move one range at a time

### Cons
- Directory is a **potential single point of failure** — mitigate with replication and client-side caching
- Extra network hop per request if directory is not cached

### Used by
Vitess (MySQL sharding), MongoDB config server + mongos router, legacy hand-rolled sharding systems`,
      },
    ],
  },
  {
    id: 'load-balancing',
    folderId: 'patterns',
    title: 'Load Balancing',
    description: 'Algorithms for distributing incoming traffic across a pool of backend servers.',
    cards: [
      {
        id: 'round-robin',
        title: 'Round Robin',
        summary: 'Requests distributed to servers in sequence: 1 → 2 → 3 → 1 → 2 → 3...',
        tags: ['load-balancing', 'round-robin', 'stateless'],
        body: `### How it works
Maintain a pointer into the server list; advance and wrap on each request.

### Weighted Round Robin
Assign weights proportional to server capacity. A server with weight 3 receives 3× the requests of a server with weight 1.

### Pros
- Simple and stateless — no tracking of server state
- Works well when requests are homogeneous and servers are identical

### Cons
- Ignores current server load — a slow or overloaded server still receives its share
- Poor for variable-cost requests (long vs short jobs)

### When to use
Stateless HTTP APIs with uniform request cost and identical server hardware. The right default starting point.`,
      },
      {
        id: 'least-connections',
        title: 'Least Connections',
        summary: 'New request goes to the server with the fewest currently active connections.',
        tags: ['load-balancing', 'dynamic', 'adaptive'],
        body: `### How it works
The LB tracks active connection count per server. On each new request: route to the server with the minimum active connection count.

### Least Response Time variant
Route to the server with fewest connections **and** the lowest average response time — better for mixed-workload environments.

### Pros
- Naturally adapts to slow or overloaded servers (they accumulate connections → receive fewer new ones)
- Better than round robin for variable-cost requests

### Cons
- LB must maintain state (connection counts per server) — slightly more overhead
- Less effective for very short-lived connections where count fluctuates rapidly

### When to use
Long-lived connections (databases, WebSockets), mixed-duration workloads, when servers have different processing speeds.`,
      },
      {
        id: 'sticky-sessions',
        title: 'Sticky Sessions (IP Hash)',
        summary: 'Client IP is hashed to always route to the same backend server.',
        tags: ['load-balancing', 'sticky-sessions', 'stateful'],
        body: `### How it works
**server = hash(client_ip) % N** — same IP always maps to same server.

### Why it's used
Servers that hold session state in local memory require the same client to always hit the same server.

### Problems
- **Uneven distribution**: an entire office behind one NAT IP all hit a single server
- **Failover breaks affinity**: if the assigned server crashes, session state is lost
- **Hard to scale**: adding servers changes N, rerouting existing clients

### Preferred alternative
Make backends **stateless** — store sessions in a shared store (Redis, a database). Then any LB algorithm works, failover is transparent, and scaling is easy.`,
      },
      {
        id: 'lb-consistent-hashing',
        title: 'Consistent Hashing at the LB Layer',
        summary: 'Route by request key so the same key always hits the same cache backend.',
        tags: ['load-balancing', 'consistent-hashing', 'cache', 'cdn'],
        relatedQuestions: ['Design a CDN', 'Design a Cache System (Redis)'],
        body: `### Why round robin breaks caches
If a reverse proxy routes the same URL to different cache nodes on each request, the cache hit rate approaches zero — each node caches its own copy of the same object.

### How consistent hashing fixes it
Hash the request key (URL path, user_id, etc.) to a ring position → always routes to the same cache node → high and stable hit rate.

### Adding / removing cache nodes
Only keys previously owned by the changed node are remapped — all other cache nodes retain their cached data unaffected.

### Used by
CDNs (Cloudflare, Akamai edge routing), nginx upstream hashing (\`hash \$request_uri\`), distributed Memcached and Redis clusters`,
      },
    ],
  },
  {
    id: 'rate-limiting',
    folderId: 'patterns',
    title: 'Rate Limiting',
    description: 'Algorithms for controlling how many requests a client or service can make over time.',
    cards: [
      {
        id: 'fixed-window-counter',
        title: 'Fixed Window Counter',
        summary: 'Count requests per fixed time bucket; reject when the count exceeds the limit.',
        tags: ['rate-limiting', 'redis', 'simple'],
        relatedQuestions: ['Design a Rate Limiter'],
        body: `### How it works
Partition time into fixed windows (e.g., per minute). Track a counter per user per window.

### Redis implementation
\`\`\`
key   = "rl:{user_id}:{floor(now / 60)}"
count = INCR key
EXPIRE key 60
if count > limit → reject
\`\`\`

### Pros
- Extremely simple; very low memory (one integer per user per window)
- O(1) per request

### Cons
- **Boundary burst**: a user can fire \`limit\` requests at 0:59 and \`limit\` more at 1:00 — receiving 2× the intended limit in ~2 seconds

### When to use
Coarse-grained limits where boundary bursting is acceptable (daily API quotas, hourly limits).`,
      },
      {
        id: 'sliding-window-log',
        title: 'Sliding Window Log',
        summary: 'Store the timestamp of every request; count entries within the last N seconds.',
        tags: ['rate-limiting', 'redis', 'sorted-set', 'accurate'],
        relatedQuestions: ['Design a Rate Limiter'],
        body: `### How it works
Store each request timestamp in a sorted set. On each request:
1. Remove all entries older than now − window
2. Count remaining entries
3. If count < limit: add current timestamp and allow
4. Else: reject

### Redis implementation
\`\`\`
ZREMRANGEBYSCORE key 0 (now_ms - window_ms)
count = ZCARD key
if count < limit:
    ZADD key now_ms now_ms
    allow
else: reject
\`\`\`

### Pros
- Perfectly accurate — no boundary burst problem

### Cons
- High memory: stores one entry per request (bad at high traffic volumes)
- More Redis operations per request than other algorithms

### When to use
Low-to-medium traffic with strict per-second accuracy requirements.`,
      },
      {
        id: 'sliding-window-counter',
        title: 'Sliding Window Counter',
        summary: 'Approximate a sliding window using two adjacent fixed-window counters weighted by elapsed time.',
        tags: ['rate-limiting', 'approximation', 'cloudflare'],
        relatedQuestions: ['Design a Rate Limiter'],
        body: `### Formula
**rate ≈ prev_count × (1 − elapsed / window) + curr_count**

Where \`elapsed\` = seconds into the current window.

### Example (window = 60s, limit = 100)
At t = 45s into the current window:
- Previous window count: 80
- Current window count: 30
- Rate ≈ 80 × (1 − 45/60) + 30 = 20 + 30 = **50 → allow**

### Pros
- Low memory: just two counters per user (not per-request timestamps)
- Eliminates boundary bursting with only ~0.003% error vs true sliding window

### Cons
- Slightly approximate — may allow slightly more or fewer than the exact limit

### Used by
Cloudflare's rate limiter. Good for high-traffic APIs where per-request log memory is prohibitive.`,
      },
      {
        id: 'token-bucket',
        title: 'Token Bucket',
        summary: 'Tokens refill at a fixed rate; each request consumes one. Bursts allowed up to bucket capacity.',
        tags: ['rate-limiting', 'burst', 'api', 'aws'],
        relatedQuestions: ['Design a Rate Limiter'],
        body: `### Parameters
- **Rate**: tokens added per second (sustained throughput)
- **Capacity**: maximum tokens the bucket can hold (maximum burst size)

### How it works
- Tokens accumulate up to capacity at the configured rate
- Each request takes 1 token; if bucket is empty → reject (or queue)

### Lazy implementation (no background thread needed)
\`\`\`
tokens = min(capacity, stored_tokens + rate × (now − last_refill))
last_refill = now
if tokens >= 1: tokens -= 1; allow
else: reject
\`\`\`

### Pros
- Allows controlled bursts (good for bursty-but-bounded API clients)
- Low memory: two values per user (token count, last refill timestamp)

### Used by
AWS API Gateway, Stripe, most production API rate limiters`,
      },
      {
        id: 'leaky-bucket',
        title: 'Leaky Bucket',
        summary: 'Requests enter a FIFO queue; processed at a fixed constant output rate. Overflow is dropped.',
        tags: ['rate-limiting', 'queue', 'traffic-shaping'],
        relatedQuestions: ['Design a Rate Limiter'],
        body: `### How it works
Incoming requests enter a bounded FIFO queue. A worker dequeues and processes one request every 1/rate seconds. If the queue is full, new arrivals are dropped (or rejected with 429).

### vs Token Bucket

| | Token Bucket | Leaky Bucket |
|---|---|---|
| Burst handling | Allows burst up to capacity | No burst — constant output |
| Output rate | Variable (up to rate) | Always constant |
| Use case | General API rate limiting | Network traffic shaping |

### Pros
- Output is perfectly smooth — downstream never sees spikes
- Naturally protects slower downstream services

### Cons
- Bursty clients experience higher latency (requests queue instead of being served immediately)
- Stale requests may sit in queue past their useful life`,
      },
    ],
  },
  {
    id: 'failure-patterns',
    folderId: 'patterns',
    title: 'Failure Patterns & Resilience',
    description: 'How distributed systems fail and proven patterns for handling failures gracefully.',
    cards: [
      {
        id: 'circuit-breaker',
        title: 'Circuit Breaker',
        summary: 'After N failures, stop calling the failing service; probe periodically to detect recovery.',
        tags: ['resilience', 'circuit-breaker', 'microservices', 'cascading-failure'],
        relatedQuestions: ['Design a Circuit Breaker'],
        body: `### States
- **Closed** (normal): requests pass through; failures are counted
- **Open** (tripped): all requests fail immediately without calling the dependency
- **Half-Open** (probing): one test request is allowed through; success → close, failure → reopen

### Why it matters
Without a circuit breaker: threads pile up waiting on a slow/dead service → thread pool exhausted → callers also hang → cascade failure.

### Configuration knobs
- **Failure threshold**: N failures in M seconds to trip (e.g., 5 failures in 10s)
- **Open duration**: how long to stay open before probing (e.g., 30s)
- **Success threshold**: K consecutive successes in half-open before closing (e.g., 2)

### Libraries
Resilience4j (Java/Kotlin), Polly (.NET), Hystrix (Netflix, legacy)`,
      },
      {
        id: 'bulkhead',
        title: 'Bulkhead',
        summary: 'Isolate resources per dependency so one slow service cannot exhaust all shared capacity.',
        tags: ['resilience', 'isolation', 'thread-pool', 'microservices'],
        body: `### Analogy
Ship hulls have watertight compartments (bulkheads) — one breach does not sink the ship.

### How it works
Give each downstream dependency its own dedicated resource pool (thread pool, connection pool, or semaphore). A slow dependency fills its own pool, not the shared pool.

### Example
\`\`\`
Payment service:   pool of 20 threads
Inventory service: pool of 10 threads
\`\`\`
If payment service hangs and all 20 threads are blocked, inventory calls are completely unaffected.

### vs Circuit Breaker
- **Bulkhead**: limits the blast radius of a slow service (resource isolation)
- **Circuit breaker**: stops calls to a failing service entirely

Use both together: bulkhead limits resource exhaustion before the circuit trips.`,
      },
      {
        id: 'retry-backoff',
        title: 'Retry with Exponential Backoff + Jitter',
        summary: 'Retry failed requests with doubling delays; add random jitter to prevent synchronized retry storms.',
        tags: ['resilience', 'retry', 'backoff', 'jitter'],
        body: `### Formula
**delay = random(0, min(cap, base × 2^attempt))**

Full jitter variant spreads retries uniformly across the backoff window.

### Why jitter is critical
Without jitter: all N clients fail at the same instant, all retry at the same intervals → synchronized wave overwhelms a recovering service → it fails again → repeat.

### Example (base = 100ms, cap = 30s)
| Attempt | Max delay | With full jitter |
|---|---|---|
| 1 | 100ms | 0–100ms |
| 2 | 200ms | 0–200ms |
| 3 | 400ms | 0–400ms |
| 4 | 800ms | 0–800ms |

### Requirements
- Only retry **idempotent** operations (GET, PUT with idempotency key — not blind POST)
- Set a **max retry count** to prevent infinite loops
- Log each retry attempt for observability`,
      },
      {
        id: 'thundering-herd',
        title: 'Thundering Herd',
        summary: 'Many clients simultaneously trigger the same expensive operation after a shared state change.',
        tags: ['resilience', 'thundering-herd', 'cache', 'availability'],
        relatedQuestions: ['Design a Cache System (Redis)', 'Design Twitter Feed'],
        body: `### Common triggers
- **Cache expiry**: popular key TTL expires → thousands of concurrent misses → all query DB simultaneously
- **Server restart**: all clients reconnect at the same time → connection storm
- **Cron alignment**: jobs scheduled at :00 fire simultaneously → spike every minute

### Solutions by cause

**Cache expiry → Cache Stampede**
- Mutex: first thread loads DB and populates cache; others wait
- Probabilistic early expiry: re-fetch proactively before TTL expires
- Staggered TTLs: add jitter so keys don't all expire at once

**Reconnection storm**
- Exponential backoff + jitter on client reconnect
- Server-side connection rate limiting with a queue

**Cron alignment**
- Offset each job by a hash of its ID: **offset = hash(job_id) % interval**`,
      },
      {
        id: 'split-brain',
        title: 'Split Brain',
        summary: 'Network partition causes two nodes to each believe they are the primary, accepting conflicting writes.',
        tags: ['distributed-systems', 'split-brain', 'leader-election', 'partition'],
        relatedQuestions: ['Design a Distributed Message Queue', 'Design a Key-Value Store'],
        body: `### How it happens
1. Leader and a follower lose network connectivity
2. Follower's election timeout fires; it promotes itself to leader
3. Both nodes now accept writes → state diverges

### Prevention strategies

**Quorum-based election (Raft, Paxos)**
A node can only become leader if it receives votes from a **majority** of nodes. With N=3, majority=2 — only one partition side can elect a leader.

**Fencing tokens**
Each leader lease carries a monotonically increasing epoch. The storage layer rejects any write whose epoch is lower than the current known epoch — prevents an old leader from writing even if it believes itself active.

**STONITH (Shoot The Other Node In The Head)**
When uncertain, forcibly fence the suspected stale leader (power off, revoke disk access) before promoting a new one.

### Systems with built-in protection
ZooKeeper (Zab), etcd (Raft), Kafka (KRaft) — all require quorum for leader election`,
      },
    ],
  },
]

export const allReferenceLinks = referenceSections.flatMap((section) =>
  section.links.map((link) => ({
    ...link,
    sectionId: section.id,
    sectionTitle: section.title,
    folderId: section.folderId,
  }))
)

export function getReferencesForQuestionTitle(title: string) {
  return allReferenceLinks.filter((link) => link.relatedQuestions?.includes(title))
}

export function getReferenceSection(sectionId: string) {
  return referenceSections.find((section) => section.id === sectionId)
}
