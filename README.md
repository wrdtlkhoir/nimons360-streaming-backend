# Nimons360 Livestreaming Backend

Backend server untuk fitur livestreaming Nimons360 menggunakan Node.js, Express, dan Socket.IO.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Buat file `.env`
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key
```

### 3. Run Server
```bash
npm start
# atau dengan nodemon untuk development
npx nodemon src/server.js
```

Server akan running di `http://localhost:3000`

---

## API Endpoints

### REST API

#### 1. Start Livestream
```
POST /api/livestream/start
Content-Type: application/json

{
  "userId": "user123",
  "userName": "John Doe",
  "title": "Keadaan di rumah baru",
  "description": "Sedang menunjukkan rumah baru kepada family"
}

Response:
{
  "success": true,
  "message": "Livestream dimulai",
  "data": {
    "id": "livestream_1648123456",
    "userId": "user123",
    "userName": "John Doe",
    "title": "Keadaan di rumah baru",
    "description": "Sedang menunjukkan rumah baru kepada family",
    "status": "active",
    "viewers": 0,
    "streamKey": "user123_1648123456"
  }
}
```

#### 2. Get All Active Livestreams
```
GET /api/livestream/active

Response:
{
  "success": true,
  "data": [
    {
      "id": "livestream_1648123456",
      "userName": "John Doe",
      "title": "Keadaan di lokasi baru",
      "viewers": 5,
      "status": "active"
    }
  ]
}
```

#### 3. Get Livestream Detail
```
GET /api/livestream/:id

Response:
{
  "success": true,
  "data": {
    "id": "livestream_1648123456",
    "userId": "user123",
    "userName": "John Doe",
    "title": "Keadaan di rumah baru",
    "status": "active",
    "viewers": 5,
    "startTime": "2026-04-18T10:30:00Z"
  }
}
```

#### 4. End Livestream
```
POST /api/livestream/:id/end

Response:
{
  "success": true,
  "message": "Livestream berakhir",
  "data": {
    "id": "livestream_1648123456",
    "status": "ended",
    "endTime": "2026-04-18T10:45:00Z"
  }
}
```

#### 5. Get User's Livestream History
```
GET /api/livestream/history/:userId

Response:
{
  "success": true,
  "data": [
    {
      "id": "livestream_1648123456",
      "title": "Keadaan di rumah baru",
      "startTime": "2026-04-18T10:30:00Z",
      "endTime": "2026-04-18T10:45:00Z",
      "status": "ended"
    }
  ]
}
```

#### 6. Add Viewer
```
POST /api/livestream/viewer/add
Content-Type: application/json

{
  "livestreamId": "livestream_1648123456",
  "viewerId": "viewer456"
}
```

#### 7. Remove Viewer
```
POST /api/livestream/viewer/remove
Content-Type: application/json

{
  "livestreamId": "livestream_1648123456",
  "viewerId": "viewer456"
}
```

---

## Socket.IO Events

### Broadcaster (Pengguna yang streaming)

#### 1. Start Stream
```javascript
socket.emit('start-stream', {
  userId: 'user123',
  userName: 'John Doe',
  title: 'Keadaan di rumah baru',
  description: 'Menunjukkan rumah kepada family'
});
```

#### 2. Send Stream Data (Video Frames)
```javascript
socket.emit('send-stream-data', {
  livestreamId: 'livestream_1648123456',
  frameData: <binary data atau encoded video>
});
```

#### 3. Stream Chat
```javascript
socket.emit('stream-chat', {
  livestreamId: 'livestream_1648123456',
  userName: 'John Doe',
  message: 'Halo semua!'
});
```

#### 4. End Stream
```javascript
socket.emit('end-stream', {
  livestreamId: 'livestream_1648123456'
});
```

### Viewer (Pengguna yang menonton)

#### 1. Join Stream
```javascript
socket.emit('join-stream', {
  livestreamId: 'livestream_1648123456',
  viewerId: 'viewer456'
});
```

#### 2. Listen for Stream Data
```javascript
socket.on('receive-stream-data', (data) => {
  // data.frameData berisi video frame
  console.log('Received frame:', data.frameData);
});
```

#### 3. Listen for Chat
```javascript
socket.on('stream-chat', (data) => {
  console.log(`${data.userName}: ${data.message}`);
});
```

#### 4. Leave Stream
```javascript
socket.emit('leave-stream', {
  livestreamId: 'livestream_1648123456',
  viewerId: 'viewer456'
});
```

### Global Events

#### 1. Stream Started
```javascript
socket.on('stream-started', (data) => {
  console.log(`${data.userName} started: ${data.title}`);
});
```

#### 2. Viewer Joined
```javascript
socket.on('viewer-joined', (data) => {
  console.log(`Viewers: ${data.viewerCount}`);
});
```

#### 3. Viewer Left
```javascript
socket.on('viewer-left', (data) => {
  console.log(`Viewers: ${data.viewerCount}`);
});
```

#### 4. Stream Ended
```javascript
socket.on('stream-ended', (data) => {
  console.log(`Stream ${data.livestreamId} ended`);
});
```

---

## Testing dengan Postman

1. **Test Health Check**: GET http://localhost:3000/api/health
2. **Start Livestream**: POST http://localhost:3000/api/livestream/start
3. **Get Active Livestreams**: GET http://localhost:3000/api/livestream/active

---

## Next Steps - Android Implementation

Setelah backend sudah running, implementasi Android akan menggunakan:
- OkHttp Client untuk REST API
- OkHttp WebSocket untuk Socket.IO
- MediaRecorder untuk capture video dari camera
- Streaming video ke backend via HTTP/WebSocket

---

## Notes

- Saat ini menggunakan in-memory storage (reset jika server restart)
- Untuk production, gunakan MongoDB atau database lainnya
- Implementasi video encoding & compression perlu dilakukan
- WebRTC bisa dipertimbangkan untuk better peer-to-peer streaming
