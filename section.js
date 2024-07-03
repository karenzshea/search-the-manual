const fs = require('node:fs/promises');

/*
 * Given a file representing an entire chapter, returns an object:
 * {
 *      chapter_number: 6,
 *      chapter_name: "Arrangement View"
 *      chapter_url: "arrangement-view"
 *      sections: [
 *        {
 *          section_number: 6.1,
 *          section_name: "Arrangement View",
 *          section_url: "#arrangement-view"
 *          text: "...",
 *        }
 *      ]
 * }
 */

// E.g. "6 Arrangement View"
const chapterNrRe = new RegExp(/^(\d+)[\s](.*)$/);

// E.g "8.1.7"
const sectionNrRe = new RegExp(/^(\d+)(\s|\.\d+)+/);

class Section {
    constructor(sectionNumber) {
        this.section_number = sectionNumber;
        this.section_name = null;
        this.section_url = null;
        this.text = '';
    }
}

const parse = async (filepath) => {
    // return object
    let chapter = {};

    const chapterFd = await fs.open(filepath);

    // get the initial chapter information from the first line
    for await (const line of chapterFd.readLines())
    {
        const match = chapterNrRe.exec(line.trim());
        if (match) {
            chapter.chapter_number = match[1];
            chapter.chapter_name = match[2];
            chapter.chapter_url = chapter.chapter_name.toLowerCase().replaceAll(' ', '-');
            break;
        }
    }

    // exit if no chapter information found
    if (!chapter.chapter_number)
    {
        throw Error('Invalid chapter file format');
    }

    chapter.sections = [];

    const fd = await fs.open(filepath);
    const stream = await fd.createReadStream({encoding: 'utf8'});

    return new Promise((resolve, reject) => {
        try {
            let currentSection = chapter.chapter_number;

            let section = new Section(currentSection);

            const saveCurrentSection = (first, last) => {
                // save the entirety|end of the current section
                section.text += data.slice(first, last).join(' ').trim();

                // save the section into the return object
                chapter.sections.push(section);
            };

            stream.on('data', (chunk) => {
                chunkString = chunk.toString().trim();
                data = Array.from(chunkString.split(' '));

                // prevIdx is the index of the beginning of the current section
                // in the current buffer
                for (i = 0, prevIdx = 0; i < data.length; i++) {
                    const word = data[i];

                    const match = sectionNrRe.exec(word);

                    // found a new sub-section
                    if (match && match[1] == chapter.chapter_number)
                    {
                        saveCurrentSection(prevIdx, i);

                        // reset tracking variables
                        prevIdx = i;
                        // current section is now the new one we've just found
                        currentSection = match[0];
                        section = new Section(currentSection);
                    }

                    // at the end of the chunk, flush the current data buffer
                    if (i == data.length - 1)
                    {
                        saveCurrentSection(prevIdx, data.length);
                    }
                };
            });

            stream.on('end', () => {
                resolve(chapter);
            });

        } catch (err) {
            reject(err);
        }
    });
}

exports.parse = parse;
