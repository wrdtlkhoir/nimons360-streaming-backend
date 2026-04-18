const LivestreamModel = require('../models/livestream');

class LivestreamController {
  // Start livestream
  static startLivestream(req, res) {
    try {
      const { userId, userName, title, description } = req.body;

      if (!userId || !userName || !title) {
        return res.status(400).json({
          error: 'userId, userName, dan title harus diisi'
        });
      }

      const livestream = LivestreamModel.createLivestream(
        userId,
        userName,
        title,
        description || ''
      );

      res.status(201).json({
        success: true,
        message: 'Livestream dimulai',
        data: livestream
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all active livestreams
  static getActiveLivestreams(req, res) {
    try {
      const streams = LivestreamModel.getActiveLivestreams();
      res.status(200).json({
        success: true,
        data: streams
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get livestream detail
  static getLivestream(req, res) {
    try {
      const { id } = req.params;
      const stream = LivestreamModel.getLivestream(id);

      if (!stream) {
        return res.status(404).json({
          success: false,
          error: 'Livestream tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: stream
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // End livestream
  static endLivestream(req, res) {
    try {
      const { id } = req.params;
      const stream = LivestreamModel.endLivestream(id);

      if (!stream) {
        return res.status(404).json({
          success: false,
          error: 'Livestream tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Livestream berakhir',
        data: stream
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get user's livestream history
  static getLivestreamsHistory(req, res) {
    try {
      const { userId } = req.params;
      const history = LivestreamModel.getLivestreamsHistory(userId);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Add viewer
  static addViewer(req, res) {
    try {
      const { livestreamId, viewerId } = req.body;

      if (!livestreamId || !viewerId) {
        return res.status(400).json({
          error: 'livestreamId dan viewerId harus diisi'
        });
      }

      const stream = LivestreamModel.addViewer(livestreamId, viewerId);

      if (!stream) {
        return res.status(404).json({
          success: false,
          error: 'Livestream tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Viewer ditambahkan',
        data: stream
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Remove viewer
  static removeViewer(req, res) {
    try {
      const { livestreamId, viewerId } = req.body;

      if (!livestreamId || !viewerId) {
        return res.status(400).json({
          error: 'livestreamId dan viewerId harus diisi'
        });
      }

      const stream = LivestreamModel.removeViewer(livestreamId, viewerId);

      if (!stream) {
        return res.status(404).json({
          success: false,
          error: 'Livestream tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Viewer dihapus',
        data: stream
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get active livestreams from family members
  static getActiveFamilyLivestreams(req, res) {
    try {
      const { familyMemberIds } = req.body;

      if (!familyMemberIds || !Array.isArray(familyMemberIds)) {
        return res.status(400).json({
          error: 'familyMemberIds harus diisi dan berupa array'
        });
      }

      const streams = LivestreamModel.getActiveFamilyLivestreams(familyMemberIds);

      res.status(200).json({
        success: true,
        data: streams,
        count: streams.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = LivestreamController;
