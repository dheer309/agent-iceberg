# Oberon

> **Manufacturing AI Thoughts** — A visual AI builder that adapts to how you think, not the other way around.

Oberon is a Next.js application that provides an interactive, visual interface for understanding and exploring AI reasoning processes. The platform transforms complex AI decision-making workflows into intuitive graph visualizations, allowing users to inspect, modify, and regenerate AI reasoning steps in real-time.

## 🎯 Overview

Observable AI reveals how AI models think by visualizing their reasoning steps as an interactive graph. Users can explore every decision, tool call, and branch point in an AI's reasoning process, modify steps, and see how changes cascade through the entire workflow.

### Key Features

- **Interactive Graph Visualization**: Visual representation of AI reasoning processes using ReactFlow
- **Node-Based Architecture**: Different node types for models, tools, branches, and user inputs
- **Real-Time Modification**: Edit reasoning steps and regenerate outcomes instantly
- **Project Management**: Create, manage, and organize multiple AI analysis projects
- **History & Version Control**: Track changes with timeline visualization and restore previous states
- **Audit Logs**: Comprehensive logging for projects and individual nodes
- **Beautiful UI**: Modern, animated interface with gradient effects and smooth transitions

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15.3.0 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Animations**: Framer Motion
- **Graph Visualization**: ReactFlow
- **UI Components**: Radix UI
- **3D Effects**: Three.js / OGL

### Project Structure

```
agent-iceberg/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Landing page
│   ├── create-project/      # Project creation & management
│   ├── project/[id]/        # Individual project workspace
│   │   └── history/         # Project history timeline
│   ├── settings/            # User settings
│   └── api/                 # API routes
│       ├── projects/        # Project CRUD operations
│       └── project/[id]/    # Project-specific endpoints
│           ├── graph/       # Graph data
│           ├── history/     # History management
│           └── node/        # Node operations
├── components/              # React components
│   ├── landing/            # Landing page sections
│   ├── ui/                 # Reusable UI components
│   ├── graph-canvas.tsx   # Main graph visualization
│   ├── project-workspace.tsx
│   ├── project-sidebar.tsx
│   └── ...                 # Various node and panel components
└── lib/                    # Utilities and helpers
    ├── animations.ts       # Framer Motion variants
    ├── mock-projects.ts    # Mock data store
    └── utils.ts           # Shared utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd agent-iceberg
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Landing Page

The landing page features:

- **Hero Section**: Main call-to-action with animated gradient background
- **What Is Section**: Explains the platform's purpose
- **How It Works Section**: Step-by-step guide
- **Interactive Preview**: Live demonstration
- **Why Teams Section**: Use cases and benefits
- **Get Started Section**: Quick start actions
- **Sponsors Section**: Community support

### Creating a Project

1. Click "Build Pipeline" or "Start a New Analysis" from the landing page
2. Enter a project name in the modal
3. Submit your initial prompt or query
4. View the generated reasoning graph

### Working with Projects

- **Graph Canvas**: Interactive visualization of AI reasoning nodes
- **Node Selection**: Click nodes to view details in the right panel
- **Node Modification**: Edit node properties and regenerate
- **History Timeline**: View and restore previous project states
- **Project Sidebar**: Navigate between projects and view project list

### Node Types

- **User Nodes**: Initial user input/prompts
- **Model Nodes**: LLM reasoning steps
- **Tool Nodes**: External tool calls and operations
- **Branch Nodes**: Decision points and conditional logic

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

- **GraphCanvas**: Main graph visualization component using ReactFlow
- **ProjectWorkspace**: Container for project view with sidebars and panels
- **ProjectSidebar**: Left sidebar for project navigation
- **RightPanel**: Details panel for selected nodes
- **HistoryTimeline**: Timeline visualization for project history

## 🎨 Design System

The application uses a custom design system built on:

- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Custom Animations**: Framer Motion for smooth transitions
- **Gradient Effects**: Custom gradient blinds and visual effects

## 📝 API Routes

### Projects

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details

### Project Operations

- `GET /api/project/[id]/graph` - Get project graph data
- `GET /api/project/[id]/history` - Get project history
- `POST /api/project/[id]/history/restore` - Restore project state

### Node Operations

- `GET /api/project/[id]/node/[nodeId]` - Get node details
- `PUT /api/project/[id]/node/[nodeId]/modify` - Modify node
- `DELETE /api/project/[id]/node/[nodeId]/delete` - Delete node
- `GET /api/project/[id]/node/[nodeId]/audit-logs` - Get node audit logs

**Built with ❤️ using Next.js and React**
