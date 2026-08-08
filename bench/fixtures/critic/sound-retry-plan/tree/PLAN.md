# Plan: retry outbound webhook delivery

## Step 1 — Classify the failure

Treat a connection error, a timeout, and any 5xx response as transient. Treat
every 4xx response as permanent: retrying a rejected payload cannot make the
receiver accept it.

## Step 2 — Retry transient failures with backoff

Retry a transient failure up to five times, with exponential backoff starting
at one second and doubling each attempt, plus jitter so a receiver coming back
up is not hit by every pending event at once.

## Step 3 — Stop and record

After the fifth failed attempt, stop retrying and move the event to the
`webhook_dead_letters` table with its last response code and body. Nothing is
dropped silently.

## Step 4 — Verify

Add tests covering: a transient failure that succeeds on the second attempt, a
4xx that is not retried at all, and an event that exhausts its attempts and
lands in the dead-letter table.

## Rollback

The sender reads its retry ceiling from configuration. Setting the ceiling to
zero restores the previous single-attempt behaviour without a deploy.
