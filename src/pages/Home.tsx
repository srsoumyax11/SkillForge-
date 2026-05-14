import { motion } from "motion/react";
import { ArrowRight, Bot, BookOpen, GraduationCap, Users, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container px-4 mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-primary/50 bg-primary/5 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-2 fill-primary text-primary" />
              The Future of Learning is AI
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
          >
            Master Artificial Intelligence <br />
            <span className="text-primary italic">With SkillForge Academy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed"
          >
            Join over 500,000+ learners worldwide and build the future with industry-leading 
            AI programs, certifications, and hands-on projects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="h-14 px-8 text-lg group" asChild>
              <Link to="/courses">
                Explore Programs
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg" asChild>
              <Link to="/register">Join for Free</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-border/50 pt-12 w-full max-w-4xl"
          >
            {[
              { label: "Active Learners", value: "500k+" },
              { label: "Expert Mentors", value: "200+" },
              { label: "AI Courses", value: "150+" },
              { label: "Job Placements", value: "85%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Features */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SkillForge?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our curriculum is designed by practitioners from top AI labs to ensure you learn the most relevant skills.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "AI-Powered Learning",
                desc: "Get personalized course recommendations and AI tutoring powered by Gemini 2.0."
              },
              {
                icon: BookOpen,
                title: "Industry Curriculum",
                desc: "Courses covering Generative AI, LLMs, Computer Vision, and Deep Learning."
              },
              {
                icon: GraduationCap,
                title: "Verified Credentials",
                desc: "Earn certificates recognized by top technology companies and AI startups."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-background border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
