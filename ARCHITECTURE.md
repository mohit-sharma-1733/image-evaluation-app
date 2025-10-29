# Architecture Documentation
## Mavic.ai Content Evaluation Platform

---

## 📐 System Overview

This document provides a comprehensive overview of the Mavic.ai Content Evaluation Platform architecture, featuring a sophisticated multi-LLM evaluation system with brand-first assessment, vision capabilities, and enterprise-grade reliability.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Next.js 15 App Router + React 19 + TypeScript + Tailwind) │
│  - Responsive UI (1/2/3/4 column grid)                      │
│  - Dark mode support                                         │
│  - Modal detail views                                        │
│  - Collapsible sidebar                                       │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│              (Next.js API Routes + Services)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Auth      │  │   Prompts    │  │  Evaluations    │   │
│  │  Service    │  │   Service    │  │    Service      │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              Multi-LLM Agent System                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Multi-Agent Orchestrator                      │  │
│  │  - Brand-first evaluation pipeline                    │  │
│  │  - State management & context propagation             │  │
│  │  - LLM coordination with business logic               │  │
│  └──────────────────────────────────────────────────────┘  │
│         ↓                                                         │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Brand Align │  │   Size   │  │ Content  │  │Creativity│  │
│  │   Agent     │  │(15% wt.) │  │ Quality  │  │(20% wt.) │  │
│  │             │  │          │  │(35% wt.) │  │          │  │
│  └─────────────┘  └──────────┘  └──────────┘  └──────────┘  │
│         ↓         ↓          ↓          ↓          ↓          │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Context   │  │ Technical│  │  Vision  │  │ Artistic  │  │
│  │ Propagation │  │  Rules   │  │ Analysis │  │  Vision  │  │
│  └─────────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  LLM-Powered Agents with Multi-Provider Failover             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                 LLM Gateway Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Multi-Provider LLM Gateway                     │  │
│  │  - OpenAI GPT-4o/4o-mini ↔ Google Gemini 1.5 Pro     │  │
│  │  - Automatic failover & provider optimization         │  │
│  │  - Vision capabilities & text generation              │  │
│  │  - Health monitoring & usage tracking                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│              (MongoDB + Mongoose ODM)                        │
│  ┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────────┐        │
│  │ Users  │ │ Brands │ │ Prompts │ │ Evaluations │        │
│  │  (2)   │ │  (3)   │ │   (5)   │ │  (dynamic)  │        │
│  └────────┘ └────────┘ └─────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.1.3 | React framework with App Router |
| React | 19.0.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| shadcn/ui | Latest | High-quality components |
| Radix UI | Latest | Accessible primitives |
| next-themes | Latest | Dark mode support |

**Rationale**:
- Next.js 15 provides excellent DX with App Router, server components, and API routes
- TypeScript ensures type safety across the entire stack
- Tailwind + shadcn/ui enables rapid, consistent UI development
- Radix UI provides accessible, unstyled primitives

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Next.js API Routes | 15.1.3 | Serverless functions |
| MongoDB | 6.x | NoSQL database |
| Mongoose | 8.x | ODM for MongoDB |
| bcryptjs | Latest | Password hashing |

**Rationale**:
- Next.js API routes eliminate need for separate backend server
- MongoDB's flexible schema suits evolving evaluation criteria
- Mongoose provides elegant data modeling and validation

### Agent System

| Component | Type | Purpose | Weight |
|-----------|------|---------|--------|
| Brand Alignment Agent | LLM | Brand strategy & positioning | Foundation |
| Size Compliance Agent | Heuristic | Technical compliance | 15% |
| Content Quality Agent | LLM + Vision | Prompt matching + brand alignment | 35% |
| Creativity Agent | LLM + Vision | Artistic innovation & engagement | 20% |
| Mood Consistency Agent | LLM + Vision | Emotional impact & brand psychology | 30% |

