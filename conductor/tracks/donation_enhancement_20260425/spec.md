# Specification: Enhance donation recording with Monad network verification and robust alert delivery

## Overview
This track focuses on strengthening the core donation flow. It ensures that every donation recorded in the system is verified on the Monad network before being finalized and that real-time alerts are delivered reliably via Ably.

## Functional Requirements
- **On-chain Verification:** Implement server-side logic to verify transaction hashes on the Monad network before recording them in the database.
- **Robust Alert Delivery:** Ensure Ably events are published successfully and implement basic retry logic or error logging for failed broadcasts.
- **Database Consistency:** Update the `donations` table to include transaction status and block numbers where applicable.
- **Error Handling:** Provide clear feedback to the donor and creator if a transaction fails verification.

## Acceptance Criteria
- Transactions are verified using a Monad RPC before being marked as "success" in the DB.
- Real-time alerts trigger on the overlay within 1 second of successful recording.
- Failed verification attempts are logged and do not trigger alerts.
