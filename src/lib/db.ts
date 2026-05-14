import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "skillforge.db");
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    displayName TEXT,
    role TEXT DEFAULT 'student',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT,
    price REAL,
    instructorId TEXT,
    thumbnail TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructorId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    userId TEXT,
    courseId TEXT,
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    enrolledAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (courseId) REFERENCES courses(id),
    UNIQUE(userId, courseId)
  );
`);

// Simple migration: ensure new columns exist
try { db.prepare("ALTER TABLE courses ADD COLUMN category TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE courses ADD COLUMN difficulty TEXT").run(); } catch (e) {}

// Seed initial courses if empty
const count = (db.prepare("SELECT COUNT(*) as count FROM courses").get() as any).count;
if (count === 0) {
  const seedCourses = [
    { id: '1', title: 'Generative AI Fundamentals', description: 'Master the basics of LLMs and Diffusion models.', price: 49.99, thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995' },
    { id: '2', title: 'Advanced Prompt Engineering', description: 'Learn techniques like Chain-of-Thought and ReAct.', price: 79.99, thumbnail: 'https://images.unsplash.com/photo-1676299081847-824916de030a' },
    { id: '3', title: 'AI-Powered Web Development', description: 'Build modern apps with Next.js and Vercel AI SDK.', price: 99.99, thumbnail: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa' }
  ];

  const insert = db.prepare("INSERT INTO courses (id, title, description, price, thumbnail) VALUES (@id, @title, @description, @price, @thumbnail)");
  const insertMany = db.transaction((courses) => {
    for (const course of courses) insert.run(course);
  });
  insertMany(seedCourses);
}

export default db;
