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

        const client = await connect();

        console.log(
            `Indexing chapter: ${chapter.chapter_number} ${chapter.chapter_name}`
        );

        for (i = 0; i < chapter.sections.length; i++) {
            const section = chapter.sections[i];

            console.log(
                `Indexing section: ${section.section_number} ${section.section_name}`
            );

            await client.index({
                index: index,
                body: {
                    section_name: section.section_name,
                    section_number: section.section_number,
                    section_url: section.section_url,
                    text: section.text,
                },
            });
        }

        await client.indices.refresh({ index: index });

        return true;
    } catch (err) {
        console.error(err);

        return false;
    }
};
