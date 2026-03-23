# CONVENTIONS

This document outlines coding conventions, naming styles, and software patterns in Wafferly.

## Frontend Conventions
- **Language:** TypeScript (.ts and .tsx).
- **Styling:** TailwindCSS is heavily utilized.
- **React Standards:** Functional components with Hooks. React 19 patterns (with Server Components based on Next.js App Router).
- **Naming:** React components are PascalCase. Filenames are usually lowercase (kebab-case) as per standard Next.js constraints or standard component library conventions. CSS and utility properties in Tailwind use standard declarative names.
- **Animations:** Framer Motion is the primary library for animations. Cinematic 3D effects are achieved via custom implementation using OGL. Lenis is employed for global smooth scrolling.
- **Linting:** ESLint with Next.js standards.

## Backend Conventions
- **Language:** Python 3.
- **Structure:** Modular architecture using Flask blueprints for `routes`.
- **Naming:** CamelCase for classes (`Config`, SQLAlchemy models), snake_case for modules, functions, and variables.
- **Typing:** Extensive use of `typing_extensions` hinting.
- **Configuration:** Externalized application secrets using `python-dotenv`.
