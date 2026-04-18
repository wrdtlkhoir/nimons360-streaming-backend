const express = require('express');
const router = express.Router();
const LivestreamController = require('../controllers/livestreamController');

// POST - Start livestream
router.post('/start', LivestreamController.startLivestream);

// GET - Get all active livestreams
router.get('/active', LivestreamController.getActiveLivestreams);

// GET - Get livestream detail
router.get('/:id', LivestreamController.getLivestream);

// POST - End livestream
router.post('/:id/end', LivestreamController.endLivestream);

// GET - Get user's livestream history
router.get('/history/:userId', LivestreamController.getLivestreamsHistory);

// POST - Add viewer to livestream
router.post('/viewer/add', LivestreamController.addViewer);

// POST - Remove viewer from livestream
router.post('/viewer/remove', LivestreamController.removeViewer);

module.exports = router;
