const socketIO = require("socket.io");

const SocketServer = (server) => {
  const io = socketIO(server, {
    cors: {
      orgin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionSuccessStatus: 204,
    },
  });
  io.on("connection", (socket) => {
    socket.on("click_action_ticket", async (click) => {
      // customer clicks on ticket
    });
  });
};

module.exports = SocketServer;
