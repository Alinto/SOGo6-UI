# AO technical annex — PWA / offline mail

Offline features are available on Android and iOS.

Users can install the app, compose messages offline, and store them in a local Outbox they can review and edit (including attachments within configured limits).

Send is automatic when the network returns while the app is open, and on the next app open otherwise.

On Android (Chrome), a background send is attempted (best effort) without reopening the app.

On iOS, the OS does not allow web apps to run in the background; pending messages are sent as soon as the app is reopened.

Offline reading covers recently synced / opened messages (local cache), not a full server mailbox.
