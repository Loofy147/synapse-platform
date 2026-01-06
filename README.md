# Synapse Platform

**Connect • Build • Launch • Scale**

A high-performance startup ecosystem platform connecting founders, freelancers, investors, and collaborators to turn ideas into reality. Built with an optimized database schema, state-of-the-art matching algorithm, and comprehensive infrastructure for idea validation, team building, and investment workflows.

## 🎯 Platform Overview

Synapse is a comprehensive ecosystem platform that facilitates the entire journey from idea validation through team building to securing investment and launching projects. The platform serves four primary user roles with dedicated workflows and dashboards.

### Core Features

- **Multi-Role User System**: Founder, Freelancer, Investor, and Collaborator roles with dedicated dashboards
- **Smart Matching Algorithm**: Weighted scoring system connecting projects with the right people
- **Project Validation**: Quick idea validation ($1) and full project configuration ($5-15)
- **Project Marketplace**: Advanced filtering by stage, investment needs, and team requirements
- **Real-Time Analytics**: Track views, interests, applications, and investor engagement
- **Team Calculator**: Estimate role-based costs for developers, designers, marketing, operations
- **Financial Projections**: Calculate burn rate, runway, break-even timeline, and 3-year forecasts
- **Application Tracking**: Manage applications with integrated communication workflows
- **User Progression**: Skills, badges, level progression, earnings tracking, and collaboration history

## 🏗️ Architecture

### Database Schema (Optimized)

The platform uses a comprehensive relational database with 12 core tables, all properly indexed for performance:

```
Users (id, openId, name, email, userType, role, level, score, earnings, collaborations, investments, projectsCreated, badges, interests, location, website, bio, avatar)
├── UserSkills (userId, skillId, proficiency, yearsOfExperience, hourlyRate)
├── UserBadges (userId, badgeId, earnedAt)
└── UserInterests (userId, interest)

Projects (id, ownerId, ownerName, title, description, problem, solution, targetMarket, stage, status, tags, seekingTeam, seekingInvestment, openForCollaboration, validated, validationScore, marketPotential, feasibility, competition, monthlyBurn, totalInvestmentNeeded, runway, breakEvenMonth, revenueYear1/2/3, views, interests, createdAt, updatedAt)
├── ProjectTeamRequirements (projectId, skillId, minProficiency, minYearsExperience, count, filled)
├── ProjectMilestones (projectId, title, description, dueDate, status)
└── ProjectAnalytics (projectId, date, views, interests, applications, investors)

Applications (id, projectId, userId, applicationType, teamRequirementId, coverLetter, proposedRole, proposedHourlyRate, status, createdAt, respondedAt)

Investments (id, projectId, investorId, amount, status, notes, createdAt, updatedAt)

MatchingHistory (userId, projectId, matchType, score, scoreDetails, action, actionAt)

Skills (id, name, category, description)

Badges (id, name, description, icon, criteria)
```

**Performance Optimizations**:
- Indexed foreign keys for fast joins
- Indexed stage, status, and userType fields for filtering
- Indexed createdAt for sorting
- Indexed validationScore for ranking
- Indexed seekingTeam and seekingInvestment for marketplace filtering

### Matching Algorithm

The advanced matching system uses **weighted scoring** to connect projects with the right people:

**Scoring Components**:
- **Skill Matching (40%)**: Technical fit based on user skills vs project requirements
  - Proficiency level matching (0-60 points)
  - Years of experience matching (0-40 points)
  - Coverage bonus for matching multiple skills
  
- **Investment Matching (25%)**: For investors, alignment with investment amount and stage
  - Funding capacity assessment
  - Stage preference matching
  - Investor experience bonus
  
- **Stage Matching (15%)**: Project stage alignment with user experience level
  - Perfect stage match bonus
  - Adjacent stage acceptance
  - Experience-based scaling
  
- **Interest Matching (15%)**: User interests and project tags alignment
  - Tag-based matching
  - User type alignment with project needs
  
- **Engagement Matching (5%)**: User activity and engagement history
  - Activity level scoring
  - Level progression bonus

