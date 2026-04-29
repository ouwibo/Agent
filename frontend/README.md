# Ouwibo Agent - Frontend

A premium Next.js frontend for the Ouwibo AI Agent. Built with TypeScript, Tailwind CSS, and modern React patterns.

## 🎨 Features

- **Modern UI Design** - Dark theme with gradient accents
- **Real-time Chat** - Smooth messaging interface
- **Model Selection** - Choose from 4 AI models
- **Responsive Design** - Mobile-first approach
- **Type-Safe** - Full TypeScript support
- **State Management** - Zustand for simple state
- **API Integration** - Axios with error handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://ouwibo-agent.ouwibo.workers.dev
```

### Development

```bash
npm run dev
```

Visit http://localhost:3000

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run format
```

## 📁 Project Structure

```
frontend/
├── components/          # React components
│   ├── ChatInterface.tsx
│   ├── MessageBubble.tsx
│   ├── ModelSelector.tsx
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── pages/              # Next.js pages
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx       # Landing page
│   └── chat.tsx        # Chat page
├── lib/                # Utilities
│   ├── api.ts          # API client
│   └── store.ts        # Zustand store
├── types/              # TypeScript definitions
│   └── index.ts
├── styles/             # Global styles
│   └── globals.css
├── public/             # Static files
└── tailwind.config.js  # Tailwind configuration
```

## 🎯 Component Overview

### ChatInterface
Main chat component with message handling, model selection, and real-time updates.

### ModelSelector
Button group for selecting between 4 AI models with descriptions.

### MessageBubble
Reusable message component with copy-to-clipboard functionality.

### HeroSection
Landing page hero with CTA and feature highlights.

### FeaturesSection
Showcases key features with icons.

## 🔌 API Integration

The frontend communicates with the backend API:

```typescript
// POST /api/chat
{
  "message": "Hello",
  "model": "qwen3.5-plus"
}

// Response
{
  "model": "qwen3.5-plus",
  "answer": "Hi there!",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 5
  }
}
```

## 📦 Dependencies

- **next** - React framework
- **react** - UI library
- **typescript** - Type safety
- **tailwindcss** - Styling
- **zustand** - State management
- **axios** - HTTP client
- **lucide-react** - Icons

## 🎨 Theming

Custom Tailwind configuration with:
- Dark color scheme
- Gradient accents
- Animation utilities
- Premium spacing scale

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Flexible grid layouts
- Touch-friendly interactions

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

## 📝 License

MIT

Built with ❤️ using Next.js and TypeScript
