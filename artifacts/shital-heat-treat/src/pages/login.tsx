import React from "react";
import { Link } from "wouter";
// @ts-ignore
import shtLogoUrl from "@/assets/sht-logo.png";

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
          <img
            src={shtLogoUrl}
            alt="Shital Heat Treat Pvt. Ltd."
            className="h-20 w-20 object-contain"
          />
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