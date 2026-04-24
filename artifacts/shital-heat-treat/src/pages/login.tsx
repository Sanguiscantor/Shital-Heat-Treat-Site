import React from "react";
import { Link } from "wouter";

export function Login() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(243,146,0,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>
      
      <div className="z-10 text-center max-w-md mx-auto px-6 py-12 bg-card/80 backdrop-blur border border-border">
        <div className="flex justify-center mb-8">
          {/* Logo SHT */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-accent rounded-b-[24px] rounded-t-sm flex items-center justify-center relative overflow-hidden shadow-lg shadow-accent/20">
              <span className="text-white font-bold text-xl tracking-tighter z-10">SHT</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full blur-[4px] opacity-80"></div>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4 font-sans tracking-tight">Client Portal</h1>
        <div className="h-px w-12 bg-primary mx-auto mb-6"></div>
        <p className="text-muted-foreground mb-8 text-sm">
          Coming Soon — our dedicated client portal is currently under construction. Please contact our team directly for status updates on your precision components.
        </p>
        
        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-border bg-background hover:bg-secondary text-sm font-medium transition-colors text-foreground">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default Login;