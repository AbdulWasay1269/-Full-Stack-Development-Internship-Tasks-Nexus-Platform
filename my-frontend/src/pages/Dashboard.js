import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Card, Button, Container, Row, Col, Form, Alert } from 'react-bootstrap';

const Dashboard = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        bio: user?.bio || '',
        company: user?.profileDetails?.company || '',
        website: user?.profileDetails?.website || '',
        location: user?.profileDetails?.location || ''
    });
    const [message, setMessage] = useState('');

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate('/');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const data = {
                bio: formData.bio,
                profileDetails: {
                    company: formData.company,
                    website: formData.website,
                    location: formData.location
                }
            };
            const res = await authService.updateDetails(data);
            setUser(res.data);
            setMessage('Profile updated successfully!');
            setEditMode(false);
        } catch (err) {
            setMessage('Failed to update profile.');
        }
    };

    if (!user) {
        return (
            <Container className="mt-5 text-center">
                <h4>Please log in to access the Dashboard.</h4>
                <Button variant="primary" onClick={() => navigate('/')}>Go to Login</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                            <h3 className="m-0">Profile Dashboard</h3>
                            <Button variant="outline-light" size="sm" onClick={() => setEditMode(!editMode)}>
                                {editMode ? 'Cancel' : 'Edit Profile'}
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Card.Title className="mb-4">Welcome to Nexus, {user.name}!</Card.Title>
                            {message && <Alert variant="info">{message}</Alert>}

                            {!editMode ? (
                                <>
                                    <div className="mb-3">
                                        <strong>Role: </strong> 
                                        <span className="badge bg-info text-dark ms-2">{user.role}</span>
                                    </div>
                                    <div className="mb-3"><strong>Email: </strong> {user.email}</div>
                                    <div className="mb-3"><strong>User ID: </strong> <span className="user-select-all font-monospace text-muted">{user._id}</span></div>
                                    
                                    <h5 className="mt-4 border-bottom pb-2">Extended Profile</h5>
                                    <div className="mb-2"><strong>Bio: </strong> {user.bio || 'Not set'}</div>
                                    <div className="mb-2"><strong>Company: </strong> {user.profileDetails?.company || 'Not set'}</div>
                                    <div className="mb-2"><strong>Location: </strong> {user.profileDetails?.location || 'Not set'}</div>
                                    <div className="mb-4"><strong>Website: </strong> {user.profileDetails?.website || 'Not set'}</div>
                                </>
                            ) : (
                                <Form onSubmit={handleSave} className="mb-4 bg-light p-3 border rounded">
                                    <h5>Edit Extended Details</h5>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Bio / Startup History</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange} placeholder="Share your history/preferences" />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Company</Form.Label>
                                        <Form.Control type="text" name="company" value={formData.company} onChange={handleChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Location</Form.Label>
                                        <Form.Control type="text" name="location" value={formData.location} onChange={handleChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Website / Portfolio URL</Form.Label>
                                        <Form.Control type="text" name="website" value={formData.website} onChange={handleChange} />
                                    </Form.Group>
                                    <Button variant="success" type="submit">Save Changes</Button>
                                </Form>
                            )}

                            <hr />

                            <div className="d-flex flex-wrap gap-2 mt-4">
                                <Button variant="primary" onClick={() => navigate('/meetings')}>My Meetings</Button>
                                <Button variant="success" onClick={() => navigate('/documents')}>Document Vault</Button>
                                <Button variant="primary" onClick={() => navigate('/payments')}>Payments</Button>
                                <Button variant="danger" className="ms-auto" onClick={handleLogout}>Logout</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;