# Contributing to Match-3 Telegram Mini App

First off, thank you for considering contributing to this project! Your help is greatly appreciated.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by the Match-3 Telegram Mini App Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [email@example.com].

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- Use a clear and descriptive title for the issue
- Describe the exact steps which reproduce the problem
- Provide specific examples to demonstrate the steps
- Explain which behavior you expected to see instead
- Include screenshots if relevant

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- Use a clear and descriptive title for the issue
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Explain why this enhancement would be useful

### Pull Requests

- Fill in the provided PR template
- Do not include issue numbers in the PR title
- Include screenshots in your pull request when adding new features
- Follow the coding guidelines below
- Ensure your code passes all tests

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/match3-miniapp.git`
3. Navigate to the project directory: `cd match3-miniapp`
4. Install dependencies: `npm run install:all`
5. Create your feature branch: `git checkout -b feature/amazing-feature`
6. Make your changes
7. Test your changes
8. Commit your changes: `git commit -m 'Add some amazing feature'`
9. Push to the branch: `git push origin feature/amazing-feature`
10. Open a pull request

## Coding Guidelines

### General

- Follow the existing code style and patterns
- Write meaningful commit messages
- Add appropriate comments for complex logic
- Document public APIs with JSDoc comments
- Use meaningful variable and function names

### TypeScript

- Follow the TypeScript style guide
- Use type safety wherever possible
- Prefer const over let when the variable doesn't change
- Use arrow functions in callbacks and event handlers
- Use async/await instead of promises when possible
- Use destructuring when accessing multiple properties of an object

### React

- Use functional components with hooks
- Use TypeScript interfaces for props and state
- Keep components small and focused on a single responsibility
- Use custom hooks for shared logic
- Follow the file naming convention: PascalCase for components

### Git

- Use conventional commits format
- Keep commits small and focused
- Write clear, descriptive commit messages
- Reference issues where appropriate

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in package.json to the new version that this Pull Request would represent. The versioning scheme we use is SemVer.
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

---

Thank you again for your interest in contributing to Match-3 Telegram Mini App!