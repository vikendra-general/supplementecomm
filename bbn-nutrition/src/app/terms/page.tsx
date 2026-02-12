'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, Mail } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Terms of Service</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated: January 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to BBN Nutrition (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of our website located at bbn-nutrition.com (the &quot;Service&quot;) operated by BBN Nutrition Private Limited.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">2. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using this website&apos;s particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            {/* Use License */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">3. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials on BBN Nutrition&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">4. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            {/* Products and Services */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">5. Products and Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All products and services are subject to availability. We reserve the right to discontinue any product or service at any time without notice.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
              </p>
              <p className="text-gray-700 leading-relaxed">
                All products are intended for adults 18 years of age or older. Please consult with a healthcare professional before using any dietary supplements.
              </p>
            </section>

            {/* Orders and Payment */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">6. Orders and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By placing an order, you warrant that you are legally capable of entering into binding contracts and that all information you provide is accurate and complete.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order, or other reasons.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Payment must be received by us before we dispatch your order. We accept various payment methods as displayed during checkout.
              </p>
            </section>

            {/* Shipping and Delivery */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">7. Shipping and Delivery</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We will make every effort to deliver products within the estimated timeframe. However, delivery times are estimates and not guaranteed.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Risk of loss and title for products purchased pass to you upon delivery to the carrier. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.
              </p>
            </section>

            {/* Returns and Refunds */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">8. Returns and Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer a 30-day return policy for unopened products in their original packaging. Products must be returned in the same condition as received.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Refunds will be processed within 7-10 business days after we receive and inspect the returned items. Shipping costs are non-refundable unless the return is due to our error.
              </p>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">9. Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use our Service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">10. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The information on this website is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our products have not been evaluated by the Food and Drug Administration and are not intended to diagnose, treat, cure, or prevent any disease.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall BBN Nutrition or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BBN Nutrition&apos;s website.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">12. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Email: legal@bbn-nutrition.com</span>
                </div>
                <p className="text-gray-700">Address: BBN Nutrition Private Limited</p>
                <p className="text-gray-700">123 Business Street, Mumbai, Maharashtra 400001, India</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="space-x-6">
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Us
            </Link>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}