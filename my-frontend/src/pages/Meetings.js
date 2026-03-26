import React, { useState, useEffect } from 'react';
import { meetingService } from '../services/meetingService';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Badge, Alert } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Meetings = () => {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [date, setDate] = useState(new Date());
    const [formData, setFormData] = useState({
        title: '',
        time: '',
        participantId: '' // For simplicity, we invite one person by their User ID
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchMeetings = async () => {
        try {
            const res = await meetingService.getMeetings();
            setMeetings(res.data);
        } catch (err) {
            console.error("Failed to fetch meetings", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMeetings();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            // Combine selected date from calendar and time string into a valid DateTime
            const combinedDateTime = new Date(`${date.toISOString().split('T')[0]}T${formData.time}:00`);

            const data = {
                title: formData.title,
                dateTime: combinedDateTime.toISOString(),
                participants: [formData.participantId] // backend adds the creator automatically
            };
            await meetingService.createMeeting(data);
            setSuccess('Meeting created successfully!');
            setFormData({ title: '', time: '', participantId: '' });
            fetchMeetings(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create meeting (Conflict detected?)');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await meetingService.updateStatus(id, status);
            fetchMeetings(); // Refresh list after update
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update meeting status');
        }
    };

    if (!user) return <p className="p-4">Please login to view meetings.</p>;

    // Filter meetings for the calendar highlight
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const hasMeeting = meetings.some(m => new Date(m.dateTime).toDateString() === date.toDateString());
            return hasMeeting ? 'bg-primary text-white rounded' : null;
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Meeting Scheduler & Calendar</h2>

            <Row>
                <Col md={5}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <Calendar 
                                onChange={setDate} 
                                value={date} 
                                tileClassName={tileClassName}
                                className="border-0 w-100 mb-3"
                            />
                            <hr/>
                            <h5 className="mt-3">Schedule on {date.toDateString()}</h5>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleCreate}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Meeting Title</Form.Label>
                                    <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>Time</Form.Label>
                                    <Form.Control type="time" name="time" value={formData.time} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Participant User ID</Form.Label>
                                    <Form.Control type="text" name="participantId" value={formData.participantId} onChange={handleChange} placeholder="Paste User ID to invite" required />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100">Schedule Meeting</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={7}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-dark text-white">Your Meetings</Card.Header>
                        <Card.Body style={{ overflowY: 'auto', maxHeight: '600px' }}>
                            {meetings.length === 0 ? <p>No meetings scheduled.</p> : (
                                <ul className="list-unstyled">
                                    {meetings.map((m) => (
                                        <li key={m._id} className="border p-3 mb-3 bg-light rounded">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="m-0">{m.title}</h5>
                                                <Badge bg={m.status === 'accepted' ? 'success' : m.status === 'rejected' ? 'danger' : 'warning'}>
                                                    {m.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="mt-2 mb-1"><strong>Time:</strong> {new Date(m.dateTime).toLocaleString()}</p>
                                            <p className="m-0 text-muted small"><strong>Created By:</strong> {m.createdBy?.name}</p>

                                            {m.status === 'pending' && m.createdBy?._id !== user._id && (
                                                <div className="mt-3">
                                                    <Button variant="success" size="sm" className="me-2" onClick={() => handleStatusUpdate(m._id, 'accepted')}>Accept</Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleStatusUpdate(m._id, 'rejected')}>Reject</Button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
export default Meetings;
