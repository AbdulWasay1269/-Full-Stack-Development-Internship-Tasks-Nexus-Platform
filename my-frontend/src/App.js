import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import VideoCall from './pages/VideoCall';
import Documents from './pages/Documents';
import Payments from './pages/Payments';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
          <Container>
            <Navbar.Brand as={Link} to="/">Nexus Platform</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/meetings">Meetings</Nav.Link>
                <Nav.Link as={Link} to="/documents">Documents</Nav.Link>
                <Nav.Link as={Link} to="/payments">Payments</Nav.Link>
                <Nav.Link as={Link} to="/call">Video Call</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="mb-5">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/call" element={<VideoCall />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
