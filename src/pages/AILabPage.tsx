import { useState } from "react";
import AILab from "@/components/AILab";
import { Sparkles, Bot, Zap, Code, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AILabPage() {
  return (
    <div className="container mx-auto px-4 py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            SkillForge Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 italic tracking-tight">
            The AI <span className="text-primary">Research Lab</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your interactive environment for mastering AI concepts. Our mentor is powered by Gemini 1.5 Pro to help you with architecture, logic, and deep-learning mathematics.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <AILab className="w-full !h-[700px] shadow-2xl border-primary/10" />
          </div>

          {/* Quick Actions / Tips */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold italic mb-6">Expertise Areas</h3>
            <div className="grid gap-4">
              <Card className="bg-muted/30 border-border/40 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <Code className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Architecture Review</h4>
                      <p className="text-sm text-muted-foreground text-pretty">Ask for a review of your neural network layers or RAG pipeline architecture.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-border/40 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <Zap className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Model Optimization</h4>
                      <p className="text-sm text-muted-foreground text-pretty">Need help with LoRA parameters or quantization? Our mentor knows the math.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-border/40 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <Brain className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Concept Clarity</h4>
                      <p className="text-sm text-muted-foreground text-pretty">Clear up confusion about Attention heads, Backpropagation, or Latent Space.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 mt-12">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Bot className="w-5 h-5" />
                <span className="font-bold uppercase tracking-tighter">Pro Tip</span>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "You can paste code snippets directly into the chat. Try asking: 'Explain the mathematical intuition behind this softmax function and how it relates to probability distribution.'"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
