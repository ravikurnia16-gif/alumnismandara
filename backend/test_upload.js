const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('title', 'Test News Title');
    form.append('content', 'This is a test content for the news.');

    // We need a valid admin token! Wait, I can just remove the auth middleware for a second, or generate a valid token.
  } catch (e) {
    console.error(e.message);
  }
}
test();
