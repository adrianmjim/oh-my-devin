# Oh My Devin (`omd`)

An organizational layer on top of the Devin CLI: it turns local Devin sessions
into an organization of agents with functional **roles**, declarative **teams**,
and deliberative **councils**. The Devin CLI supplies the execution engine; Oh My
Devin adds the orchestrator, the organizational structure, and the protocols —
role contracts, context isolation, and verifiable gates.

## Status

Early implementation.

## Requirements

- Node.js >= 22.14
- pnpm (development only — see below)

## Development

Development, build, and test run on pnpm at the version pinned in
`package.json`. No lockfile is committed, so every install resolves from the
manifest's exact pins.

```bash
pnpm install
pnpm test        # unit tier (runs against a devin stub; never spends Devin quota)
pnpm test:e2e    # end-to-end tier (rebuilds, then drives the built CLI; never spends Devin quota)
pnpm build       # compile src/ to dist/

OMD_SMOKE=1 pnpm test:smoke   # gated smoke tier — real Devin CLI, spends Devin quota
```

### Test tiers

`omd` has three test tiers; the default `pnpm test` run spends no Devin quota
and executes no e2e or smoke file:

- **Unit** — colocated `*.spec.ts` files, run in-process against an injectable
  devin stub. `pnpm test` runs this tier and excludes the e2e and smoke files.
- **End-to-end** — `*.e2e.spec.ts`, run by `pnpm test:e2e`, which rebuilds
  `dist/` first and then drives the shipped `omd` binary as a subprocess
  against an on-`PATH` executable devin stub. Black-box and quota-free.
- **Gated smoke** — `*.smoke.spec.ts`, run only by `pnpm test:smoke` with
  `OMD_SMOKE=1` set. This tier exercises the real installed Devin CLI, spends
  Devin quota, and is meant to be run manually against each Devin CLI release.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). All
contributors sign the project's [CLA](CLA.md) on their first pull request.

## License

[MIT](LICENSE)
