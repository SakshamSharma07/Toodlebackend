// routes/journals.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Journal = require("../models/journal");
const User = require("../models/user");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Buffer } = require("buffer");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

// Middleware to validate JWT token and check user role
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

// Create a journal with file attachment

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFileName);
  },
});
const upload = multer({ storage });

//create a journal
router.post(
  "/createJournal",
  authenticateUser,
  upload.single("attachment"),
  async (req, res) => {
    const { description, taggedStudents } = req.body;
    const { userId } = req.user;
    const { filename, path } = req.file;

    try {
      const user = await User.findByPk(userId);
      if (!user || user.role !== "teacher") {
        return res.status(403).json({ message: "Access denied" });
      }

      const fileData = fs.readFileSync(path);
      const journal = await Journal.create({
        description,
        taggedStudents,
        attachment: filename, // Save the file name in the attachment field
        teacherId: user.id,
      });

      res.status(201).json({ journal });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    } finally {
      // Delete the temporary file from the file system
      fs.unlinkSync(path);
    }
  }
);

// Update a journal
router.put("/:journalId", authenticateUser, async (req, res) => {
  const { journalId } = req.params;
  const { description, taggedStudents, attachment } = req.body;
  const { userId } = req.user;

  try {
    const journal = await Journal.findByPk(journalId);
    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== "teacher" || journal.teacherId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    journal.description = description;
    journal.taggedStudents = taggedStudents;
    journal.attachment = attachment;
    await journal.save();

    res.json({ journal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a journal
router.delete("/:journalId", authenticateUser, async (req, res) => {
  const { journalId } = req.params;
  const { userId } = req.user;

  try {
    const journal = await Journal.findByPk(journalId);
    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== "teacher" || journal.teacherId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await journal.destroy();

    res.json({ message: "Journal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Publish a journal
router.post("/:journalId/publish", authenticateUser, async (req, res) => {
  try {
    const { journalId: journalIdParam } = req.params;
    const journal = await Journal.findByPk(journalIdParam, {
      include: { model: User, as: "teacher" },
    });
    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    const user = journal.teacher;
    const role = user.role;

    // Define the filters based on the user's role
    let filters;
    if (role === "teacher") {
      filters = {
        where: {
          teacherId: user.id,
        },
      };
    } else if (role === "student") {
      filters = {
        where: {
          taggedStudents: {
            [Op.contains]: [user.id],
          },
          published_at: {
            [Op.lte]: new Date(),
          },
        },
      };
    }

    // Fetch the journals based on the filters
    const journals = await Journal.findAll(filters);

    res.status(200).json({ journals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
