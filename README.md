# 2025-chromion

## Notes
```
# Frontend
pnpm add @rainbow-me/rainbowkit
pnpm add wagmi viem@2.x @tanstack/react-query

# UI related
pnpm add react-icons

# Frontend testing
pnpm add -D @synthetixio/synpress
pnpm create playwright

# Run frontend tests
pnpm exec playwright test
pnpm exec playwright test --ui
pnpm exec playwright test --headed

# Create cache for frontend tests
pnpm synpress
pnpm synpress tests/wallet-setup
```

## Bugs in dependencies
### Synpress 4.0.5
Reported: https://github.com/Synthetixio/synpress/issues/1285  
**[🐛 Bug]: CLI's wallet-setup cache builder looks for wallet-setup in a different location to docs**  
**Description**  
For wallet-setup config, docs is using `wallet-setup/basic.setup.ts` but `npx synpress` looks in `test/wallet-setup/basic.setup.ts`. Using `tests/` (with letter "s") prefix errors. User can resolve this by specifying the path with `npx synpress tests/wallet-setup`.

**Fix suggestion**  
either:
- (Preferred fix) update docs to instruct users to use `tests/wallet-setup/basic.setup.ts` (this matches the `tests/` directory for `example.spec.ts` in the docs), and then update CLI to look in `tests/` instead of `test/`

or
- update CLI to look in `wallet-setup/` instead of `test/wallet-setup/`.
