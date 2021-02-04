"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var formidable = require('formidable');
exports.parseForm = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
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
};
//# sourceMappingURL=index.js.map