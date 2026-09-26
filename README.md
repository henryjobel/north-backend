# North South Group Backend

Express and MongoDB API prepared for local development and cPanel Passenger deployment.

## Requirements

- Node.js 20.9 or newer (Node.js 20 or 22 recommended)
- npm
- MongoDB Atlas or another remotely accessible MongoDB server
- Cloudinary accountasda

## Local development

1. Copy `.env.example` to `.env` and add the real values.
2. Install packages with `npm install`.
3. Start development mode with `npm run dev`.
4. Check `http://localhost:8000/api/v1/health`.

## Files to upload to cPanel

Upload the contents of this `backend` directory, including:

- `app.js`
- `package.json`
- `package-lock.json`
- `src/`
- `tmp/`

Do not upload:

- `node_modules/`
- `.git/`
- `.vercel/`
- local `.env`
- local logs or ZIP files

The cPanel application root must be the directory that directly contains `app.js` and `package.json`.

## cPanel setup

The labels vary slightly between cPanel versions. Use **Setup Node.js App**, **Application Manager**, or **Web Apps**.

1. Create a subdomain such as `api.example.com` and enable SSL.
2. Create a new Node.js application.
3. Select Production mode.
4. Select Node.js 20 or 22. Node.js 18 is not supported by the current image-processing dependency.
5. Set the application root to the uploaded backend directory.
6. Set the application URL to the API subdomain.
7. Set the startup file to `app.js`.
8. Run **NPM Install**. In Terminal, the equivalent command is `npm ci --omit=dev` from the application root.
9. Add the environment variables listed below in cPanel's environment-variable screen.
10. Restart the application.

Do not manually set `PORT` in cPanel unless the hosting provider specifically requires it. Passenger normally supplies the port automatically.

## Production environment variables

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER/DATABASE?retryWrites=true&w=majority
JWT_SECRET=GENERATE_A_NEW_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=7
BACKEND_URL=https://api.example.com
FRONTEND_URL=https://example.com
CORS_ORIGINS=https://example.com,https://www.example.com
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Do not add quotes around values in cPanel unless a value actually contains quotes. Separate multiple allowed frontend origins with commas and do not add paths such as `/admin`.

MongoDB Atlas must allow the cPanel server IP. If the hosting provider does not provide a fixed outbound IP, ask them which IP should be added to Atlas Network Access.

## Verification

After restarting, open:

```text
https://api.example.com/api/v1/health
```

Then update the frontend production variable and rebuild or redeploy the frontend:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
```

Test admin login, one text-only concern update, and one concern image upload.

## Updating the deployed backend

Replace the changed source files, run **NPM Install** only when dependencies changed, and restart the Node.js application. For Passenger-based hosting, restarting from the cPanel interface is preferred; with Terminal access, touching `tmp/restart.txt` also requests a restart.

## Useful commands

```bash
npm ci --omit=dev
npm start
```

API base path: `/api/v1`

Health check: `GET /api/v1/health`
