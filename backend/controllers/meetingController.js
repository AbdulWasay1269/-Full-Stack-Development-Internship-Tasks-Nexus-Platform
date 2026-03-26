const Meeting = require('../models/Meeting');
const User = require('../models/User');

// @desc      Get all meetings for a user
// @route     GET /api/meetings
// @access    Private
exports.getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ participants: req.user.id })
      .populate('participants', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Create a meeting
// @route     POST /api/meetings
// @access    Private
exports.createMeeting = async (req, res, next) => {
  try {
    const { title, participants, dateTime } = req.body;
    
    // Ensure the current user is in participants
    let allParticipants = participants || [];
    if (!allParticipants.includes(req.user.id)) {
      allParticipants.push(req.user.id);
    }

    const meetingTime = new Date(dateTime);
    // Buffer for conflict detection (e.g., 30 mins)
    const thirtyMins = 30 * 60 * 1000;
    const timeStart = new Date(meetingTime.getTime() - thirtyMins);
    const timeEnd = new Date(meetingTime.getTime() + thirtyMins);

    // Conflict detection: Check if any participant has an accepted/pending meeting close to this time
    const conflictMeetings = await Meeting.find({
      participants: { $in: allParticipants },
      status: { $in: ['pending', 'accepted'] },
      dateTime: { $gte: timeStart, $lte: timeEnd }
    });

    if (conflictMeetings.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'One or more participants have a meeting conflict around this time'
      });
    }

    const meeting = await Meeting.create({
      title,
      participants: allParticipants,
      dateTime: meetingTime,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: meeting
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update meeting status (Accept/Reject)
// @route     PUT /api/meetings/:id/status
// @access    Private
exports.updateMeetingStatus = async (req, res, next) => {
  try {
    let meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    // Make sure user is part of the meeting
    if (!meeting.participants.includes(req.user.id)) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this meeting' });
    }

    const { status } = req.body;
    if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    meeting.status = status;
    await meeting.save();

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
