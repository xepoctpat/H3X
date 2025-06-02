# fLups Proof Automation: CI/CD Integration Guide

This document describes how to integrate proof automation into your CI/CD pipeline for the fLups project.

## 1. Prerequisites

- Node.js and/or PowerShell available on your build agents
- (Optional) Pandoc for PDF/HTML export

## 2. Recommended Directory Structure

- Place all proof files in the `proof/` folder
- Place automation scripts as `proof/automation.js` and/or `proof/automation.ps1`

## 3. Example GitHub Actions Workflow

```yaml
name: fLups Proof Automation
on:
  push:
    paths:
      - 'proof/**'
  workflow_dispatch:

jobs:
  build-proof:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run Node.js Proof Automation
        run: |
          cd proof
          node automation.js
      - name: (Optional) Export PDF with Pandoc
        run: |
          sudo apt-get update && sudo apt-get install -y pandoc
          cd proof
          pandoc flups-proof-all.md -o flups-proof-all.pdf
      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: flups-proofs
          path: proof/flups-proof-all.*
```

## 4. Local Automation

- Run `node proof/automation.js` or `pwsh proof/automation.ps1` after editing any proof part.
- For PDF export, install Pandoc and run the export command as shown above.

## 5. Tips

- Keep each proof part modular for easy automation and review.
- Use markdown with LaTeX for math, or export to PDF for publication.
- Validate output files in CI before publishing.

---

*This guide is auto-generated. Update as your automation evolves.*
