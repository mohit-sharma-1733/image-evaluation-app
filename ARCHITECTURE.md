# Architecture Documentation
## Mavic.ai Content Evaluation Platform

---

## 📐 System Overview

This document provides a comprehensive overview of the Mavic.ai Content Evaluation Platform architecture, including system design, data models, agent implementation, and technical decisions.

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
│                   Multi-Agent System                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Evaluation Orchestrator                  │  │
│  │  - Coordinates agent execution                        │  │
│  │  - Handles timeouts (30s per agent)                   │  │
│  │  - Aggregates results                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│         ↓              ↓              ↓              ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Agent A  │  │ Agent B  │  │ Agent C  │  │ Agent D  │  │
│  │   Size   │  │ Subject  │  │Creativity│  │   Mood   │  │
│  │(20% wt.) │  │(35% wt.) │  │(25% wt.) │  │(20% wt.) │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  Deterministic Heuristic Agents (No LLM dependencies)       │
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

| Component | Type | Purpose |
|-----------|------|---------|
| Size Compliance | Heuristic | Dimension validation |
| Subject Adherence | Heuristic | Content matching |
| Creativity | Heuristic | Artistic evaluation |
| Mood Consistency | Heuristic | Brand alignment |

**Rationale**:
- Deterministic heuristics are fast, predictable, and cost-effective
- No LLM dependencies means no API costs or rate limits
- Custom logic provides fine-grained control over evaluation criteria

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

## 🤖 Multi-Agent System Architecture

### Design Philosophy

The multi-agent system follows these principles:
1. **Separation of Concerns**: Each agent has a single, well-defined responsibility
2. **Parallel Execution**: Agents run concurrently for speed
3. **Fault Tolerance**: Individual agent failures don't crash the system
4. **Deterministic Logic**: No LLM dependencies, predictable results
5. **Extensibility**: New agents can be added without modifying existing ones

### Agent Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                  Orchestrator                            │
│  - Coordinates agent execution                           │
│  - Manages timeouts (30s per agent)                      │
│  - Handles errors gracefully                             │
│  - Aggregates results                                    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────┐
        ▼                 ▼                 ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Agent A    │  │   Agent B    │  │   Agent C    │  │   Agent D    │
│     Size     │  │   Subject    │  │  Creativity  │  │     Mood     │
│  Compliance  │  │  Adherence   │  │              │  │ Consistency  │
│              │  │              │  │              │  │              │
│  Type:       │  │  Type:       │  │  Type:       │  │  Type:       │
│  Heuristic   │  │  Heuristic   │  │  Heuristic   │  │  Heuristic   │
│              │  │              │  │              │  │              │
│  Weight:     │  │  Weight:     │  │  Weight:     │  │  Weight:     │
│  20%         │  │  35%         │  │  25%         │  │  20%         │
│              │  │              │  │              │  │              │
│  Input:      │  │  Input:      │  │  Input:      │  │  Input:      │
│  - Metadata  │  │  - Image     │  │  - Image     │  │  - Image     │
│  - Prompt    │  │  - Prompt    │  │  - Prompt    │  │  - Prompt    │
│  - Channel   │  │  - Brand     │  │  - LLM Model │  │  - Brand     │
│              │  │              │  │              │  │              │
│  Output:     │  │  Output:     │  │  Output:     │  │  Output:     │
│  - Score     │  │  - Score     │  │  - Score     │  │  - Score     │
│  - Reasoning │  │  - Reasoning │  │  - Reasoning │  │  - Reasoning │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │              │
        └─────────────────┴─────────────────┴──────────────┘
                          ▼
                ┌──────────────────┐
                │   Aggregator     │
                │  (Weighted Avg)  │
                │                  │
                │  Formula:        │
                │  0.20 * size +   │
                │  0.35 * subject +│
                │  0.25 * creative+│
                │  0.20 * mood     │
                └──────────────────┘
                          ▼
                ┌──────────────────┐
                │   Final Score    │
                │   (0-100)        │
                └──────────────────┘
