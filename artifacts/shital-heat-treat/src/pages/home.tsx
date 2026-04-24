import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { Flame, Shield, Gauge, Target, Factory, ArrowRight, Phone, Mail, MapPin, CheckCircle2, ChevronRight, Zap } from "lucide-react";

// @ts-ignore
import heroFurnaceUrl from "@/assets/hero-furnace.png";
// @ts-ignore
import gearHeatUrl from "@/assets/gear-heat.png";
// @ts-ignore
import moldDieUrl from "@/assets/mold-die.png";
// @ts-ignore
import shtLogoUrl from "@/assets/sht-logo.png";

const Logo = () => (
  <div className="flex items-center gap-3">
    <img
      src={shtLogoUrl}
      alt="Shital Heat Treat Pvt. Ltd."
      className="h-12 w-12 md:h-14 md:w-14 object-contain shrink-0"
    />
    <div className="flex flex-col">
      <span className="text-white font-bold text-base md:text-lg leading-none tracking-wide font-sans">SHITAL</span>
      <span className="text-[#F39200] font-semibold text-[10px] md:text-xs leading-none tracking-[0.2em] mt-1.5">HEAT TREAT PVT. LTD.</span>
    </div>
  </div>
);

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="mb-12 md:mb-16">
    <div className="flex items-center gap-4 mb-4">
      <div className="h-px w-12 bg-[#F39200]"></div>
      <span className="text-[#F39200] font-mono text-sm tracking-widest uppercase">{subtitle}</span>
    </div>
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight uppercase">
      {children}
    </h2>
  </div>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const navLinks = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Services", id: "services" },
    { name: "Capabilities", id: "capabilities" },
    { name: "Why Us", id: "why-us" },
    { name: "Contact", id: "contact" }
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-200 selection:bg-[#F39200] selection:text-black font-sans overflow-hidden">
      
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#0A0D14]/95 backdrop-blur-md border-[#1A202C] py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <button onClick={() => scrollTo('home')} className="hover:opacity-80 transition-opacity">
            <Logo />
          </button>
          
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => scrollTo(link.id)}
                className="text-sm font-medium text-gray-300 hover:text-[#F39200] transition-colors uppercase tracking-wider"
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold border border-[#1A202C] text-gray-300 hover:text-white hover:border-[#F39200] hover:bg-[#F39200]/10 transition-all uppercase tracking-wider">
              Client Login
            </Link>
            <button className="lg:hidden text-white p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative min-h-[100dvh] flex items-center pt-20">
          <div className="absolute inset-0 z-0">
            <motion.div style={{ y }} className="w-full h-full">
              <img 
                src={heroFurnaceUrl} 
                alt="Vacuum Furnace Interior" 
                className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-[#0A0D14]/50 to-transparent"></div>
            {/* Heat shimmer effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(243,146,0,0.15)_0%,transparent_50%)] animate-pulse mix-blend-screen" style={{ animationDuration: '4s' }}></div>
          </div>

          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#F39200]/30 bg-[#F39200]/10 backdrop-blur-sm mb-8">
                  <Flame className="w-4 h-4 text-[#F39200]" />
                  <span className="text-[#F39200] text-xs font-mono tracking-widest uppercase">Advanced Vacuum Heat Treatment</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight uppercase mb-6">
                  Precision <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F39200] to-[#FFB040]">Through Heat.</span><br />
                  Strength <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">Through Science.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-12 font-light">
                  A 13-year trusted partner providing vacuum heat treatment, plasma ion nitriding, sub zero and cryogenic treatments for critical precision components.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <button onClick={() => scrollTo('contact')} className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F39200] text-black font-bold text-sm tracking-wider uppercase hover:bg-[#FFB040] transition-colors">
                    Partner With Us
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => scrollTo('services')} className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-gray-700 text-white font-bold text-sm tracking-wider uppercase hover:border-gray-500 transition-colors">
                    Explore Capabilities
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-[#F39200] to-transparent"></div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 md:py-32 relative bg-[#0D111A]">
          {/* Geometric panel lines */}
          <div className="absolute top-0 left-12 w-px h-full bg-[#1A202C]"></div>
          <div className="absolute top-0 right-12 w-px h-full bg-[#1A202C]"></div>
          
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <SectionHeading subtitle="Who We Are">Industrial Expertise</SectionHeading>
                <div className="prose prose-invert prose-lg">
                  <p className="text-gray-300 font-light leading-relaxed">
                    <strong className="text-white font-semibold">Shital Heat Treat Pvt. Ltd.</strong> is a specialized provider of advanced heat treatment solutions, with core expertise in vacuum heat treatment technology. We are in partnership with Shital Vacuum Treat Pvt. Ltd. located in Bhosari.
                  </p>
                  <p className="text-gray-400 font-light leading-relaxed mt-6">
                    For 13 years, we have been a trusted company providing vacuum heat treatment, plasma ion nitriding, sub zero and cryogenic treatments for the most demanding engineering applications.
                  </p>
                </div>
                
                <div className="mt-12 p-8 border border-[#1A202C] bg-[#0A0D14] relative group hover:border-[#F39200]/50 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#F39200]"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#F39200]"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#F39200]"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#F39200]"></div>
                  
                  <h3 className="text-[#F39200] font-mono text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Quality Philosophy
                  </h3>
                  <p className="text-xl md:text-2xl text-white font-medium italic leading-snug">
                    "At Shital Heat Treat Pvt. Ltd, quality is not inspected — it is engineered into every process."
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square lg:aspect-[4/5] bg-[#1A202C] p-4"
              >
                <div className="w-full h-full relative overflow-hidden border border-gray-800">
                  <img src={gearHeatUrl} alt="Precision gear heat treatment" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] to-transparent opacity-60"></div>
                </div>
                
                {/* Decorative tech elements */}
                <div className="absolute -left-6 top-1/4 w-12 h-px bg-[#F39200]"></div>
                <div className="absolute -bottom-6 right-1/4 w-px h-12 bg-[#F39200]"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 md:py-32 bg-[#0A0D14] border-y border-[#1A202C]">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <SectionHeading subtitle="Our Expertise">Process Solutions</SectionHeading>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vacuum Heat Treatment Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group relative border border-[#1A202C] bg-[#0D111A] p-10 hover:border-[#F39200]/50 transition-colors overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Flame className="w-32 h-32 text-[#F39200]" />
                </div>
                
                <h3 className="text-2xl font-bold text-white uppercase tracking-wide mb-6 relative z-10 flex items-center gap-4">
                  <span className="w-8 h-8 bg-[#F39200]/10 flex items-center justify-center border border-[#F39200]/30">
                    <Flame className="w-4 h-4 text-[#F39200]" />
                  </span>
                  Vacuum Heat Treatment
                </h3>
                
                <ul className="space-y-4 relative z-10">
                  {['Vacuum hardening', 'Vacuum tempering', 'Vacuum annealing'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-400">
                      <ChevronRight className="w-5 h-5 text-[#CC0066] shrink-0 mt-0.5" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Specialized Processes Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative border border-[#1A202C] bg-[#0D111A] p-10 hover:border-[#F39200]/50 transition-colors overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap className="w-32 h-32 text-[#F39200]" />
                </div>
                
                <h3 className="text-2xl font-bold text-white uppercase tracking-wide mb-6 relative z-10 flex items-center gap-4">
                  <span className="w-8 h-8 bg-[#F39200]/10 flex items-center justify-center border border-[#F39200]/30">
                    <Zap className="w-4 h-4 text-[#F39200]" />
                  </span>
                  Specialized Processes
                </h3>
                
                <ul className="space-y-4 relative z-10">
                  {['Solution Annealing & Aging', 'Stress relieving', 'Customized thermal cycles based on material composition', 'Plasma ion nitriding', 'Sub zero and cryogenic treatments'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-400">
                      <ChevronRight className="w-5 h-5 text-[#CC0066] shrink-0 mt-0.5" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section id="capabilities" className="py-24 md:py-32 relative bg-[#0D111A]">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
              <div className="lg:w-1/3">
                <SectionHeading subtitle="Furnace Spec">Size & Capacity</SectionHeading>
                <p className="text-gray-400 font-light leading-relaxed mb-8">
                  Our advanced Indiad Cofi (Italy) vacuum hardening furnace provides precise atmospheric control, ensuring consistent, repeatable, and oxidation-free results for the most critical metallurgical requirements.
                </p>
                <div className="aspect-[4/3] border border-[#1A202C] overflow-hidden">
                  <img src={moldDieUrl} alt="Mold die cavity" className="w-full h-full object-cover opacity-70 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
              
              <div className="lg:w-2/3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full content-start">
                  {[
                    { label: 'Technology', value: 'Indiad Cofi – Italy', icon: <Factory /> },
                    { label: 'Working Space (W×L×H)', value: '600 × 900 × 600 mm', icon: <Target /> },
                    { label: 'Maximum Load', value: '600 kg', icon: <Shield /> },
                    { label: 'Quenching Pressure', value: '10 bar, N₂ (Nitrogen)', icon: <Gauge /> }
                  ].map((spec, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="border border-[#1A202C] bg-[#0A0D14] p-8 hover:bg-[#111622] transition-colors"
                    >
                      <div className="text-[#F39200] mb-6 opacity-80">{spec.icon}</div>
                      <div className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">{spec.label}</div>
                      <div className="text-2xl text-white font-bold">{spec.value}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="why-us" className="py-24 md:py-32 bg-[#0A0D14] relative">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <SectionHeading subtitle="Why Us">The Vacuum Advantage</SectionHeading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
              {[
                { title: 'Oxidation-Free', desc: 'Pristine surface finishes without scaling or discoloration.' },
                { title: 'Minimal Distortion', desc: 'Controlled heating and cooling rates protect part geometry.' },
                { title: 'Superior Properties', desc: 'Enhanced metallurgical structure for maximum wear resistance.' },
                { title: 'Consistent Results', desc: 'Fully automated, repeatable recipes for batch-to-batch uniformity.' }
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 border-l border-[#F39200]"
                >
                  <h4 className="text-lg font-bold text-white uppercase tracking-wide mb-3">{benefit.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="border border-[#1A202C] bg-[#0D111A] p-8 md:p-12 lg:p-16">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-[#1A202C]"></div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-widest text-center px-4">Our Core Strengths</h3>
                <div className="h-px flex-1 bg-[#1A202C]"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                {[
                  'Advanced Furnace Technology',
                  'Strict Process Control & QA',
                  'Highly Experienced Workforce',
                  'Tight Process Control & Uniformity',
                  'Consistent Batch Quality',
                  'Reliable Turnaround Times'
                ].map((strength, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-[#F39200] shrink-0" />
                    <span className="text-gray-300 font-medium">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-24 bg-[#F39200] text-black">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-mono tracking-widest uppercase mb-4 opacity-80">Our Vision</h3>
                <p className="text-2xl md:text-3xl font-bold uppercase leading-snug tracking-tight">
                  "To be a trusted leader in precision heat treatment, known for reliability, innovation, and consistent quality."
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-mono tracking-widest uppercase mb-4 opacity-80">Our Mission</h3>
                <ul className="space-y-4">
                  {[
                    'Deliver precision-driven heat treatment services.',
                    'Continuously upgrade technology and processes.',
                    'Build long-term partnerships through reliability and trust.'
                  ].map((item, i) => (
                    <li key={i} className="text-lg md:text-xl font-medium flex items-start gap-4 border-b border-black/10 pb-4 last:border-0">
                      <span className="font-mono opacity-50 text-sm mt-1">0{i+1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section id="contact" className="py-32 relative bg-[#0A0D14] border-t border-[#1A202C]">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(204,0,102,0.3)_0%,transparent_70%)]"></div>
          </div>
          
          <div className="container mx-auto px-6 md:px-12 relative z-10 text-center max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-8">
              Let's Build Stronger Components Together.
            </h2>
            <p className="text-xl text-gray-400 mb-16">
              Partner with Shital Heat Treat Pvt. Ltd. for precision-driven, reliable heat treatment solutions.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <a href="tel:+917447870321" className="flex flex-col items-center justify-center p-8 border border-[#1A202C] bg-[#0D111A] hover:border-[#F39200] hover:bg-[#F39200]/5 transition-all group">
                <Phone className="w-8 h-8 text-[#F39200] mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-mono tracking-widest text-gray-500 uppercase mb-2">Call Us</span>
                <span className="text-lg text-white font-medium">+91 7447870321</span>
              </a>
              
              <a href="mailto:kishor.deshpande@shitalgroup.com" className="flex flex-col items-center justify-center p-8 border border-[#1A202C] bg-[#0D111A] hover:border-[#F39200] hover:bg-[#F39200]/5 transition-all group">
                <Mail className="w-8 h-8 text-[#F39200] mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-mono tracking-widest text-gray-500 uppercase mb-2">Email Us</span>
                <span className="text-base sm:text-lg text-white font-medium break-all text-center">kishor.deshpande<br/>@shitalgroup.com</span>
              </a>
              
              <div className="flex flex-col items-center justify-center p-8 border border-[#1A202C] bg-[#0D111A] hover:border-[#F39200] hover:bg-[#F39200]/5 transition-all group cursor-default">
                <MapPin className="w-8 h-8 text-[#F39200] mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-mono tracking-widest text-gray-500 uppercase mb-2">Location</span>
                <span className="text-lg text-white font-medium">Bhosari, Pune (India)</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#05060A] py-12 border-t border-[#1A202C]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Logo />
              <p className="mt-4 text-gray-500 text-sm max-w-sm text-center md:text-left">
                Precision Through Heat. Strength Through Science.
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-2">
                &copy; {new Date().getFullYear()} Shital Heat Treat Pvt. Ltd. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 italic">
                "Quality is not inspected — it is engineered into every process."
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}