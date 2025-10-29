# Mavic.ai - AI Content Evaluation Platform

A full-stack Next.js application for evaluating user-generated social media content using a sophisticated multi-agent system with MongoDB persistence.

![Mavic.ai](https://img.shields.io/badge/Mavic.ai-E81784?style=for-the-badge&logo=lightning&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?style=for-the-badge&logo=mongodb)

---

## 🎯 Overview

Mavic.ai is an AI-powered content evaluation platform that allows administrators to:
- View user-generated images and videos with their prompts
- Evaluate content using a 4-agent evaluation system
- Review detailed scores across multiple criteria:
  - **Size Compliance** (20%): Meets requested dimensions
  - **Subject Adherence** (35%): Matches prompt description
  - **Creativity** (25%): Artistic merit and originality
  - **Mood Consistency** (20%): Aligns with brand voice
- Filter and sort evaluations
- Track evaluation history in MongoDB

---

## ✨ Key Features

### 🎨 Modern UI/UX
- **Responsive Design**: Adapts to mobile, tablet, and desktop (1/2/3/4 column grid)
- **Dark Mode**: Full dark mode support with theme toggle
- **Modal Detail View**: Click any card to see full details with video playback
- **Collapsible Sidebar**: Modern chevron icons for expand/collapse
- **Smooth Animations**: 300ms transitions throughout
- **Pointer Cursors**: Visual feedback on interactive elements

### 🤖 Multi-Agent Evaluation
- **4 Deterministic Heuristic Agents** (no LLM dependencies)
- **Parallel Execution**: All agents run simultaneously
- **Detailed Reasoning**: Each agent provides explanation
- **Weighted Scoring**: Final score = 0.2×size + 0.35×subject + 0.25×creativity + 0.2×mood
- **Real-time Updates**: Results update instantly in modal

### 🎬 Media Support
- **Image Display**: PNG, JPG support with lazy loading
- **Video Playback**: Native HTML5 video player with controls
- **Thumbnail Preview**: Optimized card previews
- **Full-size Modal**: Large preview in detail view

### 🔐 Authentication
- **Secure Login**: Session-based authentication
- **Protected Routes**: Dashboard requires authentication
- **HTTP-only Cookies**: Secure session management
- **Demo Credentials**: admin / admin123

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.1.3** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.x** - Type safety
- **Tailwind CSS 3.4.1** - Utility-first styling
- **shadcn/ui** - High-quality components
- **Radix UI** - Accessible primitives
- **next-themes** - Dark mode support

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB 6.x** - NoSQL database
- **Mongoose 8.x** - ODM for MongoDB
- **bcryptjs** - Password hashing

### Agents
- **4 Deterministic Heuristic Agents**
- **No LLM dependencies** - Fast, predictable, cost-effective
- **Parallel execution** - Optimized performance

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MongoDB** 6.x or higher
  - Option 1: [MongoDB Community Edition](https://www.mongodb.com/try/download/community) (local)
  - Option 2: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud - free tier available)

---

## 🚀 Quick Start

### 1. Clone or Navigate to Project

```bash
cd /Users/mohit/Downloads/assessment/image-evaluation-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/image-evaluation
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/image-evaluation

# Environment
NODE_ENV=development
```

### 4. Setup MongoDB

#### Option A: Local MongoDB

1. Start MongoDB service:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

2. Verify connection:
```bash
mongosh
# Should connect to mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `.env.local`
4. Whitelist your IP address in Atlas

### 5. Seed the Database

The application includes sample data (2 users, 3 brands, 5 prompts). Seed the database:

```bash
# Start the dev server first
npm run dev

# In another terminal, seed the database
curl -X POST http://localhost:3000/api/seed
```

**Expected response:**
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "data": {
    "users": 2,
    "brands": 3,
    "prompts": 5,
    "admins": 1
  }
}
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 7. Login

Navigate to http://localhost:3000 and login with:

- **Username**: `admin`
- **Password**: `admin123`

---

## 📁 Project Structure

```
image-evaluation-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── evaluations/          # POST evaluation
│   │   ├── login/                # POST login
│   │   ├── logout/               # POST logout
│   │   ├── prompts/              # GET prompts (with filters)
│   │   └── seed/                 # POST seed database
│   ├── dashboard/                # Dashboard page
│   │   └── page.tsx              # Main dashboard with modal
│   ├── login/                    # Login page
│   │   └── page.tsx              # Login form
│   ├── globals.css               # Global styles + dark mode
│   ├── layout.tsx                # Root layout + metadata
│   └── page.tsx                  # Redirect to login
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── badge.tsx             # Badge component
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── dialog.tsx            # Modal dialog component
│   │   ├── input.tsx             # Input component
│   │   └── label.tsx             # Label component
│   ├── sidebar.tsx               # Collapsible sidebar
│   ├── theme-provider.tsx        # Theme context provider
│   └── theme-toggle.tsx          # Dark mode toggle
│
├── agents/                       # Multi-agent system
│   ├── base-agent.ts             # Base agent interface
│   ├── size-compliance.ts        # Agent 1: Size checking
│   ├── subject-adherence.ts      # Agent 2: Content matching
│   ├── creativity.ts             # Agent 3: Artistic evaluation
│   ├── mood-consistency.ts       # Agent 4: Brand alignment
│   └── orchestrator.ts           # Coordinates all agents
│
├── models/                       # Mongoose models
│   ├── Admin.ts                  # Admin user model
│   ├── Brand.ts                  # Brand model
│   ├── Evaluation.ts             # Evaluation results model
│   ├── Prompt.ts                 # Prompt/content model
│   └── User.ts                   # User model
│
├── lib/                          # Utilities
│   ├── mongodb.ts                # MongoDB connection
│   └── utils.ts                  # Helper functions
│
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
│
├── public/                       # Static files
│   └── sample_images/            # 5 sample images/videos
│
├── ARCHITECTURE.md               # Architecture documentation
├── FINAL_SUMMARY.md              # Complete project summary
└── README.md                     # This file
```

---

## 🎮 Usage Guide

### Login
1. Navigate to http://localhost:3000
2. You'll be redirected to the login page
3. Enter credentials: `admin` / `admin123`
4. Click "Sign In"

### Dashboard
After login, you'll see:
- **Grid of content cards** (1/2/3/4 columns based on screen size)
- **Filters** (by channel: Instagram, TikTok, LinkedIn, Facebook)
- **Sort options** (by date or score)
- **Sidebar** (collapsible with chevron icon)
- **Theme toggle** (sun/moon icon in header)

### View Details
1. **Click any card** to open detailed modal
2. View:
   - Full-size image or video player
   - Complete metadata (channel, user, brand, model, date)
   - Full prompt text
   - Evaluation results (if evaluated)

### Evaluate Content
1. Click **"Evaluate"** button (on card or in modal)
2. Wait for agents to process (~2-3 seconds)
3. View results:
   - Size Compliance: Score + reasoning
   - Subject Adherence: Score + reasoning
   - Creativity: Score + reasoning
   - Mood Consistency: Score + reasoning
   - Final Score: Weighted average (0-100)

### Re-evaluate
- Click **"Re-evaluate"** to run agents again
- Results update in real-time (in modal if open)

### Filter & Sort
- **Filter by Channel**: Select from dropdown
- **Sort by Date**: Newest or oldest first
- **Sort by Score**: Highest or lowest (after evaluations)

### Sidebar
- Click **chevron icon** in sidebar to collapse/expand
- Collapsed: Shows icons only (80px width)
- Expanded: Shows full navigation (256px width)

### Theme Toggle
- Click **sun/moon icon** in header
- Switches between light and dark mode
- Preference saved in localStorage

---

## 🤖 Multi-Agent System

### Agent Architecture

The evaluation system uses 4 specialized deterministic heuristic agents:

#### Agent 1: Size Compliance (20% weight)
**Purpose**: Verify image/video dimensions meet requirements

**Method**:
- Extracts actual dimensions using image metadata
- Compares with channel standards (Instagram: 1080x1080, TikTok: 1080x1920, etc.)
- Calculates deviation percentage
- Scores based on tolerance (100 = perfect, 0 = significant deviation)

**Example**:
```
Image: 1080x1080 (Instagram)
Expected: 1080x1080
Deviation: 0%
Score: 100
```

#### Agent 2: Subject Adherence (35% weight)
**Purpose**: Verify image content matches prompt description

**Method**:
- Parses prompt for key subjects and objects
- Analyzes image for presence of described elements
- Checks brand alignment (colors, style)
- Scores based on match percentage

**Example**:
```
Prompt: "Old wooden vintage radio on white background"
Detected: Radio (✓), Wooden (✓), Vintage style (✓), White background (✓)
Score: 95
```

#### Agent 3: Creativity (25% weight)
**Purpose**: Evaluate artistic creativity and originality

**Method**:
- Analyzes composition quality
- Checks color diversity and harmony
- Evaluates visual complexity
- Assesses uniqueness vs clichés

**Example**:
```
Composition: Rule of thirds applied (✓)
Colors: 8 distinct colors, good harmony (✓)
Complexity: Moderate detail level (✓)
Score: 82
```

#### Agent 4: Mood Consistency (20% weight)
**Purpose**: Verify emotional tone matches brand voice

**Method**:
- Maps brand to expected mood keywords
- Analyzes image atmosphere
- Checks brand color presence
- Validates emotional alignment

**Example**:
```
Brand: ChromaBloom Studios
Expected Mood: Calm, organic, inspirational
Detected Mood: Peaceful, natural, uplifting
Brand Colors: Present (✓)
Score: 88
```

### Scoring Formula

```typescript
finalScore = Math.round(
  (sizeCompliance * 0.20) +      // 20% weight
  (subjectAdherence * 0.35) +    // 35% weight (most important)
  (creativity * 0.25) +          // 25% weight
  (moodConsistency * 0.20)       // 20% weight
)
```

### Score Interpretation
- **90-100**: Excellent - Exceeds expectations
- **80-89**: Good - Meets all criteria well
- **70-79**: Satisfactory - Acceptable with minor issues
- **60-69**: Fair - Needs improvement
- **0-59**: Poor - Significant issues

---

## 📊 Sample Data

### Users (2)
1. **Donald Duck** - Content creator
2. **Goofy Greyhound** - Content creator

### Brands (3)

#### 1. ChromaBloom Studios
- **Industry**: Eco-friendly art supplies
- **Style**: Organic and minimalist
- **Colors**: Deep Forest Green, Cream, Rich Ochre
- **Voice**: Calm, knowledgeable, inspirational

#### 2. PulseForge Fitness
- **Industry**: High-intensity fitness studio
- **Style**: Sleek, aggressive, tech-forward
- **Colors**: Electric Cobalt Blue, Charcoal Grey, Matte Black
- **Voice**: Energizing, challenging, data-driven

#### 3. Æther & Crumb
- **Industry**: Modern-gothic bakery/coffee shop
- **Style**: Rustic meets refined gothic
- **Colors**: Deep Plum, Aged Brass, Warm Tan
- **Voice**: Wry, sophisticated, comforting

### Content (5)
1. **Scientists arguing** - Image (PNG) - Instagram
2. **Man on bridge at sunset** - Video (MP4) - TikTok
3. **Old wooden radio** - Image (JPG) - LinkedIn
4. **Cute squirrel** - Image (PNG) - Instagram
5. **Woman portrait in forest** - Image (PNG) - Facebook

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `NODE_ENV` | Environment | No | `development` |

### Agent Timeouts

Edit `agents/orchestrator.ts` to adjust timeouts:

```typescript
const AGENT_TIMEOUT = 30000; // 30 seconds per agent
```

### Scoring Weights

Edit `agents/orchestrator.ts` to adjust weights:

```typescript
const weights = {
  sizeCompliance: 0.20,      // 20%
  subjectAdherence: 0.35,    // 35%
  creativity: 0.25,          // 25%
  moodConsistency: 0.20      // 20%
};
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoServerError: Authentication failed`

**Solution**:
1. Check `MONGODB_URI` in `.env.local`
2. Verify MongoDB is running: `mongosh`
3. For Atlas, check IP whitelist and credentials

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Image Not Loading

**Error**: `404 Not Found` for images

**Solution**:
1. Verify images are in `public/sample_images/`
2. Check file paths in database match actual files
3. Run seed script again: `curl -X POST http://localhost:3000/api/seed`

### Database Seeding Fails

**Error**: `Failed to seed database`

**Solution**:
1. Ensure MongoDB is running
2. Check `MONGODB_URI` is correct
3. Verify you have write permissions
4. Try dropping the database and seeding again:
```bash
mongosh
use image-evaluation
db.dropDatabase()
exit
curl -X POST http://localhost:3000/api/seed
```

---

## 📈 Performance

### Expected Metrics
- **Dashboard Load**: < 2 seconds
- **Image List**: < 1 second (20 items)
- **Single Evaluation**: 2-3 seconds (4 agents in parallel)
- **Database Query**: < 100ms (with indexes)

### Optimization Tips

1. **Image Optimization**
   - Use Next.js Image component (already implemented)
   - Generate thumbnails for card previews
   - Implement lazy loading (already implemented)

2. **Database Indexing**
   - Indexes on: `timestamp`, `channel`, `brandId`, `userId`
   - Compound indexes for common queries

3. **Caching**
   - Cache evaluation results in MongoDB
   - Use React Query for client-side caching (optional)

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI`
4. Deploy

### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables: `railway variables`
5. Deploy: `railway up`

### Docker (Optional)

```bash
# Build image
docker build -t mavic-ai .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=<uri> \
  mavic-ai
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed system architecture
- **[FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** - Complete project summary
- **[README.md](./README.md)** - This file (setup and usage)

---

## 🤝 Contributing

This is an assessment project. For suggestions or improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is created for assessment purposes.

---

## 👤 Author

**Mohit**
- Assessment Project for Full-Stack Developer Position
- Built with Next.js, TypeScript, MongoDB, and Modern Web Technologies

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for flexible data storage
- shadcn/ui for beautiful components
- Radix UI for accessible primitives
- Tailwind CSS for utility-first styling

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Check [FINAL_SUMMARY.md](./FINAL_SUMMARY.md)

---

**Built with ❤️ using Next.js, TypeScript, and AI**

**Mavic.ai - AI-Powered Content Evaluation Platform**

🚀 **Ready to evaluate content at http://localhost:3000**
