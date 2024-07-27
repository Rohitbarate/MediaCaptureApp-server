// src/routes/mediaRoutes.ts
import { Router, Request, Response } from "express";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import multer from "multer";
import s3 from "../awsConfig";
import Media from "../models/Media";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route("/get-all/:userId").get(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const media = await Media.find({ userId });

    if (!media) {
      return res.status(404).json({ message: "No media found" });
    }

    res.status(200).json({ data: media });
  } catch (err) {
    if (err instanceof Error) {
      console.log({ "media-upload-error": err.message });

      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router
  .route("/upload")
  .post(upload.single("file"), async (req: Request, res: Response) => {
    try {
      console.log({ fileB: req.file, userIdB: req.body.userId });

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      if (!req?.body.userId) {
        return res.status(400).json({ message: "userId not found" });
      }

      const { buffer, originalname } = req.file;
      const key = `${uuidv4()}_${req.body.userId}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: req.file.mimetype,
      });

      await s3.send(command);

      // Save metadata to MongoDB
      const media = new Media({
        userId: req?.body.userId,
        key: key,
        fileType: req.file.mimetype,
        createdAt: Date.now(),
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      });
      await media.save();
      res.status(201).json({ message: "File uploaded successfully", key });
    } catch (err) {
      if (err instanceof Error) {
        console.log({ "media-upload-error": err.message });

        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });

router.route("/delete/:key").delete(async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { userId } = req.body;
    console.log({ key, userId });

    // Check if the object exists
    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
        })
      );
    } catch (err) {
      // If the error is that the object does not exist, return a 404
      console.log("NotFound");
      if (err instanceof Error && err.name === "NotFound") {
        return res.status(404).json({ message: "File not found" });
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    await s3.send(command);

    const del: any = await Media.findOneAndDelete({ key, userId });
    console.log({ del });

    res
      .status(200)
      .json({ message: "File deleted successfully", key: del.key });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.route("/save/:key").post(async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const { key } = req.params;
    const media: any = await Media.findOne({ userId, key });

    if (!media) {
      return res.status(404).json({ message: "No media found" });
    }
    console.log({ url: media.url });
    res.download(media.url);
    // res.status(200).json({ data: media });
  } catch (err) {
    if (err instanceof Error) {
      console.log({ "media-upload-error": err.message });

      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

export default router;
