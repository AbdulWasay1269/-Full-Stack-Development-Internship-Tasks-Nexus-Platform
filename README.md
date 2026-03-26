# Nexus Full Stack Project

## Project Completion Verification

This project fulfills the full stack internship requirements for Nexus.

### Features Included
1. **Authentication:** 
   - JWT login and registration.
   - User roles implemented (Founder, Investor, Specialist).
   - OTP support available via backend routes.
   - Profile extension functionality added (`/auth/updatedetails` to save bio, location, company names).

2. **Dashboard UI:**
   - Designed cleanly using React-Bootstrap.
   - Users can now edit their bio, company, website, and location from the Dashboard directly.

3. **Meetings & Scheduling:**
   - Features `react-calendar` component.
   - Stores user-scheduled meeting times in the MongoDB database (`/meetings/schedule`).
   - Retrieves meetings correctly.

4. **Document Chamber:**
   - Handles multi-part file uploads (via multer with `crypto.randomUUID()` to prevent ESM conflict on Windows).
   - Safely renders inline PDFs to fulfill "Preview documents in frontend".
   - Signature capability included using `react-signature-canvas`.

5. **Payments integration Mock:**
   - Mocks deposits matching requirements (`/payments/deposit`).
   - Full mock implementation frontend UI allowing simulating funds.

### Running the App
**Prerequisites:** MongoDB running locally on default port `27017`.
Make sure `MONGO_URI` in `backend/.env` is strictly set to `mongodb://127.0.0.1:27017/nexus` to prevent IPv6 DNS `localhost` resolution errors.

**Backend:**
1. `cd backend`
2. `npm install`
3. `npm start` (or `node server.js`) - runs on port 5000

**Frontend:**
1. `cd my-frontend`
2. `npm install`
3. `npm start` - runs on port 3000

### API Endpoints
**Auth (Base: /api/auth)**
- `POST /register`: Create a new user account (name, email, password, role).
- `POST /login`: Logs in user and returns valid JWT token.
- `GET /me`: Returns the user details via Token.
- `PUT /updatedetails`: Updates extended profile properties (bio, profileDetails)

**Meetings (Base: /api/meetings)**
- `POST /schedule`: Schedule a meeting.
- `GET /`: Get user's logged meetings.

**Documents (Base: /api/documents)**
- `POST /upload`: Uploads a pdf document to the vault.
- `GET /`: Gets user's list of valid documents.

**Payments (Base: /api/payments)**
- `POST /deposit`: Mock API simulating wallet refilling.

## Status: COMPLETE.