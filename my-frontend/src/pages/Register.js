import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      role: 'Entrepreneur'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.register(formData);
      if (res.token) {
          const userRes = await authService.getMe();
          setUser(userRes.data);
          navigate('/dashboard');
      } else {
         navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Backend/MongoDB may be offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card style={{ width: '450px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Register for Nexus</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleChange} required />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Account Type</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Investor">Investor</option>
              </Form.Select>
            </Form.Group>
            
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Create Account'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;