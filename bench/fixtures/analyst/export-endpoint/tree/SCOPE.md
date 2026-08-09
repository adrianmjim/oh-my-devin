# Decided scope: account export endpoint

Add `GET /accounts/:id/export` returning the account's records as a CSV
download. The endpoint is for account owners exporting their own data.

Approved decisions:

- The response is a CSV file, not JSON.
- Only the account owner may export their own account.
- The export runs synchronously and returns the file in the response.

Out of scope: exporting more than one account at a time, and scheduling
recurring exports.
