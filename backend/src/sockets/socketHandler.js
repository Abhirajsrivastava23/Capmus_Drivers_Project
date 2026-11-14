const Message = require('../models/Message');
const TripLocation = require('../models/TripLocation');

const initSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join user-specific notification room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.IO] User ${userId} joined room user_${userId}`);
      }
    });

    // Join ride-specific room (for in-ride chat and live GPS tracking)
    socket.on('join_ride_room', (rideId) => {
      if (rideId) {
        socket.join(`ride_${rideId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined room ride_${rideId}`);
      }
    });

    socket.on('leave_ride_room', (rideId) => {
      if (rideId) {
        socket.leave(`ride_${rideId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left room ride_${rideId}`);
      }
    });

    // Real-time chat message delivery
    socket.on('send_message', async (data) => {
      try {
        const { ride_id, sender_id, receiver_id, text } = data;
        if (!ride_id || !sender_id || !text) return;

        const msg = await Message.create({
          ride_id,
          sender_id,
          receiver_id,
          message: text.trim(),
          sent_at: Date.now(),
        });

        await msg.populate('sender_id', 'name student_id');
        await msg.populate('receiver_id', 'name student_id');

        // Broadcast to everyone in the ride chat room
        io.to(`ride_${ride_id}`).emit('new_message', msg);
        // Also deliver to direct user room
        io.to(`user_${receiver_id}`).emit('direct_message', msg);
      } catch (err) {
        console.error('[Socket.IO] Error sending message:', err.message);
      }
    });

    // Real-time typing indicators
    socket.on('typing', ({ ride_id, user_name }) => {
      socket.to(`ride_${ride_id}`).emit('user_typing', { user_name });
    });

    socket.on('stop_typing', ({ ride_id }) => {
      socket.to(`ride_${ride_id}`).emit('user_stop_typing');
    });

    // Real-time live GPS location updates from Driver
    socket.on('driver_location_update', async (data) => {
      try {
        const { ride_id, driver_id, latitude, longitude, speed, heading } = data;
        if (!ride_id || latitude === undefined || longitude === undefined) return;

        await TripLocation.findOneAndUpdate(
          { ride_id },
          { driver_id, latitude, longitude, speed: speed || 0, heading: heading || 0, updated_at: Date.now() },
          { upsert: true }
        );

        // Broadcast to passengers tracking this ride
        socket.to(`ride_${ride_id}`).emit('trip_location_update', {
          ride_id,
          latitude,
          longitude,
          speed,
          heading,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('[Socket.IO] Error updating driver location:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocketIO };
