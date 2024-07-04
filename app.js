const { argv } = require('node:process');

const express = require('express');
var logger = require('morgan');

const data = require('./data-loader');

const config = require('config');

const index = 'live-12-docs';

const main = async () => {
    if (argv[2]) {
        const filePath = argv[2];
        const manualDataConfig = config.get('live-manual');
        const loaded = await data.load(
            index,
            filePath,
            manualDataConfig.base_url
        );
        if (!loaded) {
            console.log(`Failed to load data`);
            process.exit();
        }
    }
};

main();
