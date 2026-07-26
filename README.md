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
omd setup --level user                   # rejected: only the --flag=value form is accepted
```

Only the `--flag=value` form is accepted. A space-separated flag
(`--level user`), an unknown flag (`--levl=user`), and a bare positional
argument are all rejected as usage errors rather than ignored, each reporting
the same line: `usage: omd setup [--level=<project|user>]
[--scope=rules,roles,skills,hooks,teams]`. A well-formed flag carrying an
unrecognized value reports that value instead. Every usage error exits `64`.

A headless or piped run (no TTY) never prompts and never waits: unanswered
options take their defaults — project level, full scope — so scripted
invocations behave exactly as before. At user level each component is written
where the Devin CLI discovers it under `~/.config/devin/` (hooks are merged into
`~/.config/devin/config.json`, preserving its other keys, rather than written as
a standalone file); a component with no verified user-level location — the
default team — is reported as refused and left uninstalled at that level.

A user-level install is runnable from anywhere: `omd run <role>` and
`omd roles list` resolve the union of the project's roles and the user-level
ones, each role's output schema resolving from the level that installed it. A
project role of the same name takes precedence, so a project can override an
installed role without renaming it.

### Installing never destroys what you wrote

`omd setup` preserves every byte it did not write itself. What it installs is
delimited in place by a marker in the file's own comment syntax, carrying the
region's identity, the layer version, and a digest of the content written — so
ownership is readable from the file alone, and a re-run replaces omd's region
and nothing else. An existing `AGENTS.md` keeps all of its content and gains
omd's block below it; hook registries are merged by claim, so every event omd
does not claim and every entry it did not write stays registered.

Each target is reported by what happened to it:

- **Created** / **Updated** — omd wrote it. Creation and replacement are
  distinct, so an upgrade is visible.
- **Unchanged** — already installed and identical; nothing was written.
- **Preserved** — the content inside omd's region no longer matches its digest,
  so you edited it. omd leaves your version alone.
- **Conflicted** — a file omd did not write already occupies that path, or its
  markers are duplicated, unbalanced, or unreadable. Nothing is written.
- **Blocked** — the target cannot be written safely (an engine configuration
  that will not parse, for instance). It blocks only itself; the rest of the
  install proceeds.

To resolve a conflict, decide which version you want and make it explicit:
move or delete the file to let `omd setup` install its own, or keep yours and
leave it — a conflicted target is reported on every run and never overwritten.
For a target reported as preserved, how to take the shipped version back
depends on the file. In `AGENTS.md`, omd's region sits inside your document:
delete the region (both sentinels and everything between them) and the next
run reinstalls it. A skill, role, team, schema, or the hook script is omd's
file whole: delete the file itself — stripping just its marker leaves an
unmarked remnant (a shebang, frontmatter, the document body) reported as a
conflict from then on. A layer installed before markers existed carries none,
so its files are reported as conflicts the first time you run this version;
removing them and re-running hands those paths back to omd.

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
