import { Server } from 'socket.io';

let ioInstance = null;

export const getProjectRoom = (projectId) => `project:${projectId}`;

export const initializeSocketServer = (httpServer, corsOptions) => {
  ioInstance = new Server(httpServer, {
    cors: corsOptions,
  });

  ioInstance.on('connection', (socket) => {
    socket.on('joinProject', (projectId) => {
      if (!projectId) {
        return;
      }

      socket.join(getProjectRoom(projectId));
      socket.emit('projectJoined', { projectId });
    });

    socket.on('leaveProject', (projectId) => {
      if (!projectId) {
        return;
      }

      socket.leave(getProjectRoom(projectId));
      socket.emit('projectLeft', { projectId });
    });
  });

  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitToProject = (projectId, eventName, payload) => {
  if (!ioInstance || !projectId) {
    return;
  }

  ioInstance.to(getProjectRoom(projectId)).emit(eventName, payload);
};
