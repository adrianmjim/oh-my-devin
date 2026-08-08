# Goal

Rename the `email` column on the `accounts` table to `email_address` without
losing data and without downtime for readers.

The plan below is the proposal under review. A complete plan must cover how
existing rows reach the new column, how readers keep working during the
change, and how the change is undone if a step fails midway.
