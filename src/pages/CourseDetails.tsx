import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, Globe, Shield, Play, Loader2, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  instructorName: string;
  instructorId: string;
  price: number;
  category: string;
  difficulty: string;
  duration: string;
  rating: number;
  thumbnail: string;
  skills?: string[];
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: string;
  order: number;
}

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"not-enrolled" | "enrolled" | "checking">("checking");

  useEffect(() => {
    if (!id) return;

    const fetchCourseData = async () => {
      try {
        const courseDoc = await getDoc(doc(db, "courses", id));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
          
          // Fetch modules (subcollection)
          const modulesSnapshot = await getDocs(query(collection(db, "courses", id, "modules"), orderBy("order", "asc")));
          const modulesData = await Promise.all(modulesSnapshot.docs.map(async (modDoc) => {
            const lessonsSnapshot = await getDocs(query(collection(db, "courses", id, "modules", modDoc.id, "lessons"), orderBy("order", "asc")));
            return {
              id: modDoc.id,
              ...modDoc.data(),
              lessons: lessonsSnapshot.docs.map(lDoc => ({ id: lDoc.id, ...lDoc.data() }))
            } as Module;
          }));
          setModules(modulesData);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `courses/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (!user || !id) {
      setEnrollmentStatus("not-enrolled");
      return;
    }

    const q = query(
      collection(db, "progress"),
      where("userId", "==", user.uid),
      where("courseId", "==", id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEnrollmentStatus(snapshot.empty ? "not-enrolled" : "enrolled");
    });

    return () => unsubscribe();
  }, [user, id]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll in courses");
      navigate("/login");
      return;
    }

    if (!id || !course) return;

    setIsEnrolling(true);
    try {
      await addDoc(collection(db, "progress"), {
        userId: user.uid,
        courseId: id,
        completedLessons: [],
        lastAccessedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      toast.success("Enrolled successfully! Redirecting to classroom...");
      navigate(`/course/${id}/learn`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "progress");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Button asChild>
          <Link to="/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Header */}
      <section className="bg-slate-950 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
                <span>/</span>
                <span className="text-white">{course.category}</span>
              </nav>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 italic leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 max-w-xl">
                {course.description || "Master the latest in AI and LLM technology with this comprehensive program."}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{course.rating || "5.0"}</span>
                  <span className="text-slate-400">({(course.price * 12 + 45).toLocaleString()} ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  <span>{course.duration} of content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>English (Captions Available)</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/20 text-primary uppercase">
                    {course.instructorName?.[0] || "I"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{course.instructorName}</div>
                  <div className="text-sm text-slate-400">Certified Instructor</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="overflow-hidden border-slate-800 bg-slate-900 text-white shadow-2xl lg:sticky lg:top-32">
                <div className="relative aspect-video">
                  <img 
                    src={course.thumbnail || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"} 
                    alt={course.title} 
                    className="w-full h-full object-cover opacity-80" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="icon" variant="ghost" className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20">
                      <Play className="w-8 h-8 fill-white text-white" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold">{course.price === 0 ? "Free" : `$${course.price}`}</div>
                    {course.price > 0 && <Badge variant="outline" className="text-primary border-primary">50% OFF</Badge>}
                  </div>
                  
                  <div className="space-y-4">
                    {enrollmentStatus === "enrolled" ? (
                      <Button asChild className="w-full h-12 text-lg font-bold" size="lg">
                        <Link to={`/course/${id}/learn`}>Continue Learning</Link>
                      </Button>
                    ) : (
                      <Button 
                        className="w-full h-12 text-lg font-bold" 
                        size="lg" 
                        onClick={handleEnroll}
                        disabled={isEnrolling || enrollmentStatus === "checking"}
                      >
                        {isEnrolling ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enroll Now"}
                      </Button>
                    )}
                    <Button variant="outline" className="w-full h-12 border-slate-700 bg-transparent hover:bg-slate-800" size="lg">
                      Free Preview
                    </Button>
                  </div>
                  
                  <div className="mt-8 space-y-4 text-sm text-slate-400">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>30-Day Money-Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Full Lifetime Access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-primary italic">What you'll learn</h2>
                <div className="grid md:grid-cols-2 gap-4 border border-border p-8 rounded-xl bg-muted/20">
                  {(course.skills || ["Transformer Architecture", "PyTorch", "Hugging Face", "Model Evaluation"]).map((skill, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-primary italic">Course Content</h2>
                {modules.length === 0 ? (
                  <div className="text-center py-10 bg-muted/10 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">Curriculum details coming soon...</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {modules.map((module, i) => (
                      <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4 overflow-hidden bg-muted/10">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-bold">{module.title}</span>
                            <span className="text-sm text-muted-foreground font-normal">{module.lessons.length} lessons</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-3">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between py-2 border-t border-border/50 text-sm">
                              <div className="flex items-center gap-3">
                                <Play className="w-3 h-3 text-primary" />
                                {lesson.title}
                              </div>
                              <span className="text-muted-foreground">{lesson.duration || "05:00"}</span>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 text-primary italic">Description</h2>
                <div className="prose prose-slate max-w-none text-muted-foreground">
                  <p className="mb-4">{course.fullDescription || course.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
