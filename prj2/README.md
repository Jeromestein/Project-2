# Modern Blog Platform

A modern, responsive blog platform with user authentication, content management, and Progressive Web App (PWA) features.

## Features

### Core Features
- **User Authentication**: Secure registration, login, and session management
- **Blog Content Management**: Create, edit, delete, and publish blog posts
- **User Profiles**: Customizable user profiles with avatars and bios
- **Comments System**: Interactive commenting on blog posts
- **Like System**: Users can like/unlike posts
- **Search & Filtering**: Search posts by title, content, and filter by categories/tags
- **Responsive Design**: Mobile-first design that works on all devices

### Advanced Features
- **Progressive Web App (PWA)**: Offline functionality, installable app experience
- **Real-time Updates**: Dynamic content loading without page refresh
- **Security**: JWT authentication, password hashing, input validation
- **Performance**: Optimized loading with caching strategies
- **Modern UI**: Clean, intuitive interface using Bootstrap 5

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Express Session**: Session management

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript (ES6+)**: Modern JavaScript features
- **Bootstrap 5**: Responsive UI framework
- **Font Awesome**: Icon library
- **PWA**: Service Worker and Web App Manifest

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prj2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `config.env.example` to `config.env`
   - Update the configuration values:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/blog_platform
     JWT_SECRET=your_jwt_secret_key_here
     SESSION_SECRET=your_session_secret_key_here
     NODE_ENV=development
     ```

4. **Start MongoDB**
   - If using local MongoDB, ensure the service is running
   - If using MongoDB Atlas, update the connection string in `config.env`

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Posts
- `GET /api/posts` - Get all published posts
- `GET /api/posts/:slug` - Get single post by slug
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment to post
- `GET /api/posts/user/me` - Get user's posts

### Users
- `GET /api/users/profile/:username` - Get user profile
- `GET /api/users/:username/posts` - Get user's posts
- `PUT /api/users/:id` - Update user (admin or self)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/stats/overview` - Get user statistics (admin only)

## Project Structure

```
prj2/
├── models/              # Database models
│   ├── User.js         # User model
│   └── Post.js         # Post model
├── routes/              # API routes
│   ├── auth.js         # Authentication routes
│   ├── posts.js        # Post routes
│   └── users.js        # User routes
├── middleware/          # Custom middleware
│   └── auth.js         # Authentication middleware
├── public/              # Static files
│   ├── css/            # Stylesheets
│   │   └── style.css   # Custom styles
│   ├── js/             # JavaScript files
│   │   ├── app.js      # Main application logic
│   │   ├── auth.js     # Authentication logic
│   │   ├── posts.js    # Posts functionality
│   │   └── dashboard.js # Dashboard functionality
│   ├── images/         # Image assets
│   ├── manifest.json   # PWA manifest
│   ├── sw.js          # Service Worker
│   └── index.html     # Main HTML file
├── server.js           # Express server
├── config.env          # Environment configuration
├── package.json        # Dependencies and scripts
└── README.md          # Project documentation
```

## Usage

### For Blog Readers
1. Visit the homepage to browse published posts
2. Use search and filtering to find specific content
3. Click on posts to read full content
4. Like posts and leave comments (requires registration)
5. View author profiles and their other posts

### For Blog Authors
1. Register an account or login
2. Access your dashboard to manage posts
3. Create new posts with rich content
4. Edit existing posts or save as drafts
5. Monitor post performance (views, likes, comments)
6. Update your profile and avatar

### For Administrators
1. Access user management features
2. View platform statistics
3. Moderate content and users
4. Manage user roles and permissions

## PWA Features

The application includes Progressive Web App features:
- **Offline Support**: Basic functionality works without internet
- **Installable**: Can be installed on mobile devices
- **Fast Loading**: Cached resources for better performance
- **Responsive**: Optimized for all screen sizes

## Security Features

- **Password Hashing**: Secure password storage using bcrypt
- **JWT Authentication**: Stateless authentication tokens
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing configuration
- **Session Management**: Secure session handling
- **Authorization**: Role-based access control

## Performance Optimizations

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Service Worker caching for static assets
- **Lazy Loading**: Dynamic content loading
- **Compression**: Gzip compression for responses
- **Minification**: Optimized CSS and JavaScript

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

**Jiayi Wang**
- Course: WEB602
- Project: Modern Blog Platform with Authentication & PWA Features

## Acknowledgments

- Bootstrap for the responsive UI framework
- Font Awesome for the icon library
- MongoDB for the database solution
- Express.js community for the web framework
