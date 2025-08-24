# 🤝 Contributing to EventEase

> **Note**: This project demonstrates professional development practices including comprehensive documentation, coding standards, and collaboration workflows suitable for enterprise environments.

Thank you for your interest in contributing to EventEase! We welcome contributions from developers of all skill levels.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Development Setup](#development-setup)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/eventease.git
   cd eventease
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```
5. **Run database setup**:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

## Development Workflow

1. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run dev
   # Test functionality manually
   npm run build  # Ensure it builds without errors
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request** on GitHub

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` types when possible
- Use strict mode configurations

### React/Next.js
- Use functional components with hooks
- Follow Next.js 15 App Router conventions
- Use server components when possible
- Implement proper error boundaries

### Styling
- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use semantic HTML elements
- Ensure accessibility standards (WCAG 2.1)

### Database
- Use Prisma schema definitions
- Write efficient queries
- Handle errors gracefully
- Use transactions for complex operations

## Commit Guidelines

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

### Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(auth): add role-based access control
fix(api): resolve CORS issues in event endpoints
docs(readme): update installation instructions
style(navbar): improve mobile responsive design
refactor(database): optimize user queries
```

## Pull Request Process

### Before Submitting
- [ ] Code follows our styling guidelines
- [ ] Self-review of the code completed
- [ ] Commented on hard-to-understand areas
- [ ] Documentation updated if needed
- [ ] No merge conflicts with main branch

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All existing tests pass
- [ ] New tests added for new features

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
```

### Review Process
1. At least one maintainer review required
2. All CI checks must pass
3. No unresolved conversations
4. Up-to-date with main branch

## Issue Guidelines

### Bug Reports
When reporting bugs, please include:
- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Additional context**: Any relevant information

### Feature Requests
For feature requests, please provide:
- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought about
- **Additional context**: Why is this feature valuable?

## Development Setup

### Database
```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Create database
createdb eventease

# Run migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

### Environment Variables
```bash
# Required variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Useful Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Database operations
npx prisma migrate dev    # Run migrations
npx prisma generate      # Generate client
npx prisma studio        # Database browser
npm run seed            # Seed with test data

# Code quality
npm run lint            # Run ESLint
```

## Questions or Help?

- **Documentation**: Check the README.md first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers directly if needed

---

Thank you for contributing to EventEase! 🎉
