import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  FileText, 
  MessageSquare, 
  Menu,
  CheckCircle,
  Clock,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import AILab from "@/components/AILab";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "quiz";
  content: string;
  duration: string;
  order: number;
  moduleId: string;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [courseTitle, setCourseTitle] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progressId, setProgressId] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourseTitle(response.data.title);
        
        // Mock modules and lessons for now
        const mockLessons: Lesson[] = [
          { id: "l1", title: "Introduction to AI", type: "video", content: "", duration: "10:00", order: 1, moduleId: "m1" },
          { id: "l2", title: "Neural Networks Overview", type: "video", content: "", duration: "15:00", order: 2, moduleId: "m1" }
        ];
        const mockModules: Module[] = [
          { id: "m1", title: "Foundations", order: 1, lessons: mockLessons }
        ];
        setModules(mockModules);
        setCurrentLesson(mockLessons[0]);
      } catch (error) {
        console.error("Failed to fetch lesson data", error);
        navigate(`/course/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const checkEnrollment = async () => {
      try {
        const response = await api.get("/enrollments");
        const enrollment = response.data.find((e: any) => e.courseId === id);
        if (enrollment) {
          setProgressId(enrollment.id);
          // Progress data would come from the enrollment record in a real app
          setCompletedLessons([]); 
        } else {
          toast.error("You are not enrolled in this course");
          navigate(`/course/${id}`);
        }
      } catch (error) {
        console.error("Enrollment check failed", error);
      }
    };

    checkEnrollment();
  }, [id, user, navigate]);

  const toggleLessonComplete = async (lessonId: string) => {
    if (!progressId) return;

    const isCompleted = completedLessons.includes(lessonId);
    setCompletedLessons(prev => 
      isCompleted ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
    toast.success(isCompleted ? "Lesson marked as incomplete" : "Lesson completed!");
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground animate-pulse">Entering the AI classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden pt-16">
      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10">
              <Link to={`/course/${id}`}><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <h1 className="text-sm font-bold text-white truncate max-w-md">{courseTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 mr-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Progress</div>
              <Progress value={progressPercent} className="w-24 h-1.5 bg-white/10" />
              <span className="text-xs text-white font-mono">{progressPercent}%</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto p-4 md:p-8">
              <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl mb-8 relative group border border-white/5">
                {/* Embedded Video Placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black p-8 text-center">
                   <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary fill-primary" />
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-2 italic">{currentLesson.title}</h2>
                   <p className="text-slate-400 max-w-md mx-auto">This is where the lesson video would be played. Technical content for "{currentLesson.title}" is loading...</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <h2 className="text-3xl font-bold text-white leading-tight italic">{currentLesson.title}</h2>
                  <Button 
                    variant={completedLessons.includes(currentLesson.id) ? "outline" : "default"}
                    className={completedLessons.includes(currentLesson.id) ? "border-green-500/50 text-green-400" : ""}
                    onClick={() => toggleLessonComplete(currentLesson.id)}
                  >
                    {completedLessons.includes(currentLesson.id) ? (
                      <><CheckCircle2 className="mr-2 h-4 w-4" /> Completed</>
                    ) : "Mark as Completed"}
                  </Button>
                </div>

                <div className="prose prose-invert max-w-none text-slate-300">
                  <p className="text-lg leading-relaxed mb-6">
                    In this lesson, we explore the deep fundamentals of {currentLesson.title}. Understanding this concept is critical for mastering the next stages of AI development.
                  </p>
                  <p className="leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </div>

              {/* Navigation arrows for desktop */}
              <div className="flex justify-between mt-8 pb-12">
                <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button className="gap-2">
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Select a lesson to start learning
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className={`w-80 border-l border-border/40 bg-background flex flex-col transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full absolute right-0 h-full z-50 md:hidden"}`}>
        <div className="p-6 border-b">
          <h3 className="font-bold flex items-center gap-2">
            <Menu className="w-4 h-4 text-primary" />
            Course Content
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3">
            {modules.map((module) => (
              <div key={module.id} className="mb-6 last:mb-0">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                  Module {module.order}: {module.title}
                </h4>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                        currentLesson?.id === lesson.id 
                          ? "bg-primary/10 border border-primary/20 text-primary font-medium" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="mt-0.5" onClick={(e) => { e.stopPropagation(); toggleLessonComplete(lesson.id); }}>
                        {completedLessons.includes(lesson.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-current opacity-40" />
                        )}
                      </div>
                      <div className="flex-1 text-left text-xs">
                        <div className="line-clamp-2">{lesson.title}</div>
                        <div className="flex items-center gap-2 mt-1 opacity-60 text-[10px]">
                          <Clock className="w-3 h-3" />
                          {lesson.duration || "5:00"}
                        </div>
                      </div>
                      <Play className={`w-3 h-3 mt-1 ${currentLesson?.id === lesson.id ? "opacity-100" : "opacity-0"}`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Floating AI Lab for this course */}
        <div className="p-4 border-t bg-muted/20">
          <AILab 
            courseContext={`The student is currently watching the lesson "${currentLesson?.title}" in the course "${courseTitle}". 
            Current module is part of the overall curriculum which includes: ${modules.map(m => m.title).join(", ")}.`}
            className="w-full !h-[400px]"
          />
        </div>
      </div>
    </div>
  );
}
