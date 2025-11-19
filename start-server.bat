@echo off
cd /d "%~dp0"
echo Starting server in: %CD%
echo.
echo Open your browser and go to: http://localhost:8000/index.html
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000

