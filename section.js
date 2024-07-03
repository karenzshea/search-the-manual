const fs = require('node:fs/promises');


const parse = async (filepath) => {
    const fd = await fs.open(filepath);

    const stream = await fd.createReadStream({encoding: 'utf8'});

    const sectionNrRe = new RegExp(/^(\d+)(\s|\.\d+)+/);

    return new Promise((resolve, reject) => {
        try {
            let sections = {};

            let currentSection = null;

            stream.on('data', (chunk) => {
                chunkString = chunk.toString().trim();
                data = Array.from(chunkString.split(' '));

                // initialize section vars at the very beginning of the file
                if (!currentSection)
                {
                    // Assume that the first character after trimming is the number
                    // of the current chapter
                    chapterNumber = data[0];
                    currentSection = chapterNumber;
                }

                for (i = 0, prevIdx = 0; i < data.length; i++) {

                    // helper function
                    const saveSection = (first, last) => {
                        if (!sections[currentSection])
                        {
                            sections[currentSection] = data.slice(first, last).join(' ').trim();
                        }
                        else
                        {
                            sections[currentSection] += data.slice(first, last).join(' ').trim();
                        }
                    }

                    const word = data[i];

                    const match = sectionNrRe.exec(word);

                    // found a new sub-section
                    if (match && match[1] == chapterNumber)
                    {
                        // save the entirety|end of the current section
                        saveSection(prevIdx, i);

                        prevIdx = i;
                        currentSection = match[0];
                    }

                    // flush the current data buffer
                    if (i == data.length - 1)
                    {
                        saveSection(prevIdx, data.length);
                    }
                };
            });

            stream.on('end', () => {
                resolve(sections);
            });

        } catch (err) {
            reject(err);
        }
    });
}

exports.parse = parse;
