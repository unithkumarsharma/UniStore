import React, { useState } from 'react';

const FAQS = [
  {
    q: 'How fast is express shipping and how can I track it?',
    a: 'We dispatch all confirmed orders within 24 hours. For major metros (Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Pune, Chennai), delivery takes 24 to 48 hours. Orders placed before 2:00 PM are eligible for same-day dispatch. You will receive real-time SMS and WhatsApp notifications with live GPS tracking.',
  },
  {
    q: 'What is the UniStore 1-Year Official Shield Warranty?',
    a: 'Every electronic device, audio unit, and ergonomic furniture piece purchased on UniStore comes with our complimentary 1-Year Shield Warranty. If a manufacturing defect arises, our concierge team arranges free doorstep pickup and delivers an inspected brand replacement with zero deductible fees.',
  },
  {
    q: 'How does your 7-Day Hassle-Free Return policy work?',
    a: 'If you are not 100% delighted with your purchase, you can initiate a return or exchange within 7 days directly from your Account or Order Tracking page. We arrange reverse pickup right from your doorstep and initiate an immediate refund back to your original payment method once inspected.',
  },
  {
    q: 'Are all products 100% genuine and authentic?',
    a: 'Yes. UniStore partners directly with authorized global and local design ateliers, holding official brand distribution rights. Every item comes with original manufacturer warranty cards, holographic seals, and a unique verifiable serial number.',
  },
  {
    q: 'What payment methods do you support? Is checkout secure?',
    a: 'We support all major payment modes including UPI (Google Pay, PhonePe, Paytm, CRED), Credit/Debit cards (Visa, MasterCard, Amex), Net Banking, and Cash on Delivery (COD) for eligible pin codes. All transactions are protected by end-to-end 256-bit bank-grade encryption.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[15px] text-amber-500">help</span>
            <span>Clarity & Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1.5">
            Everything you need to know about ordering, warranties, dispatch, and returns.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:border-zinc-300"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-zinc-900 focus:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <span
                    className={`material-symbols-outlined text-zinc-400 text-[20px] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-zinc-900' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 bg-zinc-50/40">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions? Concierge Card */}
        <div className="mt-8 p-5 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-amber-400 flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Have a specific question about an item?</h4>
              <p className="text-xs text-zinc-400">Our concierge specialists are online now to assist you.</p>
            </div>
          </div>
          <a
            href="https://wa.me/919999999999?text=Hi%20UniStore%2C%20I%20have%20a%20question%20about%20a%20product"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
