const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: {
      url: fileUrl,
      relativePath: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
};

module.exports = { uploadFile };
