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
