# Oh My Devin (`omd`)

An organizational layer on top of the Devin CLI: it turns local Devin sessions
into an organization of agents with functional **roles**, declarative **teams**,
and deliberative **councils**. The Devin CLI supplies the execution engine; Oh My
Devin adds the orchestrator, the organizational structure, and the protocols —
role contracts, context isolation, and verifiable gates.

## Status

Early implementation.

## Usage

Install the in-session layer into a project:

```bash
omd setup
```

A full `omd setup` writes the complete layer into the project: the rules file
(`AGENTS.md`), the canonical trio of roles — `architect`, `executor`, and
`reviewer`, each with its declared output schema — the skills, the hooks, and a
default team declaration at `.devin/teams/default.yaml`. Restrict the install to
a subset with `--scope`, whose components are `rules`, `roles`, `skills`,
`hooks`, and `teams` (for example `omd setup --scope=teams`).

`omd setup` also chooses **where** the layer is written. Run in an interactive
terminal, it asks for the two options it needs:

- **Install level** — `project` (the current directory, the default) or `user`
  (the user-level locations under `~/.config/devin/`, so one install serves
  every project the Devin CLI touches).
- **Component scope** — full (the default) or the subset above.

Flags pre-answer the prompts, and an option fixed on the command line is not
asked:

```bash
omd setup                                # interactive; Enter through for a project-level full install
omd setup --level=user                   # asks only the scope
omd setup --level=user --scope=skills    # fully non-interactive
```

A headless or piped run (no TTY) never prompts and never waits: unanswered
options take their defaults — project level, full scope — so scripted
invocations behave exactly as before. At user level each component is written
where the Devin CLI discovers it under `~/.config/devin/` (hooks are merged into
`~/.config/devin/config.json`, preserving its other keys, rather than written as
a standalone file); a component with no verified user-level location — the
default team — is reported as refused and left uninstalled at that level.

Run the fixed architect → executor → reviewer pipeline on a task:

```bash
omd team run <team> "<task>"   # launch a named team declaration
omd team run "<task>"          # launch the installed default team
```

The nameless form resolves to the `default` team that `omd setup` installs; in a
project without it, the command fails and points you at `omd setup`.

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