**Algorithm Features**:
- Batch matching for recommendations
- Match history tracking for analytics
- Recommendation engine with confidence scores
- Customizable minimum score thresholds

## 🔧 Backend Infrastructure

### tRPC Procedures

The backend uses **tRPC** for type-safe API procedures organized by feature:

**Projects Router**:
- `create`: Create new project with problem/solution
- `getById`: Retrieve project details
- `list`: List projects with filtering (stage, status, seekingTeam, seekingInvestment)
- `update`: Update project information
- `validate`: Validate project idea with scoring
- `configure`: Configure project with financial and team data
- `getUserProjects`: Get user's created projects

**Matching Router**:
- `getRecommendations`: Get recommended projects for user
- `calculateScore`: Calculate match score between user and project

**Applications Router**:
- `submit`: Submit application to project
- `getProjectApplications`: Get applications for a project
- `getUserApplications`: Get user's applications
- `updateStatus`: Update application status

**Investments Router**:
- `recordInterest`: Record investment interest
- `getProjectInvestments`: Get project's investors
- `getUserInvestments`: Get user's investments
- `updateStatus`: Update investment status

**User Router**:
- `updateProfile`: Update user profile information
- `getProfile`: Get user profile
- `addSkill`: Add skill to user profile
- `getSkills`: Get user's skills

**Analytics Router**:
- `trackView`: Track project view
- `getProjectAnalytics`: Get project analytics data

## 💻 Frontend Implementation

### Pages & Components

**Onboarding Page** (`/`):
- Role selection interface
- Platform features overview
- How it works section
- Call-to-action for sign-up

**Profile Setup** (`/profile`):
- Role selection
- Profile information (name, bio, location, website)
- Skills management
- Interest configuration

**Home Dashboard** (`/`):
- User statistics (level, collaborations, badges, earnings)
- Quick action buttons based on user role
- Personalized recommendations
- Navigation to key features

**Role-Specific Dashboards** (`/dashboard`):
- **Founder Dashboard**: Projects created, total views, applications, investors
- **Freelancer Dashboard**: Applications sent, accepted applications, level
- **Investor Dashboard**: Total investments, committed investments, available capital
- **Collaborator Dashboard**: Similar to freelancer dashboard

**Marketplace** (`/marketplace`):
- Project listing with cards
- Advanced filtering (stage, seeking team, seeking investment)
- Search functionality
- Project statistics display

**Project Detail** (`/project/:id`):
- Project overview and description
- Validation scores (overall, market potential, feasibility, competition)
- Financial projections (burn rate, runway, break-even, revenue forecasts)
- Match score for current user
- Application/investment submission forms
- Project information sidebar

### Design System

