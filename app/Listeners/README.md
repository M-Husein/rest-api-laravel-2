# What Each File Does

1. HandleFailedLogin — fires on every failed login attempt. Tracks count per IP in Cache with a 15-minute window. Logs a warning after 10 failures from the same IP. No DB writes — pure Cache.
2. HandleSuccessfulLogin — fires on every successful login. Does three things: clears failed login counters, updates last_login_at quietly (no model events), detects new IPs and sends a security alert email.
3. HandlePasswordReset — fires after Password::reset() succeeds. Auto-revokes all other sessions and tokens so you don't need to do it manually in the controller. Wrapped in try/catch so a DB failure doesn't break the reset flow.
4. HandleEmailVerified — fires after markEmailAsVerified(). Sends a welcome confirmation email.

## The Systems Explained

1. Failed Login Listener
Tracks brute force attempts beyond the rate limiter. Rate limiter blocks requests at the HTTP layer — this listener logs and alerts at the application layer. Useful for security audits, banning IPs, or sending admin alerts.
2. Successful Login Listener
Runs after every successful login. Good for sending "new login" email alerts, updating last_login_at, or detecting logins from unusual locations.
3. User Registered Event
Fires after registration. Use it to send welcome emails, create default settings, notify admins, or trigger onboarding flows. Keeps RegisterController clean.
4. Password Reset Listener
Fires after password is reset. Automatically logs out other devices — so you don't have to handle this in the controller.
5. Email Verified Listener
Fires after email verification. Use it to send a "welcome, you're verified!" email or unlock premium features.
