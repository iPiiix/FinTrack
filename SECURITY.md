# Security Policy

## Supported Versions

FinTrack is an open-source project. Security updates are generally applied only to the latest release branch.

| Version | Supported          |
| ------- | ------------------ |
| v2.1.x  | :white_check_mark: |
| < v2.1  | :x:                |

## Reporting a Vulnerability

We take the security of FinTrack seriously. If you discover a security vulnerability, please do NOT report it by creating a public GitHub issue. 

Instead, please send an email to the project maintainers with a description of the issue, the steps you took to reproduce it, and any other relevant information. We will get back to you as soon as possible.

### What to include in your report

* Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of file(s) where the vulnerability occurs
* Location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof of concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

We aim to acknowledge your report within 48 hours. After verifying the issue, we will coordinate with you on the timeline for publishing a fix and releasing an advisory. 

## Local First Architecture

FinTrack is designed with a **local-first** approach. By default, sensitive financial data is stored in a local SQLite database (`fintrack.db`) and is not transmitted to any central server.
*   **AI Integration**: If the AI Advisor is enabled, a summarized, anonymized prompt (without raw transaction details) is sent directly from your server to the OpenAI/Anthropic/Gemini APIs using the API key you provide. 
*   **API Keys**: API keys are encrypted or securely stored in your local database and are never shared with FinTrack's maintainers.
