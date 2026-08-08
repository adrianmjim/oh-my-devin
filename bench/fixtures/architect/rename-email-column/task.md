Plan the rename of the `email_address` column on the `users` table to
`email`, across the schema and every reader in `src/`.

The service runs continuously and is deployed one instance at a time, so old
and new code run side by side during a deploy. Read the tree, then write the
approach and its steps to `architecture.json`.
