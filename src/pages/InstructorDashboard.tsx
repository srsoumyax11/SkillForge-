import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, LayoutGrid, Users, DollarSign, BarChart3, Settings, BookOpen, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, doc, writeBatch } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  students: number;
  revenue: number;
  rating: number;
  status: "Published" | "Draft";
  category: string;
}

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSeeding, setIsSeeding] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("0");
  const [difficulty, setDifficulty] = useState("beginner");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "courses"),
      where("instructorId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setCourses(courseData as Course[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "courses");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    try {
      await addDoc(collection(db, "courses"), {
        title,
        category,
        price: parseFloat(price),
        difficulty,
        instructorId: user.uid,
        instructorName: user.displayName || "Instructor",
        status: "Published",
        students: 0,
        revenue: 0,
        rating: 5.0,
        duration: "10 Hours",
        createdAt: serverTimestamp(),
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
      });
      
      toast.success("Course created successfully!");
      setIsCreateDialogOpen(false);
      // Reset form
      setTitle("");
      setCategory("");
      setPrice("0");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "courses");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSeedCourse = async (courseId: string) => {
    setIsSeeding(courseId);
    try {
      const batch = writeBatch(db);
      
      const modules = [
        { title: "Foundations of AI & ML", order: 1 },
        { title: "Neural Network Architectures", order: 2 },
        { title: "LLM Fine-Tuning & Applications", order: 3 },
      ];

      for (const mod of modules) {
        const modRef = doc(collection(db, "courses", courseId, "modules"));
        batch.set(modRef, { title: mod.title, order: mod.order });

        const lessons = [
          { title: `${mod.title} Part 1: Introduction`, duration: "10m", order: 1, type: "video" },
          { title: `${mod.title} Part 2: Deep Dive`, duration: "15m", order: 2, type: "video" },
          { title: `${mod.title} Practical Lab`, duration: "45m", order: 3, type: "text" },
        ];

        for (const lesson of lessons) {
          const lessonRef = doc(collection(db, "courses", courseId, "modules", modRef.id, "lessons"));
          batch.set(lessonRef, { ...lesson });
        }
      }

      await batch.commit();
      toast.success("Course curriculum seeded successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `courses/${courseId}/modules`);
    } finally {
      setIsSeeding(null);
    }
  };

  const handleSeedMarketplace = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const batch = writeBatch(db);
      const mockCourses = [
        {
          title: "Mastering Large Language Models",
          category: "LLMs",
          price: 99,
          difficulty: "advanced",
          thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
          description: "Learn how to build, fine-tune, and deploy state-of-the-art LLMs."
        },
        {
          title: "Intro to Generative AI",
          category: "Generative AI",
          price: 49,
          difficulty: "beginner",
          thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4628c975c?auto=format&fit=crop&q=80&w=800",
          description: "Discover the power of diffusion models and transformer basics."
        }
      ];

      for (const courseData of mockCourses) {
        const courseRef = doc(collection(db, "courses"));
        batch.set(courseRef, {
          ...courseData,
          instructorId: user.uid,
          instructorName: user.displayName || "Instructor",
          status: "Published",
          students: Math.floor(Math.random() * 1000),
          revenue: Math.floor(Math.random() * 50000),
          rating: 4.5 + Math.random() * 0.5,
          duration: "12 Hours",
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();
      toast.success("Marketplace seeded with dummy courses!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "courses");
    } finally {
      setIsCreating(false);
    }
  };

  const totalRevenue = courses.reduce((sum, c) => sum + (c.revenue || 0), 0);
  const totalStudents = courses.reduce((sum, c) => sum + (c.students || 0), 0);
  const avgRating = courses.length > 0 ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1) : "0.0";

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses, students, and revenue.</p>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="h-12 gap-2" onClick={handleSeedMarketplace} disabled={isCreating}>
            <Zap className="w-5 h-5 text-yellow-500" />
            Seed Marketplace
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 gap-2">
                <Plus className="w-5 h-5" />
                Create New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateCourse}>
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your new AI course.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Mastering Gemini API" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category" 
                      placeholder="e.g. LLMs, Generative AI" 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Course
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-500 mt-1">Real-time tracking</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {courses.length} courses</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Course Rating</CardTitle>
            <BarChart3 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{avgRating}</div>
            <p className="text-xs text-muted-foreground mt-1">Average quality score</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrollments</CardTitle>
            <BookOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">+{courses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active curricula</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 shadow-none">
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>A list of all courses you've created on SkillForge AI Academy.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-medium text-muted-foreground">You haven't created any courses yet.</h3>
              <p className="text-sm text-muted-foreground mt-1">Click the button above to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-bold">{course.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                        {course.status || "Published"}
                      </Badge>
                    </TableCell>
                    <TableCell>{(course.students || 0).toLocaleString()}</TableCell>
                    <TableCell>{course.rating || "5.0"}</TableCell>
                    <TableCell className="text-right font-mono font-bold">${(course.revenue || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSeedCourse(course.id)}
                        disabled={isSeeding === course.id}
                        className="h-8 gap-2"
                      >
                        {isSeeding === course.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        Seed Curriculum
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
