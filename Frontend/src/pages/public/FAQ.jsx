import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  CreditCard,
  Award,
  Sparkles,
  MessageSquare
} from "lucide-react";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "general", label: "General & Account" },
    { id: "courses", label: "Courses & Learning" },
    { id: "payments", label: "Payments & Stripe" },
    { id: "certificates", label: "Certificates" },
    { id: "instructor", label: "Teaching" }
  ];

  const faqs = [
    {
      category: "general",
      question: "What is Coursea and how does it work?",
      answer:
        "Coursea is an online learning platform offering world-class video courses created by certified instructors. Students can enroll in free or paid courses, watch on-demand lessons at their own pace, track their progress, leave reviews, and earn verifiable certificates."
    },
    {
      category: "general",
      question: "Do I need to pay a subscription fee?",
      answer:
        "No! Coursea operates on a transparent pay-per-course and free-course model. There are no recurring monthly subscription charges. Once you purchase or enroll in a course, you get lifetime access to all its content and future updates."
    },
    {
      category: "courses",
      question: "Can I preview lessons before buying a paid course?",
      answer:
        "Yes! Instructors provide free sample preview lessons on the Course Details page. You can watch the preview lessons in full HD before deciding to enroll."
    },
    {
      category: "courses",
      question: "What subjects are available on Coursea?",
      answer:
        "We offer comprehensive courses across Web & Software Engineering, Cloud & DevOps, Culinary & Gourmet Cooking, Baking & Pastry Arts, Automotive & Mechanics, Carpentry, Photography & Filmmaking, Fitness, and Business & UI/UX Design."
    },
    {
      category: "courses",
      question: "Is there a time limit to complete a course?",
      answer:
        "No, all course enrollments include lifetime access. You can learn anytime, anywhere on your smartphone, tablet, laptop, or desktop without deadlines."
    },
    {
      category: "payments",
      question: "How do payments work and is my card information safe?",
      answer:
        "All transactions are processed through Stripe with 256-bit bank-grade encryption. Coursea never stores or sees your raw credit card numbers. We support all major international cards (Visa, MasterCard, American Express) and regional currencies."
    },
    {
      category: "payments",
      question: "What happens if a transaction fails?",
      answer:
        "If a transaction is interrupted or fails, your card will not be debited. If an amount was reserved by your bank, Stripe automatically releases it within 24–48 hours. You can view your full transaction history anytime in your student Payment History dashboard."
    },
    {
      category: "certificates",
      question: "Do I receive a certificate upon finishing a course?",
      answer:
        "Yes! When your course progress bar reaches 100% after completing all video lessons, a Certificate of Completion is awarded, which you can download or link directly to your LinkedIn profile and resume."
    },
    {
      category: "instructor",
      question: "How can I become an instructor on Coursea?",
      answer:
        "Anyone with deep domain expertise can apply. Click 'Teach on Coursea' or register an account with the 'Instructor' role. You can upload video lessons, organize sections, set your own pricing, track student progress, and receive 85% payouts from every course sale directly via Stripe."
    },
    {
      category: "instructor",
      question: "What commission does Coursea charge instructors?",
      answer:
        "Coursea charges a low 15% platform commission to cover payment processing, high-speed video hosting, and global infrastructure. Instructors keep 85% of all gross sales."
    }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleAccordion = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center & FAQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Everything you need to know about learning, teaching, payments, and certificates on Coursea.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto pt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-7 pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions (e.g. payments, certificates, refund, cooking)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              No questions found matching your search. Have a specific inquiry?{" "}
              <Link to="/contact" className="text-blue-600 font-bold hover:underline">
                Contact our support team
              </Link>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = expandedIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base pr-4">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact CTA Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <MessageSquare className="w-10 h-10 mx-auto text-blue-200" />
          <h3 className="text-xl font-black">Still have questions?</h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-md mx-auto">
            Our student and instructor support team is available 24/7 to help resolve technical, payment, or enrollment questions.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 font-bold text-xs rounded-xl shadow-md hover:bg-blue-50 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