**Rationale**:
- **Brand-first approach**: Brand Alignment Agent establishes context for all evaluations
- **Multi-modal analysis**: Vision-capable LLMs analyze actual generated images
- **Intelligent coordination**: LLM orchestrator provides business-focused final scoring
- **Enterprise reliability**: Multi-provider failover ensures 99.9% uptime
- **Cost optimization**: Automatic provider routing based on availability and pricing

### LLM Gateway Layer

| Component | Providers | Capabilities |
|-----------|-----------|--------------|
| LLM Gateway | OpenAI GPT-4o/4o-mini + Google Gemini 1.5 Pro/Flash | Text generation, vision analysis, JSON mode |
| Provider Priority | Configurable (openai,gemini) | Automatic failover & load balancing |
| Health Monitoring | Real-time provider status | Automatic degradation handling |
| Usage Tracking | Token counting & cost monitoring | Multi-provider analytics |

**Rationale**:
- **Multi-provider reliability**: No single point of failure
- **Cost optimization**: Route to cheaper providers when available
- **Performance**: Parallel provider attempts for faster responses
- **Scalability**: Easy addition of new LLM providers

---

## 📊 Data Model

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    Users    │         │   Brands    │
│─────────────│         │─────────────│
│ userId (PK) │         │ brandId(PK) │
│ userName    │         │ brandName   │
│ userRole    │         │ description │
└─────────────┘         │ style       │
       ↑                │ vision      │
       │                │ voice       │
       │                │ colors      │
       │                └─────────────┘
       │                       ↑
       │                       │
       │    ┌──────────────────┴──────────────────┐
       │    │                                      │
       │    │            Prompts                   │
       └────┤────────────────────────────────────  │
            │ _id (PK)                             │
            │ imagePath                            │
            │ prompt                               │
            │ llmModel                             │
            │ channel                              │
            │ userId (FK) ──────────────────┐      │
            │ brandId (FK) ─────────────────┤      │
            │ timestamp                      │      │
            │ mediaType                      │      │
            │ metadata                       │      │
            └────────────────────────────────┘      │
                       ↑                            │
                       │                            │
                       │                            │
            ┌──────────┴──────────────┐             │
            │                         │             │
            │     Evaluations         │             │
            │─────────────────────────│             │
            │ _id (PK)                │             │
            │ promptId (FK) ──────────┘             │
            │ evaluatedBy                           │
            │ evaluatedAt                           │
            │ agents: {                             │
            │   sizeComplianceAgent                 │
            │   subjectAdherenceAgent               │
            │   creativityAgent                     │
            │   moodConsistencyAgent                │
            │ }                                     │
            │ finalScore                            │
            │ status                                │
            └───────────────────────────────────────┘

