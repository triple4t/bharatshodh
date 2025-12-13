# BharatShodh Admin Panel

A modern, professional admin dashboard for managing user approvals and account statuses in the BharatShodh chatbot application.

## Features

✨ **User Management**
- View all users with status filtering
- Search users by email or name
- Approve pending user registrations
- Reject registrations with reason
- Delete user accounts
- View detailed user information

📊 **Dashboard**
- Real-time statistics (total users, pending, approved, rejected, active)
- Monitor active users in the last 30 days
- Track admin count
- Quick access to user management

🔐 **Authentication**
- Secure admin login with JWT tokens
- Automatic session management
- Token-based authorization
- Logout functionality

🎨 **UI/UX**
- Built with React + TypeScript
- Vite for fast development
- TailwindCSS for styling
- Lucide React for icons
- Responsive design for all devices
- Dark theme support

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

1. **Navigate to admin panel directory:**
```bash
cd admin-panel
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Development

### Start development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5174`

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## First Admin Setup

Before using the admin panel, you need to create an admin account:

### Using the Backend Setup Script:
```bash
cd backend
python setup_admin.py
```

Follow the interactive prompts to:
1. Create a new admin account
2. Set username and password
3. List existing admins

**Note:** The first admin is automatically promoted to `super_admin` role, giving them full access to admin management features.

## Usage

### Login
1. Navigate to `http://localhost:5174/login`
2. Enter your admin username and password
3. Click "Sign In"

### Dashboard
Once logged in, you'll see:
- **Stats Cards:** Overview of total users, pending approvals, approved users, rejections, active users, and total admins
- **User Management Table:** All registered users with quick action buttons

### User Actions

#### Approve User (Pending Only)
1. Click the checkmark button in the user's row
2. User will be approved and receive an email notification
3. User can now log in to the application

#### Reject User (Pending Only)
1. Click the X button in the user's row
2. User will be notified of rejection via email
3. User must re-register if they want to use the service

#### View User Details
1. Click the eye icon to open detailed view
2. View all user information including:
   - Email and name
   - Current status (pending/approved/rejected)
   - Registration date
   - Approval/rejection dates
   - Rejection reason (if applicable)
3. Perform actions from the detail modal

#### Delete User
1. Click the trash icon or use delete button in detail modal
2. Confirm the deletion
3. User account is permanently removed

#### Send Email (Approved Users Only)
1. Click the mail button in user details
2. Send messages to approved users

## Admin Features (Super Admin Only)

Super admins have additional capabilities:
- Manage other admin accounts
- Promote/demote admins
- Delete admin accounts
- Access to advanced user management

To become a super admin:
- Be the first admin created in the system, OR
- Have an existing super admin promote you

## API Integration

The admin panel uses these endpoints:

### Authentication
- `POST /api/admin/register` - Create new admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get current admin profile

### Dashboard
- `GET /api/admin/stats` - Get user and admin statistics

### User Management
- `GET /api/admin/users` - List all users (with filtering and search)
- `GET /api/admin/users/{user_id}` - Get user details
- `POST /api/admin/users/{user_id}/approve` - Approve user
- `POST /api/admin/users/{user_id}/reject` - Reject user
- `DELETE /api/admin/users/{user_id}` - Delete user
- `PUT /api/admin/users/{user_id}/toggle-status` - Toggle user status

### Admin Management (Super Admin Only)
- `GET /api/admin/admins` - List all admins
- `DELETE /api/admin/admins/{admin_id}` - Delete admin

## Project Structure

```
admin-panel/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx          # Admin login interface
│   │   └── Dashboard.tsx          # Main admin dashboard
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── services/
│   │   └── api.ts                 # API client and methods
│   ├── App.tsx                    # Main app component with routing
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Vite configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Radix UI** - Accessible components

## Security

- JWT token-based authentication
- Automatic logout on token expiration
- Secure token storage in localStorage
- API interceptors for authorization
- Protected routes for authenticated pages
- CORS-enabled API communication

## Troubleshooting

### "Failed to login" error
- Verify backend server is running on `http://localhost:8000`
- Check credentials are correct
- Ensure admin account exists (run `setup_admin.py` in backend)

### "Connection refused" or API errors
- Start backend: `python main.py` from backend directory
- Verify `VITE_API_BASE_URL` is correctly set
- Check backend is listening on port 8000

### Token expired but not logged out
- Clear browser cache and localStorage
- Log out and log in again
- Restart the admin panel

### Build errors
- Delete `node_modules` and `dist` directories
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Contributing

When making changes:
1. Follow TypeScript best practices
2. Use existing component patterns
3. Maintain consistent styling with TailwindCSS
4. Update this README if adding new features
5. Test locally before committing

## License

This project is part of the BharatShodh chatbot application.
