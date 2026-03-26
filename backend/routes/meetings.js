const express = require('express');
const {
  getMeetings,
  createMeeting,
  updateMeetingStatus
} = require('../controllers/meetingController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getMeetings)
  .post(protect, createMeeting);

router.route('/:id/status')
  .put(protect, updateMeetingStatus);

module.exports = router;
