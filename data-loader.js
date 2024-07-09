const fs = require('node:fs');

const parser = require('./chapter');

const { Client } = require('@elastic/elasticsearch');
const config = require('config');

const elasticConfig = config.get('elastic');

const connect = async () => {
    const client = new Client({
        node: elasticConfig.endpoint_url,
        auth: {
            username: elasticConfig.username,
            password: elasticConfig.password,
        },
        tls: {
            ca: fs.readFileSync('./http_ca.crt'),
            rejectUnauthorized: false,
        },
    });

    return client;
};

exports.load = async (index, filepath, baseUrl) => {
    try {
        const chapter = await parser.parse(filepath, baseUrl);

        if (!chapter) {
            console.log('No data');
            return true;
        }

        console.log(
            `Indexing chapter: ${chapter.chapter_number} ${chapter.chapter_name}`
        );

        const client = await connect();

        indexReqs = [];

        for (i = 0; i < chapter.sections.length; i++) {
            const section = chapter.sections[i];

            console.log(
                `Indexing section: ${section.section_number} ${section.section_name}`
            );

            indexReqs.push( client.index({
                index: index,
                body: {
                    section_name: section.section_name,
                    section_number: section.section_number,
                    section_url: section.section_url,
                    text: section.text,
                },
            }));
        }

        await Promise.all(indexReqs);

        await client.indices.refresh({ index: index });

        return true;
    } catch (err) {
        console.error(err);

        return false;
    }
};

exports.bulk_load = async (index, filepath) => {
    try {
        await client.indices.create({
            index: 'index',
            operations: {
                mappings: {
                    properties: {
                        chapter_number: { type: 'text' },
                        chapter_name: { type: 'text' },
                        section_number: { type: 'text' },
                        section_name: { type: 'text' },
                        text: { type: 'text' },
                        text_url: { type: 'text' },
                    },
                },
            },
        });

        return true;
    } catch (err) {
        console.error(err);

        return false;
    }
};
