const request = require('supertest');
const express = require('express');
const server = require('../server.js')

// CANNOT RUN WHILE SERVER INSTANCE IS ACTIVE SINCE THE PORT IS OCCUPIED
test('make server request', () => {
  request(server)
  .get('/user')
  .expect('Content-Type', /text/)
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });
});
