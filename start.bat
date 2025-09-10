@echo off
echo ===========================
echo   Starting Recommendation System
echo ===========================

REM 如果你在 Windows 上已安装 MongoDB 服务，请确保它已启动
REM 可以尝试使用： net start MongoDB
REM 如果你仍想用 Docker，请在这里加上 docker start mongodb

echo Checking MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel%==2 (
    echo MongoDB service is already running.
) else (
    echo Trying to start MongoDB service...
    net start MongoDB
)

echo.
echo Starting backend service...
cd backend
start cmd /k "npm run dev"
cd ..

echo Starting frontend service...
cd frontend
start cmd /k "npm start"
cd ..

echo.
echo 系统启动完成！
echo 前端地址: http://localhost:3000
echo 后端API:  http://localhost:5000
pause
