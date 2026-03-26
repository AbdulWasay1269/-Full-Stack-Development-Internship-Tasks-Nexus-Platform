import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { Container, Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';

const Payments = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [actionType, setActionType] = useState('deposit');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchHistory = async () => {
        try {
            const res = await paymentService.getHistory();
            setTransactions(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    useEffect(() => {
        if (user) fetchHistory();
    }, [user]);

    const handleTransaction = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!amount || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        try {
            if (actionType === 'deposit') {
                await paymentService.deposit(amount);
                setMessage(`Started mock deposit of $${amount}. Note: Stripe checkout logic goes here in production!`);
            } else if (actionType === 'withdraw') {
                const res = await paymentService.withdraw(amount);
                setMessage(res.message);
            }
            setAmount('');
            fetchHistory();
        } catch (err) {
            setError(err.response?.data?.error || 'Transaction failed');
        }
    };

    if (!user) return <p className="p-3">Please login to access Payments.</p>;

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Financial Dashboard (Mock)</h2>
            
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Card.Title>Make a Transaction</Card.Title>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form onSubmit={handleTransaction} className="d-flex gap-3 align-items-end">
                        <Form.Group>
                            <Form.Label>Amount (USD)</Form.Label>
                            <Form.Control type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Action</Form.Label>
                            <Form.Select value={actionType} onChange={(e) => setActionType(e.target.value)}>
                                <option value="deposit">Deposit</option>
                                <option value="withdraw">Withdraw</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit">Execute</Button>
                    </Form>
                </Card.Body>
            </Card>

            <h3 className="mb-3">Transaction History</h3>
            {transactions.length === 0 ? <p>No transactions found.</p> : (
                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(txn => (
                            <tr key={txn._id}>
                                <td>{txn._id.substring(0,8)}...</td>
                                <td className="text-capitalize">{txn.type}</td>
                                <td>${txn.amount}</td>
                                <td>
                                    <Badge bg={txn.status === 'completed' ? 'success' : 'warning'}>
                                        {txn.status}
                                    </Badge>
                                </td>
                                <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default Payments;
