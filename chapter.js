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

// E.g "8.1.7 Making it sound wacky"
const sectionNrRe = new RegExp(/^(\d+)(\.\d+)+[\s](.*)$/);

class Chapter {
    constructor() {
        this.chapter_number = null;
        this.chapter_name = null;
        this.chapter_url = null;
        this.sections = [];
    }
    hasChapterInfo() {
        return this.chapter_name && this.chapter_number && this.chapter_url;
    }
    setChapterInfo(number, name, url) {
        this.chapter_number = number;
        this.chapter_name = name;
        this.chapter_url = url;
    }
}

class Section {
    constructor() {
        this.section_number = null;
        this.section_name = null;
        this.section_url = null;
        this.text = '';
    }
    fromChapter(chapter) {
        this.section_number = chapter.chapter_number;
        this.section_name = chapter.chapter_name;
        this.section_url = chapter.chapter_url;
    }
}

const parse = async (filepath, baseUrlString) => {
    const baseUrl = new URL(baseUrlString);

    // return object
    let chapter = new Chapter();

    const chapterFd = await fs.open(filepath);

    let currentSection = new Section();

    for await (const line of chapterFd.readLines()) {
        if (!chapter.hasChapterInfo()) {
            // get the initial chapter information from the first line
            const match = chapterNrRe.exec(line.trim());
            if (match) {
                const chapterPath = match[2].toLowerCase().replaceAll(' ', '-');
                const chapterUrl = new URL(chapterPath, baseUrl);
                chapter.setChapterInfo(match[1], match[2], chapterUrl.href);
                currentSection.fromChapter(chapter);
            }
        } else {
            const match = sectionNrRe.exec(line.trim());

            // found a new sub-section
            if (match && match[1] == chapter.chapter_number) {
                // new section means current section is done
                chapter.sections.push(currentSection);

                // start new section
                currentSection = new Section();
                currentSection.section_number = match[0].split(' ')[0];
                currentSection.section_name = match[3];

                const sectionFragment = `#${match[3].toLowerCase().replaceAll(' ', '-')}`;
                const sectionUrl = new URL(
                    sectionFragment,
                    chapter.chapter_url
                );
                currentSection.section_url = sectionUrl.href;
            }

            currentSection.text += `${line}\n`;
        }
    }

    // exit if no chapter information found
    if (!chapter.hasChapterInfo()) {
        throw Error('Invalid chapter file format');
    }

    // flush last section
    chapter.sections.push(currentSection);

    return chapter;
};

exports.parse = parse;
