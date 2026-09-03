BRICKSTARE - Flask + Neon PostgreSQL

STACK
- Frontend: HTML, CSS, JavaScript
- Backend: Python + Flask
- Database: Neon PostgreSQL
- Deployment: Vercel

LOCAL SETUP
1. Create a Python virtual environment:
   python -m venv .venv
2. Activate it on Windows Git Bash:
   source .venv/Scripts/activate
3. Install dependencies:
   pip install -r requirements.txt
4. Copy .env.example to .env.
5. Put your Neon connection string in DATABASE_URL.
6. Set SESSION_SECRET to a long random value.
7. In Neon SQL Editor, run database/schema.sql.
8. Start BrickStare locally:
   python -m flask --app backend/index.py run --debug
9. Open:
   http://127.0.0.1:5000

The Flask API is exposed under /api. The frontend uses same-origin requests such as /api/login and /api/deliveries.

DEMO ACCOUNTS
Retailer: retailer@brickstare.com / 12345678
Dispatcher: dispatcher001@gmail.com / 12345678
Rider: rider001@gmail.com / 12345678

DEPLOYMENT
- Push this folder to GitHub.
- Import the repository into Vercel.
- Vercel routes API requests to backend/index.py.
- Add DATABASE_URL and SESSION_SECRET under Vercel Project Settings -> Environment Variables.
- Deploy.

IMPORTANT
- Do not commit .env.
- database/schema.sql is PostgreSQL for Neon, not MySQL.
- The frontend does not need a separate backend URL because the API is served from the same Vercel project/domain.
