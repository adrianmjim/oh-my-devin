Review the code under `src/` for vulnerabilities.

`src/reports.js` is an HTTP handler: `req.query` carries values supplied by the
caller. Report what an attacker can reach, and write your verdict and findings
to `security-review.json`.
