"use client";

import { useState } from "react";
import {
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  CreditCardIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function PendingHelpClient() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How long does the application review process take?",
      answer:
        "The membership application review process typically takes 7-14 business days. This includes document verification, payment confirmation, and committee review. You will receive email notifications at each stage of the process.",
      category: "process",
    },
    {
      id: "2",
      question: "What documents are required for membership?",
      answer:
        "Required documents include: a valid government-issued ID, proof of professional qualifications (degree certificates, professional licenses), proof of current employment or affiliation in the forensic science field, and a passport-sized photograph.",
      category: "documents",
    },
    {
      id: "3",
      question: "How can I pay my membership fee?",
      answer:
        "Membership fees can be paid via mobile money (MTN, Airtel), bank transfer, or credit/debit card. Payment instructions are sent to your registered email address. You can also view payment options in your application status page.",
      category: "payment",
    },
    {
      id: "4",
      question: "Can I update my application after submission?",
      answer:
        "Minor updates to your application can be requested by contacting our support team. Major changes may require withdrawing and resubmitting your application. Please reach out to us as soon as possible if you need to make corrections.",
      category: "process",
    },
    {
      id: "5",
      question: "What happens after my application is approved?",
      answer:
        "Once approved, you will receive a welcome email with your membership certificate, access credentials for the full member portal, and information about member benefits. Your profile will be updated to full member status within 24 hours.",
      category: "process",
    },
    {
      id: "6",
      question: "What if my application is rejected?",
      answer:
        "If your application is rejected, you will receive an email explaining the reasons. Depending on the reason, you may be able to address the issues and reapply. Common reasons include incomplete documentation or unmet eligibility criteria.",
      category: "process",
    },
  ];

  const helpTopics = [
    {
      icon: DocumentTextIcon,
      title: "Application Questions",
      description: "Help with your membership application",
      color: "blue",
    },
    {
      icon: CreditCardIcon,
      title: "Payment Issues",
      description: "Assistance with payments and billing",
      color: "green",
    },
    {
      icon: ClockIcon,
      title: "Processing Time",
      description: "Questions about review timelines",
      color: "purple",
    },
    {
      icon: UserCircleIcon,
      title: "Account Access",
      description: "Help with login and access issues",
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    };
    return colors[color] || colors.blue;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Support request functionality coming soon!");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Help & Support
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Get assistance with your membership application
        </p>
      </div>

      {/* Help Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {helpTopics.map((topic) => (
          <div
            key={topic.title}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-[#00B5A5] dark:hover:border-[#00B5A5] transition-colors cursor-pointer"
          >
            <div className={`p-2 rounded-lg w-fit ${getColorClasses(topic.color)}`}>
              <topic.icon className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mt-3">
              {topic.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {topic.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <QuestionMarkCircleIcon className="h-6 w-6 text-[#00B5A5]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4">
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                  }
                  className="w-full flex items-start justify-between text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  {expandedFAQ === faq.id ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-[#00B5A5]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact Support
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <select
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                >
                  <option value="">Select a topic</option>
                  <option value="application">Application Question</option>
                  <option value="payment">Payment Issue</option>
                  <option value="documents">Document Upload</option>
                  <option value="timeline">Processing Timeline</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  placeholder="Describe your issue or question..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Other Ways to Reach Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">support@afsa.org</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white">+250 788 123 456</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Support Hours:</span> Monday - Friday, 8:00 AM - 5:00 PM (EAT)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
