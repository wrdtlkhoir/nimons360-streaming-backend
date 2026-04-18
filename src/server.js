const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const livestreamRoutes = require('./routes/livestream');
const familyRoutes = require('./routes/family');
const notificationRoutes = require('./routes/notification');
const LivestreamModel = require('./models/livestream');
const FamilyModel = require('./models/family');
const NotificationModel = require('./models/notification');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Nimons360 Livestreaming Backend Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      livestream: {
        start: 'POST /api/livestream/start',
        active: 'GET /api/livestream/active',
        detail: 'GET /api/livestream/:id',
        end: 'POST /api/livestream/:id/end',
        history: 'GET /api/livestream/history/:userId',
        addViewer: 'POST /api/livestream/viewer/add',
        removeViewer: 'POST /api/livestream/viewer/remove'
      }
    },
    documentation: 'See /api/health for API status'
  });
});

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Livestream API routes
app.use('/api/livestream', livestreamRoutes);

// Family API routes
app.use('/api/family', familyRoutes);

// Notification API routes
app.use('/api/notification', notificationRoutes);

// Store active connections
const userStreams = new Map(); // Map: userId -> { socketId, livestreamId }
const userConnections = new Map(); // Map: userId -> { socketId, familyIds }

// Socket.IO connection untuk livestream signaling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Event: User register dengan family info
  socket.on('user-login', (data) => {
    const { userId, familyIds = [] } = data;
    
    userConnections.set(userId, {
      socketId: socket.id,
      familyIds: Array.isArray(familyIds) ? familyIds : [familyIds]
    });
    
    console.log(`User ${userId} logged in with families:`, familyIds);
  });
  
  // Event: User mulai livestream
  socket.on('start-stream', (data) => {
    const { userId, userName, title, description, familyIds = [] } = data;
    
    const livestream = LivestreamModel.createLivestream(
      userId,
      userName,
      title,
      description
    );
    livestream.socketId = socket.id;
    
    userStreams.set(userId, {
      socketId: socket.id,
      livestreamId: livestream.id
    });
    
    // Store family IDs if provided
    if (userConnections.has(userId)) {
      userConnections.get(userId).familyIds = Array.isArray(familyIds) ? familyIds : [familyIds];
    } else {
      userConnections.set(userId, {
        socketId: socket.id,
        familyIds: Array.isArray(familyIds) ? familyIds : [familyIds]
      });
    }
    
    // Join socket ke room khusus
    socket.join(livestream.id);
    
    // Broadcast ke semua client bahwa ada livestream baru
    io.emit('stream-started', {
      livestreamId: livestream.id,
      userId: userId,
      userName: livestream.userName,
      title: livestream.title,
      description: livestream.description,
      startTime: livestream.startTime
    });
    
    // Send notifications to family members
    if (Array.isArray(familyIds) && familyIds.length > 0) {
      familyIds.forEach(familyId => {
        const family = FamilyModel.getFamily(familyId);
        if (family && family.members) {
          family.members.forEach(memberId => {
            if (memberId !== userId) {
              // Create notification for family member
              const notification = NotificationModel.createNotification(
                memberId,
                'livestream_started',
                {
                  relatedUserId: userId,
                  relatedUserName: userName,
                  relatedUserAvatar: null,
                  livestreamId: livestream.id,
                  livestreamTitle: title,
                  message: `${userName} sedang melakukan livestream: ${title}`
                }
              );
              
              // Emit notification via Socket.IO to that specific user
              userConnections.forEach((conn, connUserId) => {
                if (connUserId === memberId) {
                  io.to(conn.socketId).emit('family-livestream-started', {
                    notification: notification,
                    livestream: {
                      id: livestream.id,
                      userId: userId,
                      userName: userName,
                      title: title,
                      description: description,
                      startTime: livestream.startTime
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    
    console.log(`${userName} mulai livestream: ${livestream.id}`);
  });

  // Event: User yang ingin join livestream
  socket.on('join-stream', (data) => {
    const { livestreamId, viewerId } = data;
    
    // Join socket ke room livestream
    socket.join(livestreamId);
    
    // Update viewer count
    const stream = LivestreamModel.addViewer(livestreamId, viewerId);
    
    // Broadcast ke semua viewer di room bahwa ada viewer baru
    io.to(livestreamId).emit('viewer-joined', {
      livestreamId,
      viewerCount: stream.viewers
    });
    
    console.log(`Viewer ${viewerId} join stream ${livestreamId}`);
  });

  // Event: Broadcaster mengirim video frame (bisa via WebRTC atau HLS)
  socket.on('send-stream-data', (data) => {
    const { livestreamId, frameData } = data;
    
    // Broadcast frame ke semua viewer di room
    socket.to(livestreamId).emit('receive-stream-data', {
      frameData
    });
  });

  // Event: Viewer chat (optional)
  socket.on('stream-chat', (data) => {
    const { livestreamId, userName, message } = data;
    
    io.to(livestreamId).emit('stream-chat', {
      userName,
      message,
      timestamp: new Date()
    });
  });

  // Event: User keluar dari livestream
  socket.on('leave-stream', (data) => {
    const { livestreamId, viewerId } = data;
    
    socket.leave(livestreamId);
    
    const stream = LivestreamModel.removeViewer(livestreamId, viewerId);
    
    if (stream) {
      io.to(livestreamId).emit('viewer-left', {
        livestreamId,
        viewerCount: stream.viewers
      });
    }
  });

  // Event: Broadcaster end livestream
  socket.on('end-stream', (data) => {
    const { livestreamId } = data;
    
    const stream = LivestreamModel.endLivestream(livestreamId);
    
    // Notifikasi ke semua viewer bahwa livestream berakhir
    io.to(livestreamId).emit('stream-ended', {
      livestreamId
    });
    
    socket.leave(livestreamId);
    console.log(`Livestream ${livestreamId} berakhir`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Cari user yang disconnect di userStreams
    for (let [userId, stream] of userStreams.entries()) {
      if (stream.socketId === socket.id) {
        // End livestream jika broadcaster disconnect
        LivestreamModel.endLivestream(stream.livestreamId);
        io.to(stream.livestreamId).emit('stream-ended', {
          livestreamId: stream.livestreamId
        });
        userStreams.delete(userId);
        console.log(`Livestream ${stream.livestreamId} ended (broadcaster disconnected)`);
        break;
      }
    }
    
    // Cari user yang disconnect di userConnections
    for (let [userId, conn] of userConnections.entries()) {
      if (conn.socketId === socket.id) {
        userConnections.delete(userId);
        console.log(`User ${userId} connection removed`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});