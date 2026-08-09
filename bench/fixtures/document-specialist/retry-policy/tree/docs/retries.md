# Delivery retries

## Attempt ceiling

A transient delivery failure is retried at most **five** times. The fifth
failed attempt is the last: the sender does not retry a sixth time.

## Backoff

The delay before attempt *n* is `base * 2^(n-1)`, where `base` is 1000
milliseconds. Jitter of up to 250 milliseconds is added to each delay.

## Exhausted events

An event whose attempts are exhausted is written to the **dead-letter** table
together with the last response status. Nothing is discarded silently.

## Permanent failures

A 4xx response is permanent: it is not retried at all, and the event goes
straight to the dead-letter table.
