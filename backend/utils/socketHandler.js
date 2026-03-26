module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.id}`);

        // 1. Join a specific meeting room
        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            console.log(`User ${userId} (${socket.id}) joined room ${roomId}`);
            
            // Notify others in the room that a new user joined
            socket.to(roomId).emit('user-connected', userId);
            
            socket.on('disconnect', () => {
                console.log(`User ${userId} disconnected from room ${roomId}`);
                socket.to(roomId).emit('user-disconnected', userId);
            });
        });

        // 2. WebRTC Signaling: Offer
        socket.on('offer', (payload) => {
            // payload expects { targetUserId, callerId, sdp }
            io.to(payload.targetUserId).emit('offer', payload);
        });

        // 3. WebRTC Signaling: Answer
        socket.on('answer', (payload) => {
            // payload expects { targetUserId, callerId, sdp }
            io.to(payload.targetUserId).emit('answer', payload);
        });

        // 4. WebRTC Signaling: ICE Candidates
        socket.on('ice-candidate', (payload) => {
            // payload expects { targetUserId, candidate }
            io.to(payload.targetUserId).emit('ice-candidate', payload);
        });
        
        // General disconnect handling
        socket.on('disconnect', () => {
            console.log(`User Disconnected: ${socket.id}`);
        });
    });
};
