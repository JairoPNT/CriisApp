const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fieldName = file.fieldname;
        // User/Brand photos go to 'pictures' volume, Tickets go to 'uploads' volume
        const folder = (fieldName === 'avatar' || fieldName === 'logo' || fieldName === 'favicon' || fieldName === 'horizontalLogo' || fieldName === 'panelLogo')
            ? 'pictures/'
            : 'uploads/';
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Solo se permiten imágenes (jpeg, jpg, png, webp)');
        }
    },
});

module.exports = upload;
