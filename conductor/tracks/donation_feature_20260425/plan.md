# Implementation Plan: Donation Feature

## Phase 1: Core Backend & Database [ ]
- [ ] Task: Database Schema Update
    - [ ] Update `web/src/db/schema.ts` to add any missing fields to `donations` (e.g., status, network_tx_hash).
    - [ ] Run `pnpm db:generate` and `pnpm db:push` to apply changes.
- [ ] Task: Transaction Verification Utility
    - [ ] Write Tests: Create `web/src/lib/monad-utils.test.ts` to test Monad transaction verification logic.
    - [ ] Implement: Create `web/src/lib/monad-utils.ts` to verify transaction status using `viem`.
- [ ] Task: Donation Recording API
    - [ ] Write Tests: Create `web/src/routes/api/donation/record.test.ts` to test the recording endpoint.
    - [ ] Implement: Update/Create `web/src/routes/api/donation/record.ts` to verify and save donations.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Backend & Database' (Protocol in workflow.md)

## Phase 2: Real-time Messaging Infrastructure [ ]
- [ ] Task: Ably Broadcast Utility
    - [ ] Write Tests: Create `web/src/lib/ably-utils.test.ts` for broadcasting donation events.
    - [ ] Implement: Create `web/src/lib/ably-utils.ts` to handle Ably publishing.
- [ ] Task: Integrate API with Ably
    - [ ] Write Tests: Update `web/src/routes/api/donation/record.test.ts` to verify Ably broadcast trigger.
    - [ ] Implement: Update `web/src/routes/api/donation/record.ts` to publish to Ably on success.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Real-time Messaging Infrastructure' (Protocol in workflow.md)

## Phase 3: Frontend - Donation Flow & Dashboard [ ]
- [ ] Task: Public Profile Donation Form
    - [ ] Write Tests: Create `web/src/components/profile/DonationForm.test.tsx`.
    - [ ] Implement: Create/Update the donation form on `/u/$username` route.
- [ ] Task: Dashboard Activity Feed Alerts
    - [ ] Write Tests: Create tests for `CommandCenter.tsx` or alert components.
    - [ ] Implement: Update `CommandCenter.tsx` to subscribe to Ably and show real-time alerts.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend - Donation Flow & Dashboard' (Protocol in workflow.md)

## Phase 4: Stream Overlays (Widgets) [ ]
- [ ] Task: Overlay Alert Widget
    - [ ] Write Tests: Create tests for the Alert widget component.
    - [ ] Implement: Update `web/src/routes/widgets/$type.$address.tsx` to handle \"donation\" type alerts.
- [ ] Task: Audio Alert Integration
    - [ ] Write Tests: Verify audio playback triggers on donation events.
    - [ ] Implement: Add sound effect/TTS logic to the Alert widget.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Stream Overlays (Widgets)' (Protocol in workflow.md)
