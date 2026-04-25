# Specification: Donation Feature

## Overview
This track implements the core donation functionality for the LeMon platform. It allows donors to send Native MON tokens to creators with custom messages, triggering real-time visual and audio alerts on overlays and the creator's dashboard.

## Functional Requirements
- **Custom Donation Amount:** Donors can input any amount of Native MON to tip a creator.
- **Donor Messages:** Support for attaching a text message to the donation.
- **On-chain Transaction:** Integration with Monad network for secure token transfers.
- **Real-time Alerts:**
    - Trigger animated visual alerts on stream overlays via Ably.
    - Display notification alerts on the creator's dashboard activity feed.
    - Play audio alerts (Sound effects) upon successful donation confirmation.
- **Donation History:** Record and display successful donations in the database and creator's dashboard.

## Non-Functional Requirements
- **Latency:** Alerts must trigger within 1 second of transaction confirmation.
- **Security:** Verify transaction success on the Monad network before recording or alerting.
- **Cyberpunk UI:** All donation UI elements must follow the established neon/dark cyberpunk aesthetic.

## Acceptance Criteria
- Donors can successfully send MON via the creator's public profile page (`/u/username`).
- Messages are correctly captured, stored, and displayed in real-time alerts.
- Overlay widgets (alerts) update immediately upon successful transaction.
- Dashboard activity feed reflects the new donation details correctly.

## Out of Scope
- Support for multiple tokens (limited to Native MON for now).
- Advanced automated moderation for donor messages.
