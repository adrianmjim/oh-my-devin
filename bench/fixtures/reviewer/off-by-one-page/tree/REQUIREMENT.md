# Requirement

`page(items, size, index)` returns the items belonging to the requested page,
counting pages from zero. Every page carries `size` items except the last,
which carries whatever remains. A `size` that is not a positive integer is a
caller error and must be rejected rather than silently producing nothing.
