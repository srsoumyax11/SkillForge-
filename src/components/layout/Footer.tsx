import { Link } from "react-router-dom";
import { Rocket, Twitter, Github, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Rocket className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-black tracking-tight">
                SKILL<span className="text-primary italic">FORGE</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              SkillForge AI Academy is the leading platform for mastering artificial intelligence, machine learning, and data science.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-muted-foreground">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/courses" className="text-muted-foreground hover:text-primary transition-colors">Browse Courses</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">AI Learning Paths</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Open Source Projects</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Career Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-muted-foreground">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Our Mentors</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Affiliate Program</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-muted-foreground">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest AI news and course updates delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="email@example.com"
                className="bg-muted px-4 py-2 rounded-md text-sm flex-1 outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-bold">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/40 gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 SkillForge AI Academy. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs text-muted-foreground font-medium">
            <Link to="#" className="hover:text-primary">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary">Terms of Service</Link>
            <Link to="#" className="hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