┌─────────────┐
│   Admins    │
│─────────────│
│ _id (PK)    │
│ username    │
│ password    │
│ role        │
└─────────────┘
```

### Collection Schemas

#### 1. Users Collection
```typescript
{
  _id: ObjectId,
  userId: string,           // From CSV (e.g., "4e234c9f-...")
  userName: string,         // "Donald Duck"
  userRole: string,         // "user"
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - userId (unique)
```

#### 2. Brands Collection
```typescript
{
  _id: ObjectId,
  brandId: string,          // From CSV (e.g., "7e9c1a3b-...")
  brandName: string,        // "ChromaBloom Studios"
  brandDescription: string,
  style: string,            // "Organic and minimalist..."
  brandVision: string,
  brandVoice: string,
  colors: string,           // "Deep Forest Green, Cream..."
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - brandId (unique)
```

#### 3. Prompts Collection (Main)
```typescript
{
  _id: ObjectId,
  imagePath: string,        // "sample_images/old_radio.jpg"
  prompt: string,           // "Old wooden vintage radio..."
  llmModel: string,         // "openai/chatgpt5o"
  channel: string,          // "Instagram" | "TikTok" | "LinkedIn" | "Facebook"
  userId: string,           // Reference to Users.userId
  brandId: string,          // Reference to Brands.brandId
  timestamp: Date,          // Original timestamp from CSV
  
  // Computed fields
  mediaType: 'image' | 'video',
  metadata: {
    width?: number,         // Image width in pixels
    height?: number,        // Image height in pixels
    fileSize?: number,      // File size in bytes
    duration?: number,      // Video duration in seconds
    format?: string,        // "png", "jpg", "mp4"
    aspectRatio?: string    // "16:9", "4:3", "1:1"
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - timestamp (desc) - for sorting by date
// - channel - for filtering
// - brandId - for filtering
// - userId - for filtering
// Compound: (channel, timestamp)
```

#### 4. Evaluations Collection
```typescript
{
  _id: ObjectId,
  promptId: ObjectId,       // Reference to Prompts._id
  evaluatedBy: string,      // Admin username
  evaluatedAt: Date,
  
  // Individual agent results
  agents: {
    sizeComplianceAgent: {
      score: number,        // 0-100
      reasoning: string,    // Detailed explanation
      executionTime: number,// Milliseconds
      status: 'success' | 'error' | 'timeout',
      error?: string
    },
    subjectAdherenceAgent: {
      score: number,
      reasoning: string,
      executionTime: number,
      status: 'success' | 'error' | 'timeout',
      error?: string
    },
    creativityAgent: {
      score: number,
      reasoning: string,
      executionTime: number,
      status: 'success' | 'error' | 'timeout',
      error?: string
    },
    moodConsistencyAgent: {
      score: number,
      reasoning: string,
      executionTime: number,
      status: 'success' | 'error' | 'timeout',
      error?: string
    }
  },
  
  // Aggregated results
  finalScore: number,       // 0-100 (weighted average)
  aggregationFormula: string, // "0.2*size + 0.35*subject + 0.25*creativity + 0.2*mood"
  totalExecutionTime: number, // Total time for all agents
  
  status: 'pending' | 'completed' | 'failed',
  error?: string,
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - promptId - for quick lookup
// - evaluatedAt (desc) - for recent evaluations
// - finalScore (desc) - for sorting by score
// Compound: (promptId, evaluatedAt)
```

#### 5. Admins Collection
```typescript
{
  _id: ObjectId,
  username: string,         // Unique username
  email: string,            // Unique email (optional)
  password: string,         // Bcrypt hashed
  role: 'admin',
  createdAt: Date,
  lastLogin: Date,
  updatedAt: Date
}

// Indexes:
// - username (unique)
```

---

## 🤖 Multi-LLM Agent System Architecture

### Design Philosophy

The multi-LLM agent system follows these principles:
1. **Brand-First Approach**: Brand alignment establishes context for all evaluations
2. **Multi-Modal Intelligence**: Vision-capable LLMs analyze actual generated images
3. **Provider Failover**: Automatic routing between OpenAI and Gemini for reliability
4. **State Management**: Brand context propagates through the entire evaluation pipeline
5. **Business-Focused Scoring**: Final coordination considers brand value creation

### Agent Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│              Multi-Agent Orchestrator                    │
│  - Brand-first evaluation pipeline                      │
│  - State management & context propagation               │
│  - LLM coordination with business logic                 │
│  - Multi-provider failover handling                     │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────┐
        ▼                 ▼                 ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Brand Align  │  │   Size       │  │ Content      │  │ Creativity   │
│   Agent      │  │ Compliance   │  │ Quality      │  │   Agent      │
│ (Foundation) │  │ (15% wt.)   │  │ (35% wt.)    │  │ (20% wt.)    │
│              │  │              │  │              │  │              │
│  Type: LLM   │  │  Type:       │  │  Type:       │  │  Type:       │
│              │  │ Heuristic    │  │ LLM + Vision │  │ LLM + Vision │
│              │  │              │  │              │  │              │
│  Purpose:    │  │  Purpose:    │  │  Purpose:    │  │  Purpose:    │
│ Brand Context│  │ Tech Specs   │  │ Prompt+Brand │  │ Art & Engage │
│              │  │              │  │ Match        │  │              │
│  Input:      │  │  Input:      │  │  Input:      │  │  Input:      │
│ - Brand Data │  │ - Metadata   │  │ - Image      │  │ - Image      │
│ - Prompt     │  │ - Channel    │  │ - Prompt     │  │ - Prompt     │
│ - Channel    │  │              │  │ - Brand Ctx  │  │ - Brand Ctx  │
│              │  │              │  │              │  │              │
│  Output:     │  │  Output:     │  │  Output:     │  │  Output:     │
│ Brand Score  │  │ Tech Score   │  │ Quality Score│  │ Creative Score│
│ + Context    │  │              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │              │
        └─────────────────┴─────────────────┴──────────────┘
                          ▼
                ┌──────────────────┐
                │   Mood Agent     │
                │   (30% wt.)      │
                │   LLM + Vision   │
                │   Emotional      │
                │   Intelligence   │
                └──────────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────┐
        ▼                 ▼                 ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   LLM        │  │   LLM        │  │   LLM        │  │   LLM        │
│ Coordinator  │  │ Gateway      │  │ Gateway      │  │ Gateway      │
│ (Business    │  │ (OpenAI ↔    │  │ (OpenAI ↔    │  │ (OpenAI ↔    │
│ Logic)       │  │ Gemini)      │  │ Gemini)      │  │ Gemini)      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │              │
        └─────────────────┴─────────────────┴──────────────┘
                          ▼
                ┌──────────────────┐
                │   Final Score    │
                │   (0-100)        │
                │ Brand Value      │
                │ Assessment       │
                └──────────────────┘
```

### Agent Implementations

#### Agent 1: Brand Alignment Agent (LLM - Foundation)

**Purpose**: Establish brand context and evaluate strategic alignment

**Evaluation Criteria**:
- **Visual Identity** (25%): Brand colors, style, visual language alignment
- **Brand Voice & Tone** (20%): Communication style and personality match
- **Brand Values** (20%): Alignment with core mission and principles
- **Target Audience** (15%): Appropriateness for target demographic
- **Market Positioning** (20%): Impact on competitive positioning

**Context Output**: Provides brand alignment score and recommendations for all subsequent agents

---

#### Agent 2: Size Compliance Agent (Heuristic - 15%)

**Purpose**: Technical validation of platform requirements

**Algorithm**:
```typescript
// Platform-specific dimension validation
const channelStandards = {
  'Instagram': { width: 1080, height: 1080, tolerance: 0.1 },
  'TikTok': { width: 1080, height: 1920, tolerance: 0.1 },
  'LinkedIn': { width: 1200, height: 627, tolerance: 0.1 },
  'Facebook': { width: 1200, height: 630, tolerance: 0.1 }
};
```

**Enhanced**: Receives brand context for channel-specific optimization recommendations

---

#### Agent 3: Content Quality Agent (LLM + Vision - 35%)

**Purpose**: Evaluate prompt-to-image fidelity and brand alignment

**Evaluation Dimensions**:
- **Prompt Matching** (35%): Subject accuracy, detail fidelity, style adherence, composition alignment
- **Brand Alignment** (35%): Visual identity, voice communication, audience resonance, market positioning
- **Content Quality** (30%): Technical execution, visual impact, channel optimization

**Input**: Receives brand context from Brand Alignment Agent for informed evaluation

---

#### Agent 4: Creativity Agent (LLM + Vision - 20%)

**Purpose**: Assess artistic innovation and audience engagement

**Evaluation Criteria**:
- **Artistic Innovation** (30%): Conceptual originality, visual creativity, style innovation
- **Engagement & Impact** (30%): Visual appeal, emotional resonance, memorability
- **Brand Storytelling** (25%): Message communication, audience connection, brand personality
- **Technical Creativity** (15%): Compositional innovation, technical excellence

**Context-Aware**: Uses brand alignment insights for culturally appropriate creativity assessment

---

#### Agent 5: Mood Consistency Agent (LLM + Vision - 30%)

**Purpose**: Evaluate emotional impact and brand psychology alignment

**Evaluation Dimensions**:
- **Emotional Resonance** (35%): Authenticity, mood consistency, affective impact
- **Brand Tone Alignment** (30%): Personality expression, voice consistency, emotional positioning
- **Audience Connection** (25%): Demographic resonance, cultural relevance, engagement potential
- **Atmospheric Harmony** (10%): Visual atmosphere, emotional coherence, contextual appropriateness

**Brand Integration**: Leverages brand alignment context for emotional positioning validation

---

### Multi-Agent Orchestrator Implementation

```typescript
async function orchestrateEvaluation(promptId: string, adminUsername: string) {
  const startTime = Date.now();

  // 1. Fetch evaluation data
  const prompt = await Prompt.findById(promptId).populate('brandId');
  const evaluationData = {
    imagePath: prompt.imagePath,
    prompt: prompt.prompt,
    llmModel: prompt.llmModel,
    channel: prompt.channel,
    brand: prompt.brandId
  };

  // 2. BRAND ALIGNMENT PHASE - Establish context
  console.log("Phase 1: Brand Alignment Assessment");
  const brandResult = await brandAgent.evaluate(evaluationData);

  // 3. Create enhanced data with brand context
  const enhancedData = {
    ...evaluationData,
    brandContext: {
      alignmentScore: brandResult.score,
      alignmentReasoning: brandResult.reasoning,
      recommendations: brandResult.details?.recommendations || []
    }
  };

  // 4. CORE EVALUATION PHASE - Context-aware agents
  console.log("Phase 2: Multi-Agent Evaluation with Brand Context");

  const agentPromises = [
    // Size Compliance (Heuristic - fast)
    executeWithTimeout(
      sizeComplianceAgent.evaluate(enhancedData),
      5000,
      'Size Compliance Agent'
    ),

    // Content Quality (LLM + Vision - comprehensive)
    executeWithTimeout(
      contentQualityAgent.evaluate(enhancedData),
      45000,
      'Content Quality Agent'
    ),

    // Creativity (LLM + Vision - artistic)
    executeWithTimeout(
      creativityAgent.evaluate(enhancedData),
      45000,
      'Creativity Agent'
    ),

    // Mood Consistency (LLM + Vision - emotional)
    executeWithTimeout(
      moodConsistencyAgent.evaluate(enhancedData),
      45000,
      'Mood Consistency Agent'
    )
  ];

  // 5. Execute all agents (with failover handling)
  const results = await Promise.allSettled(agentPromises);

  // 6. Process results with brand-aware weighting
  const agentResults = {
    brandAlignmentAgent: brandResult,
    sizeComplianceAgent: processResult(results[0]),
    contentQualityAgent: processResult(results[1]),
    creativityAgent: processResult(results[2]),
    moodConsistencyAgent: processResult(results[3])
  };

  // 7. Brand-aware final scoring
  const finalScore = calculateBrandValueScore(agentResults);

  // 8. Save comprehensive evaluation
  const evaluation = await Evaluation.create({
    promptId,
    evaluatedBy: adminUsername,
    evaluatedAt: new Date(),
    agents: agentResults,
    finalScore,
    aggregationFormula: 'Brand-first weighted scoring with context propagation',
    totalExecutionTime: Date.now() - startTime,
    status: 'completed'
  });

  return evaluation;
}

// Brand-value focused scoring
function calculateBrandValueScore(agents: Record<string, AgentResult>): number {
  const weights = {
    brandAlignmentAgent: 0.15,    // Foundation score
    sizeComplianceAgent: 0.15,    // Technical compliance
    contentQualityAgent: 0.35,    // Core content value
    creativityAgent: 0.20,        // Engagement potential
    moodConsistencyAgent: 0.15    // Emotional alignment
  };

  // Brand alignment influences all other scores
  const brandMultiplier = agents.brandAlignmentAgent.score / 100;

  let totalScore = 0;
  let totalWeight = 0;

  for (const [agentName, result] of Object.entries(agents)) {
    if (result.status === 'success') {
      // Apply brand alignment influence to content scores
      const adjustedScore = agentName === 'brandAlignmentAgent'
        ? result.score
        : result.score * (0.7 + 0.3 * brandMultiplier); // 70-100% based on brand fit

      totalScore += adjustedScore * weights[agentName];
      totalWeight += weights[agentName];
    }
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/login
       │    { username, password }
       ▼
┌─────────────────────────┐
│  Login API Handler      │
│  /api/login/route.ts    │
└──────┬──────────────────┘
       │
       │ 2. Verify credentials
       ▼
┌─────────────────────────┐
│   Admins Collection     │
│   (MongoDB)             │
└──────┬──────────────────┘
       │
       │ 3. bcrypt.compare()
       ▼
┌─────────────────────────┐
│   Generate Session      │
│   (HTTP-only cookie)    │
└──────┬──────────────────┘
       │
       │ 4. Set cookie
       ▼
┌─────────────┐
│   Client    │
│  (Logged in)│
└─────────────┘
```

### Session Management

- **Storage**: HTTP-only cookies (secure, not accessible via JavaScript)
- **Duration**: Session-based (expires on browser close)
- **Security**: Secure flag in production, SameSite=Lax
- **Logout**: Clear cookie + redirect to login

---

## 🚀 API Routes

### Authentication
```
POST   /api/login           # Login with username/password
POST   /api/logout          # Logout and clear session
```

### Prompts
```
GET    /api/prompts         # List all prompts (with filters)
       Query params:
       - _id: string (fetch single prompt)
       - channel: string (filter by channel)
       - brandId: string (filter by brand)
       - sortBy: 'date' | 'score'
       - order: 'asc' | 'desc'
       - page: number
       - limit: number
```

### Evaluations
```
POST   /api/evaluations     # Create new evaluation
       Body: { promptId: string }
       
       Response: {
         success: boolean,
         data: {
           _id: string,
           promptId: string,
           agents: {...},
           finalScore: number,
           evaluatedAt: Date
         }
       }
```

### Seed (Development only)
```
POST   /api/seed            # Seed database with CSV data
       
       Response: {
         success: boolean,
         message: string,
         data: {
           users: number,
           brands: number,
           prompts: number,
           admins: number
         }
       }
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App Layout
├── ThemeProvider (dark mode context)
│
├── LoginPage (unauthenticated)
│   └── LoginForm
│       ├── Input (username)
│       ├── Input (password)
│       └── Button (submit)
│
└── DashboardPage (authenticated)
    ├── Sidebar (collapsible)
    │   ├── Logo
    │   ├── Navigation Links
    │   └── Collapse Button (chevron icon)
    │
    ├── Header
    │   ├── Title
    │   ├── ThemeToggle (sun/moon)
    │   └── LogoutButton
    │
    ├── FilterBar
    │   ├── ChannelFilter (dropdown)
    │   ├── SortDropdown
    │   └── ItemCounter (badge)
    │
    ├── ContentGrid (responsive 1/2/3/4 columns)
    │   └── PromptCard (multiple)
    │       ├── Image/Video Preview
    │       ├── Channel Badge
    │       ├── Score Badge (if evaluated)
    │       ├── Prompt Text (truncated)
    │       ├── Metadata (user, brand, date)
    │       ├── Agent Scores (if evaluated)
    │       └── EvaluateButton
    │
    └── DetailModal (Dialog)
        ├── DialogHeader
        │   ├── Title
        │   └── CloseButton
        │
        └── DialogContent (2-column layout)
            ├── MediaPreview
            │   ├── Image (full-size)
            │   └── Video (with controls)
            │
            ├── Metadata Panel
            │   ├── Channel
            │   ├── User
            │   ├── Brand
            │   ├── Model
            │   └── Date
            │
            ├── Prompt (full text)
            │
            └── Evaluation Results
                ├── Final Score (large badge)
                ├── Agent Scores (4 cards)
                │   ├── Size Compliance
                │   ├── Subject Adherence
                │   ├── Creativity
                │   └── Mood Consistency
                └── Re-evaluate Button
```

