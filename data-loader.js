const fs = require('node:fs');

const parser = require('./section');

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

exports.load = async (index, filepath) => {
    try {
        const sections = await parser.parse(filepath);

        if (!sections) {
            return true;
        }

        const client = await connect();

        for (number in sections) {
            console.log(`Add index: ${number}`);

            await client.index({
                index: index,
                body: {
                    section_number: number,
                    text: sections[number],
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
