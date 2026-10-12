import { BookOpen, Users, Cpu, Trophy, Briefcase, HeartHandshake } from "lucide-react";

export const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/programs", label: "Our Programs" },
  { to: "/projects", label: "Projects" },
  { to: "/get-involved", label: "Get Involved" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/news", label: "News & Impact" },
  { to: "/contact", label: "Contact" },
] as const;

export const programs = [
  { slug: "education", icon: BookOpen, title: "Education & Digital Learning", short: "Learning resources and access to opportunities.", body: "Reading materials, digital lessons, scholarship information and educational activities for learners and schools." },
  { slug: "mentorship", icon: Users, title: "Mentorship & Personal Development", short: "Connecting young people with positive guidance.", body: "Students choose interests like engineering or entrepreneurship and join approved mentoring sessions led by vetted mentors." },
  { slug: "stem", icon: Cpu, title: "STEM & Technology", short: "STEM, creativity and practical problem-solving.", body: "Robotics, coding, electronics, renewable energy, innovation challenges and hands-on engineering workshops." },
  { slug: "talent", icon: Trophy, title: "Sports, Arts & Talent", short: "Sports, arts and opportunities to grow.", body: "Sports, music, art and drama — with events, showcases and recognition of achievements." },
  { slug: "skills", icon: Briefcase, title: "Youth Skills & Employability", short: "Practical skills for work and enterprise.", body: "Skills training, CV support, entrepreneurship programs, internships and links to verified opportunities." },
  { slug: "welfare", icon: HeartHandshake, title: "Child Welfare & Community Support", short: "Safeguarded support for families.", body: "Coordinating eligible support, referrals and partnerships with qualified organisations under strict safeguarding." },
];

export const projects = [
  { title: "Solar Robotics Club", program: "STEM & Technology", progress: 60, text: "Students build solar-powered robots and compete in county challenges." },
  { title: "Community Reading Corner", program: "Education", progress: 85, text: "A shared library space with books and tablets for primary learners." },
  { title: "Mentor Circles 2026", program: "Mentorship", progress: 35, text: "Monthly small-group sessions pairing students with young professionals." },
  { title: "Youth Football League", program: "Sports & Talent", progress: 50, text: "A weekend league promoting teamwork, fitness and discipline." },
];

export const opportunities = [
  { type: "Scholarship", title: "Secondary School Bursary Support", deadline: "30 Nov 2026" },
  { type: "Training", title: "Intro to Coding Bootcamp (Ages 14–18)", deadline: "15 Nov 2026" },
  { type: "Internship", title: "Community Projects Assistant", deadline: "5 Dec 2026" },
  { type: "Event", title: "Innovation Challenge Showcase Day", deadline: "12 Dec 2026" },
];

export const news = [
  { date: "Oct 2026", title: "Robotics club reaches county finals", text: "Our STEM learners presented a solar irrigation prototype to judges." },
  { date: "Sep 2026", title: "300 books donated to reading corner", text: "Thanks to partners, the community library doubled its collection." },
  { date: "Aug 2026", title: "First mentor circle completed", text: "24 students finished an eight-week personal development journey." },
];
