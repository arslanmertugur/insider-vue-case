# Vue 3 Toast Notification Library

A modern, customizable toast notification library built with Vue 3, TypeScript, and Vite.

## Features

- 🎨 Fully customizable toast notifications
- 🎭 Multiple notification types (success, error, warning, info)
- 📍 6 position options
- ⏱️ Auto-dismiss with custom duration or persistent mode
- 🎬 Multiple animation styles (fade, slide, bounce)
- 🎨 Custom colors and styling
- 💾 Preset management
- ⚡ Built with Vue 3 Composition API
- 📦 TypeScript support
- 🧪 Fully tested with Jest

## Installation

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Docker Support

### Quick Start with Docker Compose

#### Development Mode (with hot reload)
```bash
# Start development server
docker-compose up toast-dev

# Access at http://localhost:5173
```

#### Production Mode
```bash
# Start production server
docker-compose up toast-prod

# Access at http://localhost:8080
```

### Manual Docker Commands

#### Build Development Image
```bash
docker build --target development -t insider-toast:dev .
```

#### Build Production Image
```bash
docker build --target production -t insider-toast:prod .
```

#### Run Development Container
```bash
docker run -p 5173:5173 -v ${PWD}/src:/app/src insider-toast:dev
```

#### Run Production Container
```bash
docker run -p 8080:80 insider-toast:prod
```

### Docker Commands Reference

See [docker-commands.md](./docker-commands.md) for complete Docker usage guide.

## Usage

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createToastPlugin } from 'insider-case';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(createToastPlugin({ pinia }));

app.mount('#app');
```

## Project Structure

```
src/
├── components/          # Vue components
│   ├── Toast/          # Toast notification components
│   └── ConfigurationPanel.vue
├── composables/        # Vue composables
├── stores/            # Pinia stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── styles/            # SCSS styles
```

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next generation frontend tooling
- **Pinia** - State management
- **Jest** - Testing framework
- **SCSS** - CSS preprocessor
- **Docker** - Containerization

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint and fix files
- `npm run format` - Format code with Prettier

## License

MIT
