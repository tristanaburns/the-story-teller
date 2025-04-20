@echo off
echo Installing Next.js project dependencies...
npm install
echo.
echo Creating .env.local file from template...
copy .env.local.example .env.local
echo.
echo Setup complete!
echo.
echo Please update the .env.local file with your actual API keys and database connection string.
echo Then run 'npm run dev' to start the development server.
