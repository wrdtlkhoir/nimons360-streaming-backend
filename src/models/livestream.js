// Simulasi database dengan in-memory storage
// Untuk production, gunakan MongoDB atau database lainnya

const livestreams = new Map();
const viewerSessions = new Map();

// Format: {
//   id: string,
//   userId: string,
//   userName: string,
//   title: string,
//   description: string,
//   startTime: Date,
//   endTime: Date | null,
//   status: 'active' | 'ended',
//   viewers: number,
//   streamUrl: string (example: rtmp://localhost/live/streamKey)
//   socketId: string
// }

class LivestreamModel {
  // Create new livestream
  static createLivestream(userId, userName, title, description) {
    const id = `livestream_${Date.now()}`;
    const streamKey = `${userId}_${Date.now()}`;
    
    const livestream = {
      id,
      userId,
      userName,
      title,
      description,
      startTime: new Date(),
      endTime: null,
      status: 'active',
      viewers: 0,
      streamKey,
      socketId: null
    };
    
    livestreams.set(id, livestream);
    return livestream;
  }

  // Get all active livestreams
  static getActiveLivestreams() {
    return Array.from(livestreams.values())
      .filter(stream => stream.status === 'active');
  }

  // Get livestream by ID
  static getLivestream(id) {
    return livestreams.get(id);
  }

  // Update viewer count
  static addViewer(livestreamId, viewerId) {
    const stream = livestreams.get(livestreamId);
    if (stream) {
      stream.viewers += 1;
      
      // Track viewer session
      viewerSessions.set(`${livestreamId}_${viewerId}`, {
        livestreamId,
        viewerId,
        joinTime: new Date()
      });
      
      return stream;
    }
    return null;
  }

  static removeViewer(livestreamId, viewerId) {
    const stream = livestreams.get(livestreamId);
    if (stream && stream.viewers > 0) {
      stream.viewers -= 1;
    }
    
    viewerSessions.delete(`${livestreamId}_${viewerId}`);
    return stream;
  }

  // End livestream
  static endLivestream(id) {
    const stream = livestreams.get(id);
    if (stream) {
      stream.status = 'ended';
      stream.endTime = new Date();
      return stream;
    }
    return null;
  }

  // Get livestream history
  static getLivestreamsHistory(userId) {
    return Array.from(livestreams.values())
      .filter(stream => stream.userId === userId)
      .sort((a, b) => b.startTime - a.startTime);
  }

  // Delete livestream
  static deleteLivestream(id) {
    return livestreams.delete(id);
  }
}

module.exports = LivestreamModel;
