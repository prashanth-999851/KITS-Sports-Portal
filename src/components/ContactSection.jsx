import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck } from 'lucide-react';

export default function ContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 bg-slate-900/60 dark:bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            CONTACT <span className="gold-gradient-text">SPORTS DEPARTMENT</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Have questions regarding tournament participation, facility bookings, trials, or sports sponsorships? Reach out to our physical education office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Details & Info Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 text-amber-400 font-bold text-sm">
                <MapPin className="w-5 h-5" />
                <span>Institute Campus Address</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                KKR & KSR Institute of Technology & Sciences,<br />
                Vinjanampadu, Vaddeswaram Post, Guntur District,<br />
                Andhra Pradesh - 522017, India.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 text-amber-400 font-bold text-sm">
                <Phone className="w-5 h-5" />
                <span>Sports Helpline & Office</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>Physical Education Dept: +91 863 2288254</p>
                <p>Physical Director: +91 98765 43210</p>
                <p>Emergency Medical Desk: +91 98765 43999</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 text-amber-400 font-bold text-sm">
                <Mail className="w-5 h-5" />
                <span>Official Email Inquiries</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>sports@kkrksr.ac.in</p>
                <p>physicaldirector@kkrksr.ac.in</p>
              </div>
            </div>

          </div>

          {/* Contact Form & Google Map Simulation (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold text-white">Send Us a Direct Message</h3>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-sm">Message Transmitted Successfully!</p>
                  <p>Our Physical Education Office will respond to your registered email within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cricket Trial Inquiry / Ground Booking"
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Message *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your query details..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Sports Office</span>
                  </button>
                </form>
              )}
            </div>

            {/* Google Map Viewer Frame */}
            <div className="h-64 rounded-3xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 relative">
              <iframe
                title="KKR & KSR Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3829.839498263124!2d80.5234!3d16.2755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDE2JzMxLjgiTiA4MMKwMzEnMjQuMiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.6) invert(0.9) contrast(1.2)' }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
