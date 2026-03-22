# Contributing to ClawPilot

Thank you for your interest in contributing to ClawPilot!

## Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/clawpilot.git
cd clawpilot
```

3. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

1. Make your changes
2. Write tests (unit tests for new features)
3. Ensure code compiles:
```bash
# Backend
cd backend/nest-api
npm run build

# Frontend
cd frontend/angular-dashboard
npm run build
```

4. Commit using conventional commits:
```bash
git commit -m "feat(agents): add new agent feature"
git commit -m "fix(auth): resolve login bug"
git commit -m "docs: update README"
```

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update the CHANGELOG.md
4. Submit a pull request to `master` branch

## Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## Questions?

Open an issue for discussion before starting major changes.
