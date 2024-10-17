const DatauriParser = require('datauri/parser');
const path = require('path');

const parser = new DatauriParser()

const getDataurl = (file) => {
    if (!file || !file.originalname || !file.buffer) {
        throw new Error('Invalid file object passed to getDataurl');
    }
    
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer).content;
};

module.exports = getDataurl;
