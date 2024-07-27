// export const uploadMedia = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const { buffer, originalname } = req.file;
//     const key = `${uuidv4()}_${path.basename(originalname)}`;

//     const command = new PutObjectCommand({
//       Bucket: process.env.AWS_BUCKET_NAME!,
//       Key: key,
//       Body: buffer,
//       ContentType: req.file.mimetype,
//     });

//     await s3.send(command);

//     res.status(201).json({ message: "File uploaded successfully", key });
//   } catch (err) {
//     if (err instanceof Error) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(500).json({ error: "An unknown error occurred" });
//     }
//   }
// };
