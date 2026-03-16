# Auth Module - JWT Authentication

This module provides JWT-based authentication for ClawPilot.

## Features
- User registration with email/password
- Login with JWT token generation
- Password hashing with bcrypt
- JWT strategy with Passport.js

## API Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login and get JWT token
- GET /api/auth/me - Get current user profile
