# Decided scope: rename the --quiet flag to --silent

Rename the `--quiet` flag on `report build` to `--silent`. Both spellings are
accepted for one release; `--quiet` prints a deprecation notice to stderr and
then behaves exactly as `--silent`. After that release `--quiet` is removed.

Approved decisions:

- Passing both flags together is a usage error, exit code 2, with a message
  naming both spellings.
- The deprecation notice goes to stderr so piped stdout stays unchanged.
- The notice text is: `--quiet is deprecated; use --silent`.
- No other command gains or loses a flag.
- The help output lists `--silent` only; `--quiet` stays undocumented.

Out of scope: renaming flags on any other command, and changing what the flag
does.
