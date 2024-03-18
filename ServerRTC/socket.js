const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
  const clientId = []
  let streamer = null;
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      // console.log(socket.handshake.query);
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      if (clientId.length === 0) {
        clientId.push(callerId)
      }

      if (clientId.length > 0) {
        const checkValue = clientId.some(id => id === callerId)
        if (!checkValue) {
          clientId.push(callerId)
        }
      }
      next();
    }


  });

  IO.on("connection", (socket) => {
    // console.log('socket: ', socket);
    console.log(socket.user, "Connected");
    socket.join(socket.user); //11

    socket.on('message', (data) => {
      let calleId = data.calleId
      let value = data.value

      clientId.forEach(item => {
        if (item != calleId) {
          socket.to(item).emit('message', { calleId, value })
        }
      })
    })

    socket.on('livestream', (data) => {
      let callerId = data.callerId;
      let rtcMessage = data.rtcMessage
      streamer = callerId;
      console.log('masuk evenet liveStream server, streamer: ', streamer);
      clientId.forEach((item) => {
        if (item != callerId) {
          socket.to(item).emit('newlivestream', {
            callerId: socket.user,
            rtcMessage: rtcMessage
          })
        }
      })
    })

    socket.on('joinlive', data =>{
      let viewer = data.calleId;
      let rtcMessage = data.rtcMessage

      console.log('masuk evenet joinlive server, streamer: ', streamer);
      if(streamer){
        const indexStreamer =  clientId.findIndex(item => item == streamer);
        if(indexStreamer != -1){
          console.log('pengiriman sinyal evenet joinlive');
          socket.to(clientId[indexStreamer]).emit('joinlive', {
            viewer,
            rtcMessage
          })
        }
      }
    })

    socket.on('ICEcandidatels', (data) => {
      console.log("ICE Candidatels server Berjalan: ", data);
      let callerId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      clientId.forEach((item) => {
        if (item != callerId) {
          socket.to(item).emit('ICEcandidatels', {
            callerId: socket.user,
            rtcMessage: rtcMessage
          })
        }
      })


    })

    socket.on("call", (data) => {
      // console.log("masuk panggilan Call socket: ", data);
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;

      socket.to(calleeId).emit("newCall", {
        callerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      let rtcMessage = data.rtcMessage;

      socket.to(callerId).emit("callAnswered", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });


    socket.on("ICEcandidate", (data) => {
      console.log("ICE Candidate server Berjalan: ", data);
      let calleerId = data.calleerId;
      let rtcMessage = data.rtcMessage;

      socket.to(calleerId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on('closeCall', (data) => {
      let calleerId = data.calleerId;
      console.log("close Call Dipanggil", data);

      socket.to(calleerId).emit('closeCall', {
        sender: sock
      })

    })
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error("IO not initilized.");
  } else {
    return IO;
  }
};
