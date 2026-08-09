# Delivery retries

## Attempt ceiling

A transient delivery failure is retried at most five times.

## Exhausted events

An event whose attempts are exhausted is written to the dead-letter table.
