# Plan: rename accounts.email to accounts.email_address

## Step 1 — Add the new column

Add `email_address` to `accounts` as a nullable text column. Nothing reads it
yet, so this is safe to deploy on its own.

## Step 2 — Cut readers over to the new column

Deploy the application change that reads `email_address` instead of `email`.
Readers now see the new column everywhere.

## Step 3 — Backfill the existing rows

Copy every existing `email` value into `email_address` in batches of 1000,
pausing briefly between batches to keep replication lag low.

## Step 4 — Drop the old column

Once the backfill reports zero remaining rows, drop `accounts.email`.

## Notes

The batch size was chosen to keep each statement under the statement timeout.
