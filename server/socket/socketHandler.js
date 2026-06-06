const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-room', (room) => {
      socket.join(room);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const emitNotification = (io, userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
  }
};

const emitQueueUpdate = (io, doctorId, queueData) => {
  if (io) {
    io.to('queue-display').emit('queue-update', queueData);
    io.to(`doctor-${doctorId}`).emit('queue-update', queueData);
  }
};

const emitGlobalUpdate = (io, event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = { socketHandler, emitNotification, emitQueueUpdate, emitGlobalUpdate };