```

### Agent Implementations

#### Agent A: Size Compliance Agent (Heuristic - 20%)

**Purpose**: Verify image/video dimensions meet requirements

**Algorithm**:
```typescript
async function evaluateSizeCompliance(data: EvaluationData): Promise<AgentResult> {
  // 1. Extract actual dimensions
  const { width, height } = await getImageMetadata(data.imagePath);
  
  // 2. Get expected dimensions based on channel
  const channelStandards = {
    'Instagram': { width: 1080, height: 1080, tolerance: 0.1 },
    'TikTok': { width: 1080, height: 1920, tolerance: 0.1 },
    'LinkedIn': { width: 1200, height: 627, tolerance: 0.1 },
    'Facebook': { width: 1200, height: 630, tolerance: 0.1 }
  };
  
  const expected = channelStandards[data.channel];
  
  // 3. Calculate deviation
  const widthDeviation = Math.abs(width - expected.width) / expected.width;
  const heightDeviation = Math.abs(height - expected.height) / expected.height;
  const avgDeviation = (widthDeviation + heightDeviation) / 2;
  
  // 4. Score based on deviation
  let score = 100;
  if (avgDeviation > expected.tolerance) {
    score = Math.max(0, 100 - (avgDeviation * 200));
  }
  
  return {
    score: Math.round(score),
    reasoning: `Image dimensions: ${width}x${height}. Expected: ${expected.width}x${expected.height}. Deviation: ${(avgDeviation * 100).toFixed(1)}%`,
    executionTime: Date.now() - startTime,
    status: 'success'
  };
}
```

**Advantages**:
- Fast (no external API calls)
- Deterministic
- No cost
- Reliable

---

#### Agent B: Subject Adherence Agent (Heuristic - 35%)

**Purpose**: Verify image content matches prompt description

**Algorithm**:
```typescript
async function evaluateSubjectAdherence(data: EvaluationData): Promise<AgentResult> {
  // 1. Parse prompt for key subjects
  const keywords = extractKeywords(data.prompt);
  
  // 2. Analyze image filename and path for clues
  const filenameMatch = analyzeFilename(data.imagePath, keywords);
  
  // 3. Check brand alignment
  const brandColors = data.brand.colors.toLowerCase();
  const brandStyle = data.brand.style.toLowerCase();
  
  // 4. Calculate match score
  let score = 70; // Base score
  
  // Keyword matching (30 points)
  const keywordScore = (filenameMatch / keywords.length) * 30;
  score += keywordScore;
  
  // Brand alignment check (bonus/penalty)
  if (promptMatchesBrandStyle(data.prompt, brandStyle)) {
    score += 10;
  }
  
  score = Math.min(100, Math.max(0, score));
  
  return {
    score: Math.round(score),
    reasoning: `Found ${filenameMatch}/${keywords.length} key elements. Brand alignment: ${promptMatchesBrandStyle(data.prompt, brandStyle) ? 'Good' : 'Moderate'}`,
    executionTime: Date.now() - startTime,
    status: 'success'
  };
}
```

---

#### Agent C: Creativity Agent (Heuristic - 25%)

**Purpose**: Evaluate artistic creativity and originality

**Algorithm**:
```typescript
async function evaluateCreativity(data: EvaluationData): Promise<AgentResult> {
  let score = 75; // Base score
  
  // 1. Analyze prompt complexity (20 points)
  const promptComplexity = analyzePromptComplexity(data.prompt);
  score += (promptComplexity / 5) * 20;
  
  // 2. Check for creative keywords (10 points)
  const creativeKeywords = ['unique', 'artistic', 'creative', 'original', 'innovative'];
  const hasCreativeKeywords = creativeKeywords.some(kw => 
    data.prompt.toLowerCase().includes(kw)
  );
  if (hasCreativeKeywords) score += 10;
  
  // 3. LLM model quality bonus (5 points)
  if (data.llmModel.includes('gpt') || data.llmModel.includes('gemini')) {
    score += 5;
  }
  
  score = Math.min(100, Math.max(0, score));
  
  return {
    score: Math.round(score),
    reasoning: `Prompt complexity: ${promptComplexity}/5. Creative elements: ${hasCreativeKeywords ? 'Present' : 'Absent'}. Model: ${data.llmModel}`,
    executionTime: Date.now() - startTime,
    status: 'success'
  };
}
```

---

#### Agent D: Mood Consistency Agent (Heuristic - 20%)

**Purpose**: Verify emotional tone matches brand voice

**Algorithm**:
```typescript
async function evaluateMoodConsistency(data: EvaluationData): Promise<AgentResult> {
  // 1. Map brand to expected mood keywords
  const brandMoodMap = {
    'ChromaBloom Studios': ['calm', 'organic', 'inspirational', 'earthy', 'natural'],
    'PulseForge Fitness': ['energizing', 'aggressive', 'motivational', 'dynamic', 'powerful'],
    'Æther & Crumb': ['cozy', 'sophisticated', 'comforting', 'rustic', 'refined']
  };

  const expectedMoods = brandMoodMap[data.brand.brandName] || [];
  
  // 2. Check prompt for mood keywords
  const promptLower = data.prompt.toLowerCase();
  const moodMatches = expectedMoods.filter(mood => 
    promptLower.includes(mood)
  ).length;
  
  // 3. Calculate score
  let score = 70; // Base score
  score += (moodMatches / expectedMoods.length) * 30;
  
  score = Math.min(100, Math.max(0, score));
  
  return {
    score: Math.round(score),
    reasoning: `Brand: ${data.brand.brandName}. Expected moods: ${expectedMoods.join(', ')}. Matches found: ${moodMatches}/${expectedMoods.length}`,
    executionTime: Date.now() - startTime,
    status: 'success'
  };
}
```

---

### Orchestrator Implementation

```typescript
async function orchestrateEvaluation(promptId: string, adminUsername: string) {
  const startTime = Date.now();
  
  // 1. Fetch all required data
  const prompt = await Prompt.findById(promptId)
    .populate('userId')
    .populate('brandId');
  
  if (!prompt) throw new Error('Prompt not found');
  
  // 2. Prepare evaluation data
  const evaluationData: EvaluationData = {
    imagePath: prompt.imagePath,
    prompt: prompt.prompt,
    llmModel: prompt.llmModel,
    channel: prompt.channel,
    brand: prompt.brandId,
    metadata: prompt.metadata
  };
  
  // 3. Execute agents in parallel with timeout
  const agentPromises = [
    executeWithTimeout(
      sizeComplianceAgent(evaluationData),
      30000,
      'Size Compliance Agent'
    ),
    executeWithTimeout(
      subjectAdherenceAgent(evaluationData),
      30000,
      'Subject Adherence Agent'
    ),
    executeWithTimeout(
      creativityAgent(evaluationData),
      30000,
      'Creativity Agent'
    ),
    executeWithTimeout(
      moodConsistencyAgent(evaluationData),
      30000,
      'Mood Consistency Agent'
    )
  ];
  
  // 4. Wait for all agents (or timeout)
  const results = await Promise.allSettled(agentPromises);
  
  // 5. Process results
  const agentResults = {
    sizeComplianceAgent: processResult(results[0]),
    subjectAdherenceAgent: processResult(results[1]),
    creativityAgent: processResult(results[2]),
    moodConsistencyAgent: processResult(results[3])
  };
  
  // 6. Aggregate scores
  const finalScore = aggregateScores(agentResults);
  
  // 7. Save evaluation to MongoDB
  const evaluation = await Evaluation.create({
    promptId,
    evaluatedBy: adminUsername,
    evaluatedAt: new Date(),
    agents: agentResults,
    finalScore,
    aggregationFormula: '0.2*size + 0.35*subject + 0.25*creativity + 0.2*mood',
    totalExecutionTime: Date.now() - startTime,
    status: 'completed'
  });
  
  return evaluation;
}

// Score aggregator
function aggregateScores(agents: Record<string, AgentResult>): number {
  const weights = {
    sizeComplianceAgent: 0.20,
    subjectAdherenceAgent: 0.35,
    creativityAgent: 0.25,
    moodConsistencyAgent: 0.20
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const [agentName, result] of Object.entries(agents)) {
    if (result.status === 'success') {
      totalScore += result.score * weights[agentName];
      totalWeight += weights[agentName];
    }
  }
  
  // Normalize if some agents failed
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

### State Management

```typescript
// Dashboard State
const [prompts, setPrompts] = useState<Prompt[]>([])
const [loading, setLoading] = useState(true)
const [evaluating
