const { argv } = require('node:process');
const fs = require('node:fs');
const url = require('node:url');

const parser = require('../chapter');

(async () => {
    if (!argv[2]) {
        console.log('Need chapter file');
        return;
    }
    const baseUrl = 'https://www.ableton.com/en/live-manual/12/';

    parser
        .parse(argv[2], baseUrl)
        .catch((err) => {
            console.log(`Failed to parse: ${err}`);
            process.exit(1);
        })
        .then((chapterData) => {
            console.log(
                `###\n$ Chapter: ${chapterData.chapter_number} ${chapterData.chapter_name}`
            );
            console.log(`$ Link to chapter: ${chapterData.chapter_url}`);

            for (i = 0; i < chapterData.sections.length; i++) {
                const section = chapterData.sections[i];
                console.log(
                    `$ Section: ${section.section_number} ${section.section_name}`
                );
                console.log(`$ Link to section ${section.section_url}`);
                console.log(`$ Content:\n${section.text}`);
            }
        });
})();
