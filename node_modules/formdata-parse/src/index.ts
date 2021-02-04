const formidable = require('formidable');

export const parseForm = (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }

        req['fields'] = fields;
        req['files'] = files;
        req['express_formidable'] = { parsed: true };

        // Object.assign(req, { fields, files, express_formidable: { parsed: true } });
        next();
    });
}