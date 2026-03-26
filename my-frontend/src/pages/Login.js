import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Login, 2 = OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await authService.login({ email, password });
      
      // Because we enabled 2FA OTP in backend Phase 7:
      if (res.message && res.message.includes('OTP Sent')) {
          setStep(2);
      } else if (res.token) {
          // If no OTP logic active
          const userRes = await authService.getMe();
          setUser(userRes.data);
          navigate('/dashboard');
      } else {
         setError('Unexpected response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check if your backend (and MongoDB) is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      
      try {
          const res = await authService.verifyOtp({ email, otp });
          if(res.token) {
              const userRes = await authService.getMe();
              setUser(userRes.data);
              navigate('/dashboard');
          }
      } catch (err) {
          setError(err.response?.data?.error || 'OTP verification failed');     
      } finally {
          setLoading(false);
      }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card style={{ width: '400px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Login to Nexus</h3>
          {error && <Alert variant="danger">{error}</Alert>}

          {step === 1 ? (
            <Form onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Enter email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Enter password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </Form.Group>
              
              <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleOtpSubmit}>
              <Alert variant="info">
                An OTP has been sent to your email (or printed in the backend terminal logs).
              </Alert>
              <Form.Group className="mb-3">
                <Form.Label>Enter OTP</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="6-digit OTP" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                />
              </Form.Group>
              <Button variant="success" type="submit" className="w-100" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Verify OTP'}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>

  );
};

export default Login;
