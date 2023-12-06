const app = require('./config/express');
const { port, env } = require('./config/vars');


app.listen(port, () => {
    console.log(`server started on port ${port} (${env})`);
});

module.exports = app;