import { useState, useEffect } from "react";
import { LayoutDashboard, BookOpen, Trophy, Heart, Settings, Bell, Clock, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress as UIProgress } from "@/components/ui/progress";
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
  thumbnail: string;
}

export default function Dashboard() {
  const { user, profile } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "progress"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const coursesPromises = snapshot.docs.map(async (progressDoc) => {
        const data = progressDoc.data();
        const courseDoc = await getDoc(doc(db, "courses", data.courseId));
        
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          // Calculate progress percentage based on completed lessons (placeholder logic)
          const completedCount = (data.completedLessons || []).length;
          const totalLessons = 10; // Placeholder
          const progressPercent = Math.min(Math.round((completedCount / totalLessons) * 100), 100);

          return {
            id: courseDoc.id,
            title: courseData.title,
            progress: progressPercent,
            lastAccessed: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "Just now",
            thumbnail: courseData.thumbnail || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400"
          };
        }
        return null;
      });

      const resolvedCourses = (await Promise.all(coursesPromises)).filter(c => c !== null) as EnrolledCourse[];
      setEnrolledCourses(resolvedCourses);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "progress");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden pt-16">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-background hidden md:flex flex-col">
        <div className="p-6 flex flex-col items-center">
          <Avatar className="h-20 w-20 border-4 border-muted mb-4 shadow-sm">
            <AvatarImage src={user?.photoURL || ""} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-bold">{user?.displayName || "SkillForge Learner"}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{profile?.role || "Student"}</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start h-11 gap-3">
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start h-11 gap-3">
            <BookOpen className="w-4 h-4" />
            My Courses
          </Button>
          <Button variant="ghost" className="w-full justify-start h-11 gap-3">
            <Trophy className="w-4 h-4" />
            Certificates
          </Button>
          <Button variant="ghost" className="w-full justify-start h-11 gap-3">
            <Heart className="w-4 h-4" />
            Wishlist
          </Button>
          <div className="pt-4 mt-4 border-t border-border">
            <Button variant="ghost" className="w-full justify-start h-11 gap-3">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container p-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.displayName?.split(' ')[0] || "Learner"}!</h1>
              <p className="text-muted-foreground">
                {enrolledCourses.length > 0 
                  ? `You have ${enrolledCourses.length} courses in progress.` 
                  : "Ready to start your AI journey?"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <Button>New Resource Available</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="border-none shadow-sm bg-primary text-primary-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Courses In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{enrolledCourses.length} Active</div>
                <p className="text-xs opacity-70 mt-1 mt-2">Next session: Today, 6:00 PM</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-slate-900 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Certificates Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0 Total</div>
                <p className="text-xs opacity-70 mt-1 mt-2">Keep going to earn your first!</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1 Day</div>
                <p className="text-xs text-muted-foreground mt-1 mt-2">Start your streak today!</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-xl border border-dashed border-border/60">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold mb-2">No courses enrolled</h3>
              <p className="text-muted-foreground mb-6">Explore our catalog and start learning today.</p>
              <Button asChild>
                <a href="/courses">Browse Courses</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden border-border/40 group hover:border-primary/20 transition-colors">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <UIProgress value={course.progress} className="h-1.5" />
                        <span className="text-xs font-medium text-muted-foreground">{course.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
                          <Clock className="w-3 h-3" />
                          {course.lastAccessed}
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs">Resume</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Activity Feed (Placeholder) */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-border/40 shadow-none">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {enrolledCourses.length > 0 ? (
                      enrolledCourses.slice(0, 3).map((course, i) => (
                        <div key={i} className="flex gap-4 pb-6 border-b border-border last:border-0 last:pb-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">Resumed "{course.title}"</div>
                            <p className="text-xs text-muted-foreground mt-1">Activity tracked • {course.lastAccessed}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-4">No recent activity to show.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border-border/40 shadow-none bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">AI Mentor Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground italic">
                      "I noticed you're exploring the platform. Based on your profile, I recommend checking out our 'Intro to Generative AI' course to kickstart your journey."
                    </p>
                    <Button variant="outline" className="w-full text-xs h-8">Ask Mentor Anything</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
