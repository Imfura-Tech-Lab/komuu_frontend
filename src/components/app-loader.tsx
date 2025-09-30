"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  ArrowRight,
  Users,
  BookOpen,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  CheckCircle,
  TrendingUp,
  Shield,
  Sparkles,
  Target,
  ChevronRight,
  Building2 as Building,
} from "lucide-react";

const HomeThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted)
    return (
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    );

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
        aria-label="Toggle theme"
      >
        <CurrentIcon size={20} className="text-gray-600 dark:text-gray-300" />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;
            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-[#00B5A5]/10 dark:bg-[#00D4C7]/10 text-[#00B5A5] dark:text-[#00D4C7] font-medium"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={18} />
                {themeOption.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const sections = [
      "hero",
      "about",
      "programs",
      "benefits",
      "membership",
      "testimonials",
      "contact",
    ];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0.1,
    };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    };
    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });
    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const NavLink = ({
    href,
    children,
    className = "",
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isActive = activeSection === href.replace("#", "");
    return (
      <button
        onClick={() => scrollToSection(href.replace("#", ""))}
        className={`relative transition-colors duration-200 ${
          isActive
            ? "text-[#00B5A5] dark:text-[#00D4C7] font-semibold"
            : "text-gray-600 dark:text-gray-300 hover:text-[#00B5A5] dark:hover:text-[#00D4C7]"
        } ${className}`}
      >
        {children}
        {isActive && (
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5]" />
        )}
      </button>
    );
  };

  const stats = [
    { number: "2,500+", label: "Active Members", icon: Users },
    { number: "75+", label: "Partner Institutions", icon: Building },
    { number: "35", label: "African Countries", icon: Globe },
    { number: "250+", label: "Research Projects", icon: BookOpen },
  ];

  const features = [
    {
      icon: Users,
      title: "Global Network",
      description:
        "Join a thriving community of forensic professionals across Africa, fostering collaboration and knowledge exchange.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BookOpen,
      title: "Expert Resources",
      description:
        "Access comprehensive libraries, research databases, and cutting-edge training materials curated by industry leaders.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Award,
      title: "Accredited Certification",
      description:
        "Earn internationally recognized certifications that validate your expertise and accelerate career advancement.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Globe,
      title: "International Collaboration",
      description:
        "Participate in cross-border research initiatives and contribute to advancing forensic science globally.",
      color: "from-green-500 to-green-600",
    },
  ];

  const membershipTiers = [
    {
      name: "Student Member",
      price: "$10",
      period: "per year",
      description: "Perfect for students pursuing forensic science education",
      features: [
        "Access to educational resources",
        "Student networking events",
        "Mentorship program",
        "Career guidance workshops",
        "Discounted conference rates",
      ],
      highlighted: false,
    },
    {
      name: "Full Member",
      price: "$50",
      period: "per year",
      description: "For qualified forensic professionals",
      features: [
        "All Student Member benefits",
        "Full voting rights",
        "Exclusive research publications",
        "Priority conference registration",
        "Professional certification programs",
        "Access to expert directory",
      ],
      highlighted: true,
    },
    {
      name: "Associate Member",
      price: "$30",
      period: "per year",
      description: "For forensic-related professionals",
      features: [
        "Access to AFSA resources",
        "Professional networking",
        "Discounted events",
        "Industry publications",
        "Development workshops",
      ],
      highlighted: false,
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Career Advancement",
      description:
        "Gain credentials and connections that accelerate your professional growth in forensic sciences.",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description:
        "Maintain the highest standards through continuous professional development and peer review.",
    },
    {
      icon: Target,
      title: "Specialized Training",
      description:
        "Access targeted workshops and courses in emerging forensic technologies and methodologies.",
    },
    {
      icon: Sparkles,
      title: "Innovation Hub",
      description:
        "Stay at the forefront of forensic science with access to latest research and technological advances.",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Amara Okafor",
      role: "Forensic Pathologist, Nigeria",
      content:
        "AFSA membership transformed my career. The networking opportunities and professional development programs are exceptional.",
    },
    {
      name: "Prof. Kwame Mensah",
      role: "Director, Ghana Forensic Science Laboratory",
      content:
        "The collaborative research initiatives and knowledge sharing within AFSA have significantly enhanced our laboratory capabilities.",
    },
    {
      name: "Sarah Ndlovu",
      role: "Forensic Science Student, South Africa",
      content:
        "As a student member, the mentorship program and educational resources have been invaluable to my academic journey.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => scrollToSection("hero")}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1
                  className={`text-xl font-bold transition-colors ${
                    isScrolled ? "text-gray-900 dark:text-white" : "text-white"
                  }`}
                >
                  AFSA
                </h1>
                <p
                  className={`text-xs transition-colors ${
                    isScrolled
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-white/80"
                  }`}
                >
                  African Forensic Sciences Academy
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <NavLink href="#about">About</NavLink>
              <NavLink href="#programs">Programs</NavLink>
              <NavLink href="#benefits">Benefits</NavLink>
              <NavLink href="#membership">Membership</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <HomeThemeToggle />
              <button
                onClick={() => router.push("/login")}
                className={`transition-colors font-medium ${
                  isScrolled
                    ? "text-gray-600 dark:text-gray-300 hover:text-[#00B5A5] dark:hover:text-[#00D4C7]"
                    : "text-white hover:text-white/80"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white px-6 py-2.5 rounded-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold"
              >
                Join Now
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <HomeThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 transition-colors ${
                  isScrolled ? "text-gray-600 dark:text-gray-300" : "text-white"
                }`}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 bg-white dark:bg-gray-900">
              <nav className="flex flex-col space-y-4">
                <NavLink href="#about" className="block py-2">
                  About
                </NavLink>
                <NavLink href="#programs" className="block py-2">
                  Programs
                </NavLink>
                <NavLink href="#benefits" className="block py-2">
                  Benefits
                </NavLink>
                <NavLink href="#membership" className="block py-2">
                  Membership
                </NavLink>
                <NavLink href="#contact" className="block py-2">
                  Contact
                </NavLink>
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => router.push("/login")}
                    className="text-left text-gray-600 dark:text-gray-300 hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors font-medium py-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all duration-200 text-left font-semibold"
                  >
                    Join Now
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <section
        id="hero"
        className="relative bg-gradient-to-br from-[#00B5A5] via-[#00A095] to-[#008A7C] dark:from-[#00D4C7] dark:via-[#00C4B7] dark:to-[#00B5A5] text-white pt-32 pb-24 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-6">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                Advancing Forensic Science Across Africa
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              African Forensic
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                Sciences Academy
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/95 max-w-3xl mx-auto leading-relaxed">
              Empowering forensic professionals through world-class education,
              cutting-edge research, and collaborative innovation across the
              continent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push("/register")}
                className="bg-white text-[#00B5A5] px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center group min-w-[200px]"
              >
                Become a Member
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#00B5A5] transition-all duration-300 hover:scale-105 min-w-[200px]"
              >
                Explore More
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight size={32} className="text-white/60 rotate-90" />
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-[#00B5A5] dark:text-[#00D4C7] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-semibold">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#00B5A5] dark:text-[#00D4C7] font-semibold text-sm uppercase tracking-wide">
              Who We Are
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
              About AFSA
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              The African Forensic Sciences Academy stands as the continent's
              premier institution, dedicated to elevating forensic science
              capabilities through comprehensive education, groundbreaking
              research, and continuous professional development.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To advance forensic science excellence across Africa by
                fostering a collaborative community of practitioners,
                researchers, and educators committed to the highest standards of
                scientific integrity and innovation.
              </p>
              <div className="space-y-4">
                {[
                  "Promote evidence-based practices in forensic investigations",
                  "Bridge the gap between research and practical application",
                  "Build capacity across African forensic institutions",
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <CheckCircle
                      size={24}
                      className="text-[#00B5A5] dark:text-[#00D4C7] flex-shrink-0 mt-1"
                    />
                    <p className="text-gray-700 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] rounded-2xl flex items-center justify-center shadow-2xl">
                <Globe size={120} className="text-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#00B5A5] dark:text-[#00D4C7] font-semibold text-sm uppercase tracking-wide">
              What We Offer
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
              Our Programs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive initiatives designed to support forensic
              professionals at every stage of their career journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#00B5A5] dark:text-[#00D4C7] font-semibold text-sm uppercase tracking-wide">
              Member Advantages
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
              Why Join AFSA
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience transformative benefits that propel your forensic
              science career forward.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00B5A5]/10 to-[#008A7C]/10 dark:from-[#00D4C7]/10 dark:to-[#00B5A5]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      size={28}
                      className="text-[#00B5A5] dark:text-[#00D4C7]"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="membership" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#00B5A5] dark:text-[#00D4C7] font-semibold text-sm uppercase tracking-wide">
              Choose Your Path
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
              Membership Options
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Select the membership tier that aligns with your professional
              goals and career stage.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {membershipTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-gradient-to-br from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white shadow-2xl scale-105 border-4 border-[#00B5A5]/30 dark:border-[#00D4C7]/30"
                    : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-[#00B5A5] dark:hover:border-[#00D4C7] hover:shadow-xl"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-[#00B5A5] px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      tier.highlighted
                        ? "text-white"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${
                      tier.highlighted
                        ? "text-white/90"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {tier.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span
                      className={`text-5xl font-bold ${
                        tier.highlighted
                          ? "text-white"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {tier.price}
                    </span>
                    <span
                      className={`ml-2 ${
                        tier.highlighted
                          ? "text-white/80"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {tier.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle
                        size={20}
                        className={`flex-shrink-0 mt-0.5 ${
                          tier.highlighted
                            ? "text-white"
                            : "text-[#00B5A5] dark:text-[#00D4C7]"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          tier.highlighted
                            ? "text-white/95"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push("/register")}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                    tier.highlighted
                      ? "bg-white text-[#00B5A5] hover:bg-gray-50"
                      : "bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white hover:shadow-lg"
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#00B5A5] dark:text-[#00D4C7] font-semibold text-sm uppercase tracking-wide">
              Success Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
              What Our Members Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Hear from professionals who have transformed their careers through
              AFSA membership.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Advance Your Career?
          </h2>
          <p className="text-xl mb-10 text-white/95 max-w-2xl mx-auto leading-relaxed">
            Join thousands of forensic professionals across Africa who are
            shaping the future of forensic science. Start your journey with AFSA
            today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/register")}
              className="bg-white text-[#00B5A5] px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center group"
            >
              Start Your Application
              <ArrowRight
                className="ml-2 group-hover:translate-x-1 transition-transform"
                size={20}
              />
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#00B5A5] transition-all duration-300 hover:scale-105"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <footer
        id="contact"
        className="bg-gray-900 dark:bg-gray-950 text-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">AFSA</h3>
                  <p className="text-sm text-gray-400">
                    African Forensic Sciences Academy
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Empowering forensic professionals through world-class education,
                cutting-edge research, and collaborative innovation across the
                African continent.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Linkedin, Instagram, Youtube].map(
                  (Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#00B5A5] transition-colors duration-200"
                    >
                      <Icon size={20} />
                    </a>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { label: "About Us", action: () => scrollToSection("about") },
                  {
                    label: "Programs",
                    action: () => scrollToSection("programs"),
                  },
                  {
                    label: "Membership",
                    action: () => scrollToSection("membership"),
                  },
                  {
                    label: "Member Login",
                    action: () => router.push("/login"),
                  },
                ].map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={link.action}
                      className="text-gray-400 hover:text-[#00B5A5] transition-colors duration-200 flex items-center group"
                    >
                      <ChevronRight
                        size={16}
                        className="mr-1 group-hover:translate-x-1 transition-transform"
                      />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Get in Touch</h4>
              <div className="space-y-4">
                <a
                  href="mailto:info@afsa.africa"
                  className="flex items-center space-x-3 text-gray-400 hover:text-[#00B5A5] transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-[#00B5A5] transition-colors">
                    <Mail size={18} />
                  </div>
                  <span className="text-sm">info@afsa.africa</span>
                </a>
                <a
                  href="tel:+27111234567"
                  className="flex items-center space-x-3 text-gray-400 hover:text-[#00B5A5] transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-[#00B5A5] transition-colors">
                    <Phone size={18} />
                  </div>
                  <span className="text-sm">+27 11 123 4567</span>
                </a>
                <div className="flex items-start space-x-3 text-gray-400 group">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin size={18} />
                  </div>
                  <span className="text-sm">
                    123 Science Avenue
                    <br />
                    Johannesburg, 2000
                    <br />
                    South Africa
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2024 African Forensic Sciences Academy. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-[#00B5A5] transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-[#00B5A5] transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-[#00B5A5] transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
