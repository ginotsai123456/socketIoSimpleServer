const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  path: '/socket/'  // 匹配你的 C++ client 路徑
});

const PORT = 3000;  // 根據你的 _dataCenter->getServerPort() 設定

// 基本的 HTTP 路由
app.get('/', (req, res) => {
  res.send('Socket.IO Server is running');
});

// Socket.IO 連線處理
io.on('connection', (socket) => {
  console.log('=================================');
  console.log('[Socket.IO] New client connected');
  console.log('Client ID:', socket.id);
  console.log('Connected at:', new Date().toLocaleString());
  console.log('=================================');

  // 監聽 'serverData' 事件（對應你的 C++ client emit）
  socket.on('serverData', (data, callback) => {
    console.log('\n--- Received Data ---');
    console.log('Time:', new Date().toLocaleString());
    console.log('Client ID:', socket.id);
    
    try {
      // 如果是 JSON 字串，嘗試解析並美化輸出
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('Data:', JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('Data:', data);
    }
    
    console.log('--------------------\n');

    // 發送 ACK 確認（對應你的 C++ client callback）
    // 註解掉以模仿不會回應的 server
    // if (callback) {
    //   callback({ status: 'ok', message: 'Data received successfully' });
    // }
  });

  // 斷線處理
  socket.on('disconnect', (reason) => {
    console.log('=================================');
    console.log('[Socket.IO] Client disconnected');
    console.log('Client ID:', socket.id);
    console.log('Reason:', reason);
    console.log('Disconnected at:', new Date().toLocaleString());
    console.log('=================================\n');
  });

  // 錯誤處理
  socket.on('error', (error) => {
    console.error('[Socket.IO] Error:', error);
  });
});

// 啟動服務器
server.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log(`║  Socket.IO Server Running              ║`);
  console.log(`║  Port: ${PORT}                            ║`);
  console.log(`║  Path: /socket/                        ║`);
  console.log(`║  URL: http://localhost:${PORT}/socket/  ║`);
  console.log('╔════════════════════════════════════════╗\n');
});

// 優雅關閉
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});
