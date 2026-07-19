# Oh My Devin (`omd`)

An organizational layer on top of the Devin CLI: it turns local Devin sessions
into an organization of agents with functional **roles**, declarative **teams**,
and deliberative **councils**. The Devin CLI supplies the execution engine; Oh My
Devin adds the orchestrator, the organizational structure, and the protocols —
role contracts, context isolation, and verifiable gates.

## Status

Early implementation.

## Requirements

- Node.js >= 20

## Development

```bash
npm install
npm test        # unit suite (runs against a devin stub; never spends Devin quota)
npm run build   # compile src/ to dist/
```

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). All
contributors sign the project's [CLA](CLA.md) on their first pull request.

## License

[MIT](LICENSE)
