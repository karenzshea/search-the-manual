const { argv } = require('node:process');

const express = require('express');
var logger = require('morgan');

const data = require('./data-loader');

const index = 'live-12-docs';

const main = async () => {
    if (argv[2]) {
        const loaded = await data.load(index, argv[2]);
        if (!loaded) {
            console.log(`Failed to load data`);
            process.exit();
        }
    }

    const app = express();
    const port = 3000;

    // enable logging
    logger = logger(
        ':method :url :status :res[content-length] - :response-time ms'
    );
    app.use(logger);

    app.listen(port, function () {
        console.log(`Example app listening on port ${port}!`);
    });
};

main();
