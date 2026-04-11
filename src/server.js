const { createCentralizerApp } = require('../app');
const env  = require('./configs/env.config');

const app = createCentralizerApp();

app.listen(env.port, () => {
    console.log(`Centralizer running on port ${env.port}`);
});