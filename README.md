# SnapSell Marketplace

## Account requirements

New accounts require a full name, unique username, unique email address,
unique 10-digit phone number, and password. Email addresses are normalized to
lowercase and phone numbers are stored as digits only. Users can log in with
their username, email address, or phone number.

Authenticated users can select **Post Listing** between Home and Marketplace in
the navbar. The protected form sends the new listing to `POST /api/listings`.
It includes a device photo picker for up to three JPG, JPEG, PNG, WEBP, or GIF
photos. Each photo is limited to 3 MB and validated by both the browser and API.

## Questions and listing history

The interface presents listing questions as buyer/seller messages, while the API keeps the assignment's Question model and routes. It supports anonymous listing questions, seller-only answers, and authenticated listing-history viewing.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/questions/listings/:listingId` | Public | Submit a question |
| GET | `/api/questions/listings/:listingId` | Public | View answered questions |
| GET | `/api/questions/seller` | Authenticated seller | View questions on owned listings |
| PATCH | `/api/questions/:id/answer` | Listing owner | Answer or update an answer |
| GET | `/api/history/listings/:listingId` | Authenticated user | View a listing's update history |

Send protected requests with `Authorization: Bearer <token>`. Listing edits and status changes automatically create history records containing the acting username, action date/time, and description.