- **Color Palette**: Purple (#9333EA) and Pink (#EC4899) primary colors with supporting blues, greens, and oranges
- **Typography**: Clean, professional sans-serif with clear hierarchy
- **Components**: shadcn/ui components with Tailwind CSS
- **Responsive**: Mobile-first design with breakpoints for tablet and desktop
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation

## 🚀 Getting Started

### Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL/TiDB database

### Installation

```bash
# Clone the repository
git clone https://github.com/Loofy147/synapse-platform.git
cd synapse-platform

# Install dependencies
pnpm install

# Setup database
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

The platform uses pre-configured environment variables injected by Manus:

- `DATABASE_URL`: MySQL/TiDB connection string
- `JWT_SECRET`: Session cookie signing secret
- `VITE_APP_ID`: Manus OAuth application ID
- `OAUTH_SERVER_URL`: Manus OAuth backend base URL
- `VITE_OAUTH_PORTAL_URL`: Manus login portal URL
- `OWNER_OPEN_ID`, `OWNER_NAME`: Owner's information
- `BUILT_IN_FORGE_API_URL`: Manus built-in APIs
- `BUILT_IN_FORGE_API_KEY`: Bearer token for Manus APIs

## 📊 Key Workflows

### Founder Workflow

1. Sign up and select "Founder" role
2. Create a new project with problem/solution
3. Validate idea (quick scoring)
4. Configure project with financial data and team requirements
5. Browse and hire freelancers
6. Track investor interest
7. Monitor project analytics

### Freelancer Workflow

1. Sign up and select "Freelancer" role
2. Complete profile with skills and experience
3. Browse marketplace for projects
4. View match scores and project details
5. Submit applications to projects
6. Track application status
7. Build collaboration history and earn badges

### Investor Workflow

1. Sign up and select "Investor" role
2. Complete profile with investment preferences
3. Browse marketplace for investment opportunities
4. View match scores and financial projections
5. Express investment interest with amount
6. Track investment status and portfolio
7. Monitor project performance

### Collaborator Workflow

1. Sign up and select "Collaborator" role
2. Complete profile with skills and interests
3. Browse marketplace for co-founder opportunities
4. View match scores and project details
5. Apply to join projects as co-founder
6. Build co-founder relationships
7. Scale projects together

## 🧮 Calculations

### Team Cost Calculator

Estimates monthly costs based on:
- Developer roles (junior, mid, senior)
- Designer roles (UI/UX, product)
- Marketing specialists
- Operations/admin roles
- Custom hourly rates

### Financial Projections

Calculates:
- **Monthly Burn Rate**: Fixed + variable costs
- **Runway**: Months of operation with current capital
- **Break-Even Timeline**: Month when revenue exceeds burn
- **3-Year Revenue Forecast**: Year 1, 2, and 3 projections
- **Total Investment Needed**: Burn rate × runway

## 📈 Analytics

Project owners can track:
- **Views**: Total project page views
- **Interests**: Users who marked project as interesting
- **Applications**: Team member applications received
- **Investor Engagement**: Investment interest expressions
- **Conversion Metrics**: Application acceptance rates
- **Daily Trends**: Analytics by date

## 🔐 Security

- **Authentication**: Manus OAuth integration with session cookies
- **Authorization**: Role-based access control (user, admin)
- **Protected Procedures**: `protectedProcedure` for authenticated endpoints
- **Admin Procedures**: `adminProcedure` for admin-only operations
- **Database Security**: Parameterized queries via Drizzle ORM

## 🧪 Testing

The project includes vitest test suite:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

Key test areas:
- Authentication and logout
- Matching algorithm scoring
- Financial calculations
- Role-based access control
- Marketplace filtering

## 📦 Build & Deployment

```bash
# Type check
pnpm check

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📚 Project Structure

```
synapse-platform/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Onboarding.tsx
│   │   │   ├── ProfileSetup.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   └── ProjectDetail.tsx
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── matching.ts          # Matching algorithm
│   ├── routers.ts           # tRPC procedures
│   ├── db.ts                # Database helpers
│   └── _core/               # Framework infrastructure
├── drizzle/
│   ├── schema.ts            # Database schema
│   └── migrations/          # Database migrations
├── shared/
│   └── const.ts
└── package.json
```

## 🎓 Architecture Decisions

### Why tRPC?

- **Type Safety**: End-to-end type safety from database to frontend
- **Automatic Client**: No manual API client needed
- **Superjson**: Seamless Date and complex type serialization
- **Developer Experience**: Excellent DX with autocomplete and error handling

### Why Drizzle ORM?

- **Type-Safe SQL**: SQL-like queries with TypeScript safety
- **Migrations**: Schema versioning and migration management
- **Performance**: Efficient queries with proper indexing
- **Developer Experience**: Clear, readable query syntax

### Why React + Tailwind?

- **Component Reusability**: Efficient UI development with shadcn/ui
- **Responsive Design**: Mobile-first approach with Tailwind utilities
- **Performance**: Optimized bundle size and rendering
- **Accessibility**: Built-in WCAG compliance with shadcn/ui

## 🔮 Future Enhancements

- Real-time notifications for applications and investments
- Video profiles for users and projects
- Integrated communication platform for team collaboration
- Payment processing for validation and configuration fees
- Advanced analytics with charts and visualizations
- AI-powered project recommendations
- Milestone tracking and progress updates
- Contract management and legal document templates
- Due diligence toolkit for investors
- Exit tracking and success stories

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please contact the Synapse team or visit our documentation.

---

**Built with ❤️ using React, TypeScript, tRPC, Drizzle ORM, and Tailwind CSS**
