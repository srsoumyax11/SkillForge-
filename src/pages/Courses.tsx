import { useState, useEffect } from "react";
import { Search, Filter, BookOpen, Clock, BarChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface Course {
  id: string;
  title: string;
  instructorName: string;
  price: number;
  category: string;
  difficulty: string;
  duration: string;
  rating: number;
  thumbnail: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 pt-24 text-center">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Explore All Courses</h1>
          <p className="text-muted-foreground">Find the perfect AI program to advance your career.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/60">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-border/40 hover:border-primary/20 transition-all hover:shadow-lg flex flex-col h-full">
              <Link to={`/course/${course.id}`} className="relative h-48 overflow-hidden block">
                <img 
                  src={course.thumbnail || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-md text-foreground border-none">
                  {course.category}
                </Badge>
                {course.price === 0 && (
                  <Badge className="absolute top-4 left-4 bg-green-500 text-white border-none">
                    Free
                  </Badge>
                )}
              </Link>
              
              <CardHeader className="p-5 pb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <BarChart className="w-3 h-3 text-primary" />
                  {course.difficulty}
                </div>
                <h3 className="text-lg font-bold line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground">{course.instructorName}</p>
              </CardHeader>

              <CardContent className="p-5 pt-0 flex-grow">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Modules
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-border/20 mt-auto bg-muted/20">
                <div className="text-xl font-bold">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </div>
                <Button size="sm" asChild>
                  <Link to={`/course/${course.id}`}>Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
