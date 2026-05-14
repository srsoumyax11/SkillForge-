import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import db from "./src/lib/db";

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";

// Note: Gemini AI is still available via server-side process.env if needed

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Middleware to authenticate JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
    }
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      const stmt = db.prepare("INSERT INTO users (id, email, password, displayName) VALUES (?, ?, ?, ?)");
      stmt.run(userId, email, hashedPassword, displayName);

      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
      res.json({ user: { id: userId, email, displayName, role: "student" } });
    } catch (error: any) {
      res.status(400).json({ error: error.message.includes("UNIQUE") ? "Email already exists" : error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
      res.json({ user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const user: any = db.prepare("SELECT id, email, displayName, role FROM users WHERE id = ?").get(req.user.id);
    res.json({ user });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini AI Mentor Route (Mocked or using node-fetch if genai removed)
  app.post("/api/ai/mentor", authenticateToken, async (req, res) => {
    res.status(501).json({ error: "AI Mentor is temporarily disabled during migration to local DB. Please check back later." });
  });

  // Stripe Checkout Session
  app.post("/api/checkout/create-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const { courseId, title, price, successUrl, cancelUrl } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: title,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { courseId },
      });

      res.json({ id: session.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Courses Routes
  app.get("/api/courses", (req, res) => {
    try {
      const courses = db.prepare("SELECT * FROM courses").all();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/courses", authenticateToken, (req: any, res) => {
    try {
      const { title, category, price, difficulty, thumbnail, description } = req.body;
      const courseId = uuidv4();
      
      const stmt = db.prepare(`
        INSERT INTO courses (id, title, category, price, difficulty, thumbnail, description, instructorId) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(courseId, title, category, price, difficulty, thumbnail, description, req.user.id);
      
      res.json({ message: "Course created successfully", id: courseId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/courses/:id", (req, res) => {
    try {
      const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enrollments Routes
  app.get("/api/enrollments", authenticateToken, (req: any, res) => {
    try {
      const enrollments = db.prepare(`
        SELECT e.*, c.title, c.thumbnail 
        FROM enrollments e 
        JOIN courses c ON e.courseId = c.id 
        WHERE e.userId = ?
      `).all(req.user.id);
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/enrollments", authenticateToken, (req: any, res) => {
    try {
      const { courseId } = req.body;
      const enrollmentId = uuidv4();
      const stmt = db.prepare("INSERT INTO enrollments (id, userId, courseId) VALUES (?, ?, ?)");
      stmt.run(enrollmentId, req.user.id, courseId);
      res.json({ message: "Enrolled successfully", id: enrollmentId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
