import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/documentService';
import SignatureCanvas from 'react-signature-canvas';
import { Container, Card, Form, Button, Alert, Row, Col, Modal } from 'react-bootstrap';

const Documents = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);

    // Upload States
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    // UI Render states
    const sigCanvas = useRef({});
    const [signingDocId, setSigningDocId] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);

    const fetchDocuments = async () => {
        try {
            const res = await documentService.getDocuments();
            setDocuments(res.data);
        } catch (err) {
            console.error("Failed to fetch documents", err);
        }
    };

    useEffect(() => {
        if (user) fetchDocuments();
    }, [user]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploadError('');
        setUploadSuccess('');

        if (!file || !title) {
            setUploadError('Title and file are both required.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('documentFile', file);

        try {
            await documentService.uploadDocument(formData);
            setUploadSuccess('Document uploaded successfully!');
            setTitle('');
            setFile(null);
            document.getElementById('file-input').value = ''; 
            fetchDocuments();
        } catch (err) {
            setUploadError(err.response?.data?.error || 'Failed to upload document');
        }
    };

    const clearSignature = () => {
        sigCanvas.current.clear();
    };

    const saveSignature = async () => {
        if (sigCanvas.current.isEmpty()) {
            alert('Please draw a signature first.');
            return;
        }

        try {
            const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            await documentService.signDocument(signingDocId, dataURL);

            setSigningDocId(null);
            fetchDocuments();
        } catch (err) {
            alert('Failed to sign document');
        }
    };

    if (!user) return <p className="p-4">Please login to access the Document Vault.</p>;

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Document Chamber</h2>

            <Row>
                <Col md={5}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <Card.Title>Upload New Document</Card.Title>
                            {uploadError && <Alert variant="danger">{uploadError}</Alert>}
                            {uploadSuccess && <Alert variant="success">{uploadSuccess}</Alert>}

                            <Form onSubmit={handleUpload}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Document Title</Form.Label>
                                    <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select File (PDF, DOC/X)</Form.Label>
                                    <Form.Control id="file-input" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100">Upload to Vault</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={7}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-dark text-white">Your Vault</Card.Header>
                        <Card.Body>
                            {documents.length === 0 ? <p>No documents found.</p> : (
                                <ul className="list-unstyled">
                                    {documents.map(doc => (
                                        <li key={doc._id} className="border p-3 mb-3 bg-light rounded">
                                            <h5 className="m-0 mb-2">{doc.title}</h5>
                                            <p className="m-0 text-muted small"><strong>File:</strong> {doc.filename}</p>
                                            <p className="m-0 text-muted small mb-2"><strong>Status:</strong> <span className={doc.status === 'signed' ? 'text-success fw-bold' : 'text-warning fw-bold'}>{doc.status.toUpperCase()}</span></p>

                                            <div className="d-flex gap-2">
                                                <Button variant="secondary" size="sm" onClick={() => setPreviewDoc(doc)}>
                                                    Preview Inline
                                                </Button>

                                                {doc.status === 'pending' && (
                                                    <Button variant="success" size="sm" onClick={() => setSigningDocId(doc._id)}>
                                                        E-Sign Document
                                                    </Button>
                                                )}
                                            </div>

                                            {doc.status === 'signed' && doc.signature && (
                                                <div className="mt-3 p-2 border bg-white text-center rounded">
                                                    <p className="text-muted small m-0 mb-1">Digitally Signed:</p>
                                                    <img src={doc.signature} alt="E-Signature" style={{ maxHeight: '60px' }} />
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

            {/* PREVIEW MODAL */}
            <Modal show={!!previewDoc} onHide={() => setPreviewDoc(null)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{previewDoc?.title} - Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0" style={{ height: '70vh' }}>
                    {previewDoc && (
                        <object 
                            data={`http://localhost:5000/uploads/${previewDoc.filepath}`} 
                            type="application/pdf" 
                            width="100%" 
                            height="100%"
                        >
                            <p>Your browser does not support PDF previews. <a href={`http://localhost:5000/uploads/${previewDoc.filepath}`} target="_blank" rel="noreferrer">Download the file here</a>.</p>
                        </object>
                    )}
                </Modal.Body>
            </Modal>

            {/* SIGNATURE MODAL */}
            <Modal show={!!signingDocId} onHide={() => setSigningDocId(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Draw Your Signature</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <div className="border border-dark mb-3" style={{ width: '100%', height: '200px', backgroundColor: '#f9f9f9' }}>
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{ className: 'sigCanvas', style: { width: '100%', height: '100%' } }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={clearSignature}>Clear</Button>
                    <Button variant="success" onClick={saveSignature}>Save Signature</Button>
                </Modal.Footer>
            </Modal>
        </Container>

    );
};

export default Documents;
