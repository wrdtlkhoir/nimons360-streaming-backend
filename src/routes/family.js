const express = require('express');
const router = express.Router();
const FamilyModel = require('../models/family');

// POST - Create or join family
router.post('/create', (req, res) => {
  try {
    const { familyId, userId } = req.body;

    if (!familyId || !userId) {
      return res.status(400).json({
        error: 'familyId dan userId harus diisi'
      });
    }

    const family = FamilyModel.addMemberToFamily(familyId, userId);

    res.status(201).json({
      success: true,
      message: 'Anggota ditambahkan ke keluarga',
      data: family
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Add member to family
router.post('/add-member', (req, res) => {
  try {
    const { familyId, userId } = req.body;

    if (!familyId || !userId) {
      return res.status(400).json({
        error: 'familyId dan userId harus diisi'
      });
    }

    const family = FamilyModel.addMemberToFamily(familyId, userId);

    res.status(200).json({
      success: true,
      message: 'Anggota ditambahkan',
      data: family
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Get family members for a user
router.get('/members/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'userId harus diisi'
      });
    }

    const members = FamilyModel.getAllFamilyMembers(userId);

    res.status(200).json({
      success: true,
      data: members,
      count: members.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Get families for a user
router.get('/list/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'userId harus diisi'
      });
    }

    const families = FamilyModel.getUserFamilies(userId);

    res.status(200).json({
      success: true,
      data: families,
      count: families.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Get family details
router.get('/:familyId', (req, res) => {
  try {
    const { familyId } = req.params;

    if (!familyId) {
      return res.status(400).json({
        error: 'familyId harus diisi'
      });
    }

    const family = FamilyModel.getFamily(familyId);

    if (!family) {
      return res.status(404).json({
        success: false,
        error: 'Keluarga tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: family
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Remove member from family
router.post('/remove-member', (req, res) => {
  try {
    const { familyId, userId } = req.body;

    if (!familyId || !userId) {
      return res.status(400).json({
        error: 'familyId dan userId harus diisi'
      });
    }

    const family = FamilyModel.removeMemberFromFamily(familyId, userId);

    res.status(200).json({
      success: true,
      message: 'Anggota dihapus dari keluarga',
      data: family
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
