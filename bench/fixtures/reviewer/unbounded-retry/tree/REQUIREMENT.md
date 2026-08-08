# Requirement

`uploadWithRetry` must attempt the upload at most three times. When every
attempt fails, it rejects with the error from the last attempt so the caller
can log why the upload was abandoned.
