const { argv } = require('node:process');
const fs = require('node:fs/promises');
const path = require('node:path');

const express = require('express');
var logger = require('morgan');

const data = require('./data-loader');

const config = require('config');

const index = 'live-12-docs';

const main = async () => {
    if (argv[2]) {
        const manualDataConfig = config.get('live-manual');

        const input = argv[2];

        const fd = await fs.open(input);
        const stats = await fd.stat();

        let files = [];

        if (stats.isDirectory()) {
            files = await fs.readdir(input);
            files = files.map((fp) => path.resolve(input, fp));
        } else {
            files.push(input);
        }

        files.forEach(async (filePath) => {
            console.log(`Loading ${filePath}...`);

            const loaded = await data.load(
                index,
                filePath,
                manualDataConfig.base_url
            );

            if (!loaded) {
                console.log(`Failed to load data ${filePath}`);
            }
        });
    }
};

main();
