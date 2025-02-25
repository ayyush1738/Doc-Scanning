const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../uploads")); // ✅ Fixed path
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // ✅ Avoid filename conflicts
    }
});

const upload = multer({ storage });

module.exports = upload;
