let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
var users = [];
io.on('connection', (socket) => {
    socket.on('disconnect', function(){
      users.splice(socket.User, 1);
      io.sockets.emit('list-user-chat', users); 
    });
    socket.on('admin-online', (nickname) => {
      socket.Admin = nickname;
      socket.join(socket.User);
    });
    socket.on('user-online', (nickname) => {
      socket.join(nickname);
      socket.User = nickname;
      users.push(nickname);
      io.sockets.emit('list-user-chat', users); 
    });
    
    socket.on('user-add-message', (message) => {
      console.log('user-add-message:'+message.user)
        socket.broadcast.in().emit('message-admin', {text: message.text, from: socket.User, created: new Date()});
        socket.emit('message-admin', {text: message.text, from: socket.User, created: new Date()}); 
    });
    socket.on('admin-add-message', (message) => {
      console.log('admin-add-message:'+message.user);
      socket.broadcast.in(message.user).emit('message-user', {text: message.text, from: socket.Admin, created: new Date()});
      socket.emit('message-user', {text: message.text, from: socket.Admin, created: new Date()});
    });
    // handing typing message admin
    socket.on('typing-message-on', (message) => {
      var status = 'Đang nhập tin nhắn...';
      socket.broadcast.in(message.user).emit('admin-typing-message-on', status);
    });
    socket.on('typing-message-off', (message) => {
      var status = '';
      socket.broadcast.in(message.user).emit('admin-typing-message-off', status);
    });
    // handing typing message user
    socket.on('user-typing-message-on', (message) => {
      var status = 'Đang nhập tin nhắn...';
      socket.broadcast.in().emit('user-admin-typing-message-on', {from: message, status: status});
    });
    socket.on('user-typing-message-off', (message) => {
      var status = '';
      socket.broadcast.in().emit('user-admin-typing-message-off', {from: message, status: status});
    });
  });

var port = process.env.port || 3001;
http.listen(port, function() {
    console.log('Server chat running in localhost:' + port);
});