# Goal

Add a retry to the outbound webhook sender so a transient failure at the
receiver does not drop the event.

A complete plan must say when a retry happens, when it stops, and what
happens to an event that never succeeds.
