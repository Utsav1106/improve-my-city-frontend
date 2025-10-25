# Improve My City - Civic Issue Reporting Platform

A modern, comprehensive web application that allows citizens to report, track, and view resolutions of civic issues in their neighborhood. Built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

### Core Features
- **User Authentication**
  - Email/Password login and registration
  - Google OAuth integration
  - Persistent user sessions
  - Admin role support

- **Issue Reporting**
  - Report civic issues with detailed descriptions
  - Category selection (Pothole, Garbage, Streetlight, Water Supply, Drainage, Road Damage, Parks, Other)
  - Priority levels (Low, Medium, High)
  - Location tracking with GPS support
  - Photo upload capability
  - Real-time location capture

- **Issue Tracking**
  - View all reported issues on the dashboard
  - Track personal issues in "My Issues" page
  - Filter by status, category, and priority
  - Sort by newest, oldest, or most popular
  - Real-time status updates

- **Community Engagement**
  - Upvote issues you care about
  - Comment on issues
  - View issue details and history
  - Track issue progress

- **Transparency**
  - Public page showing all resolved issues
  - Statistics dashboard
  - Issue status tracking (Pending, In Progress, Resolved, Closed)

- **Admin Dashboard** (Admin users only)
  - View all issues in a comprehensive table
  - Update issue status
  - Assign priorities
  - Manage all civic complaints

- **AI Chatbot**
  - Rule-based conversational assistant
  - Check complaint status
  - Get help with reporting issues
  - View community statistics
  - Platform guidance

### UI/UX Features
- Modern, gradient-based design
- Responsive layout for all devices
- Interactive cards with hover effects
- Status and priority badges
- Loading states and animations
- Modal dialogs for detailed views
- Real-time updates
- Custom scrollbar styling

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npm run dev
```

The application will open at `http://localhost:5173` (or another port if 5173 is in use).

## 📱 Usage

### Demo Credentials

**Admin Account:**
- Email: `admin@city.com`
- Password: (any password)

**Regular User Account:**
- Email: `john@example.com`
- Password: (any password)

Or create your own account using the registration page!

### Reporting an Issue

1. Click "Report Issue" in the navigation
2. Fill in the issue details:
   - Title and description
   - Category and priority
   - Location (use GPS or enter manually)
   - Add photo URL (optional)
3. Submit the report
4. Track it in "My Issues"

### Tracking Your Issues

1. Navigate to "My Issues"
2. Filter by status, category, or sort preference
3. View details, upvote, and comment
4. Delete pending issues if needed

### Admin Functions (Admin users only)

1. Access the Admin Dashboard from navigation
2. View all issues in a table format
3. Click "Manage" on any issue
4. Update status (Pending → In Progress → Resolved)
5. View detailed statistics

### Using the Chatbot

1. Click the chat icon in the bottom-right corner
2. Ask questions like:
   - "What's my complaint status?"
   - "How do I report an issue?"
   - "Show me community statistics"
3. Get instant responses and guidance

## 🏗️ Project Structure

```
src/
├── api/                    # Mock API services
│   ├── auth.ts            # Authentication API
│   ├── issues.ts          # Issues management API
│   └── mockData.ts        # Mock data
├── components/            # Reusable components
│   ├── Badge.tsx          # Status and priority badges
│   ├── Button.tsx         # Custom button component
│   ├── Card.tsx           # Card wrapper component
│   ├── Chatbot.tsx        # AI chatbot component
│   ├── Input.tsx          # Input and textarea components
│   ├── IssueCard.tsx      # Issue display card
│   ├── Modal.tsx          # Modal dialog component
│   └── Navigation.tsx     # Navigation bar
├── pages/                 # Page components
│   ├── AdminDashboardPage.tsx
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── MyIssuesPage.tsx
│   ├── RegisterPage.tsx
│   ├── ReportIssuePage.tsx
│   └── ResolvedIssuesPage.tsx
├── store/                 # State management
│   └── AuthContext.tsx    # Authentication context
├── types/                 # TypeScript type definitions
│   └── index.ts
├── App.tsx                # Main app component with routing
├── main.tsx               # App entry point
└── index.css              # Global styles
```

## 🎨 Tech Stack

- **Frontend Framework:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Routing:** React Router v7
- **Build Tool:** Vite
- **State Management:** React Context API
- **Mock Backend:** In-memory storage with localStorage

## 🔑 Key Concepts

### Mock Data & API
The application uses mock data and simulated API calls to demonstrate functionality without a real backend. All data is stored in-memory and uses localStorage for persistence.

### Authentication Flow
- User credentials are validated against mock data
- Sessions persist using localStorage
- Protected routes redirect to login if not authenticated
- Admin routes check `user.isAdmin` property

### Issue Lifecycle
1. **Pending** - Newly reported issue
2. **In Progress** - Admin has started working on it
3. **Resolved** - Issue has been fixed
4. **Closed** - Issue was closed

## 🎯 Features Breakdown

### Interactive Elements
- **Upvoting:** Users can upvote issues to show support
- **Commenting:** Add comments to provide updates or ask questions
- **Filtering:** Filter issues by status, category, and priority
- **Sorting:** Sort by newest, oldest, or popularity
- **Real-time Updates:** All actions update the UI immediately

## 🚀 Future Enhancements

- Real backend integration
- Real-time notifications
- Email notifications on status updates
- Advanced chatbot with AI/ML
- Maps integration with Google Maps API
- Image upload to cloud storage
- Advanced analytics dashboard
- User profiles and reputation system
- Neighborhood/area filtering

## 📝 License

This project is created for educational and demonstration purposes.

---

**Built with ❤️ for making cities better, one report at a time!**

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
