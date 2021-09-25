const request = require('supertest');
const express = require('express');
const server = require('../server.js')

// CANNOT RUN WHILE SERVER INSTANCE IS ACTIVE SINCE THE PORT IS OCCUPIED
test('make server request', async () => {
  await request(server)
        .get("/")
        .expect(200)
        .then((response) => {
          expect(response.text).toBe('Server Up and Running!');
        })
});
