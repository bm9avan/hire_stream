import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      req.user ? req.user.uid : req.body.uid + "_-_" + file.originalname
    );
  },
});

export default multer({ storage });
