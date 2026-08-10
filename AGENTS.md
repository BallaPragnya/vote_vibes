# AGENTS.md

# VoteVibes - AI Development Guide

> This document defines how AI coding agents (AntiGravity, ChatGPT, Claude, Cursor, GitHub Copilot, etc.) should assist with the VoteVibes project.
>
> The primary goal is to maintain a consistent architecture, clean codebase, and professional software engineering practices throughout development.

---

# Project Overview

**Project Name:** VoteVibes

**Tagline**

Transparent • Secure • Verifiable

VoteVibes is a secure college election management platform that enables students to vote digitally while ensuring transparency and integrity through a custom blockchain-based verification system.

The blockchain is **not** the primary database.

The blockchain serves as an immutable verification and audit layer on top of PostgreSQL.

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Zod

---

## Backend

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt

---

## Blockchain

Custom Blockchain

- SHA-256 Hashing
- Previous Hash Linking
- Chain Validation
- Vote Verification

---

# Development Philosophy

Every feature should be:

- Simple
- Secure
- Modular
- Maintainable

Avoid over-engineering.

The project targets a **college election platform**, not a national election infrastructure.

When multiple solutions exist, choose the simplest architecture that satisfies the project requirements.

---

# Core Principles

Always follow:

- SOLID
- DRY
- KISS
- Separation of Concerns
- RESTful API Design
- Feature-Based Development

---

# Repository Workflow

Never modify main directly.

Branch flow

feature/<feature-name>

↓

develop

↓

main

All Pull Requests must target:

develop

Only the Project Lead merges develop into main.

---

# Project Structure

```
votevibes/

backend/

frontend/

docs/
```

Backend

```
src/

config/

controllers/

routes/

middlewares/

services/

repositories/

validators/

utils/

blockchain/

prisma/
```

Frontend

```
src/

pages/

components/

layouts/

hooks/

contexts/

services/

assets/

utils/
```

Never change the project structure without approval.

---

# Backend Rules

Business logic belongs in:

services/

Controllers should only:

- Validate request
- Call services
- Return responses

Database queries belong in:

repositories/

Never place SQL/Prisma logic inside controllers.

---

# Database Rules

Database:

PostgreSQL

ORM:

Prisma

Requirements

- Normalized schema
- UUID primary keys
- Foreign keys
- Audit fields
- Proper indexing

Never introduce redundant tables.

Never bypass Prisma.

---

# Authentication

Use

JWT

bcrypt

RBAC

Roles

- Student
- Election Commission
- Admin

Never store plaintext passwords.

Never expose sensitive fields.

---

# Blockchain Rules

The blockchain exists only to verify votes.

Do NOT replace PostgreSQL with blockchain.

Each block should contain

- Block Number
- Previous Hash
- Current Hash
- Timestamp
- Vote Reference

Hashing

SHA-256

Provide

- Chain Validation
- Tamper Detection
- Blockchain Explorer
- Vote Verification

Keep implementation lightweight and educational.

---

# API Standards

Follow REST conventions.

Example

GET /api/elections

POST /api/elections

PUT /api/elections/:id

DELETE /api/elections/:id

Always

- Validate input
- Return proper HTTP status codes
- Return consistent JSON

Example

{
    "success": true,
    "message": "...",
    "data": {}
}

---

# Error Handling

Never return stack traces.

Always use centralized error handling.

Return

400

401

403

404

409

500

appropriately.

---

# Frontend Rules

Components should be

Reusable

Small

Composable

Avoid duplicate UI.

Prefer reusable components over page-specific implementations.

---

# Naming Conventions

Variables

camelCase

Functions

camelCase

Components

PascalCase

Folders

kebab-case

Constants

UPPER_CASE

Database

snake_case

API Routes

kebab-case

---

# Git Commit Convention

Examples

feat(auth): implement login API

feat(voting): add vote endpoint

fix(ui): correct sidebar alignment

docs: update architecture

refactor(blockchain): simplify hash validation

---

# AI Development Rules

When generating code:

Always

- Follow existing architecture.
- Reuse existing utilities.
- Reuse existing components.
- Reuse middleware.
- Reuse services.

Never

- Duplicate code.
- Introduce new architecture.
- Change folder structure.
- Add unnecessary libraries.
- Break existing APIs.

If an architectural decision is required,

Explain it first.

Do not silently redesign the project.

---

# Security

Always

Validate input.

Sanitize user data.

Hash passwords.

Protect routes.

Verify JWT.

Prevent duplicate voting.

Never expose internal IDs unnecessarily.

---

# Documentation

Every major feature should include

- Purpose
- Implementation Notes
- API Changes
- Database Changes

---

# Team Responsibilities

## Pragnya

Technical Lead

Backend

Database

Authentication

Git Workflow

Architecture

API Reviews

---

## Archan

Frontend

UI

React Components

Responsive Design

API Integration

---

## Sadhvika

Blockchain

Vote Verification

Hashing

Chain Validation

Security Review

---

## Nithya

Testing

Admin Module

Documentation

QA

Bug Verification

---

# Before Every Pull Request

Confirm

✓ Builds successfully

✓ No console errors

✓ No lint errors

✓ Tested locally

✓ No secrets committed

✓ Documentation updated if necessary

✓ Follows project architecture

---

# AI Success Criteria

A generated solution is considered acceptable only if:

- It follows the frozen architecture.
- It introduces no unnecessary complexity.
- It is maintainable.
- It is secure.
- It is readable.
- It is modular.
- It can be understood by every team member.

When uncertain,

Prefer simplicity over cleverness.
