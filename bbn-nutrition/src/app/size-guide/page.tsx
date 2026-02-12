'use client';

import { useState } from 'react';
import { Ruler, Shirt, Users, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface SizeChart {
  category: string;
  sizes: {
    size: string;
    chest?: string;
    waist?: string;
    length?: string;
    sleeve?: string;
    shoulder?: string;
    [key: string]: string | undefined;
  }[];
}

const sizeCharts: SizeChart[] = [
  {
    category: "Men's T-Shirts & Tank Tops",
    sizes: [
      { size: "XS", chest: "34-36", length: "26", shoulder: "16.5" },
      { size: "S", chest: "36-38", length: "27", shoulder: "17.5" },
      { size: "M", chest: "38-40", length: "28", shoulder: "18.5" },
      { size: "L", chest: "40-42", length: "29", shoulder: "19.5" },
      { size: "XL", chest: "42-44", length: "30", shoulder: "20.5" },
      { size: "XXL", chest: "44-46", length: "31", shoulder: "21.5" },
      { size: "XXXL", chest: "46-48", length: "32", shoulder: "22.5" }
    ]
  },
  {
    category: "Women's T-Shirts & Tank Tops",
    sizes: [
      { size: "XS", chest: "30-32", length: "24", shoulder: "14.5" },
      { size: "S", chest: "32-34", length: "25", shoulder: "15.5" },
      { size: "M", chest: "34-36", length: "26", shoulder: "16.5" },
      { size: "L", chest: "36-38", length: "27", shoulder: "17.5" },
      { size: "XL", chest: "38-40", length: "28", shoulder: "18.5" },
      { size: "XXL", chest: "40-42", length: "29", shoulder: "19.5" }
    ]
  },
  {
    category: "Hoodies & Sweatshirts",
    sizes: [
      { size: "XS", chest: "36-38", length: "25", sleeve: "32", shoulder: "17" },
      { size: "S", chest: "38-40", length: "26", sleeve: "33", shoulder: "18" },
      { size: "M", chest: "40-42", length: "27", sleeve: "34", shoulder: "19" },
      { size: "L", chest: "42-44", length: "28", sleeve: "35", shoulder: "20" },
      { size: "XL", chest: "44-46", length: "29", sleeve: "36", shoulder: "21" },
      { size: "XXL", chest: "46-48", length: "30", sleeve: "37", shoulder: "22" }
    ]
  },
  {
    category: "Shorts & Joggers",
    sizes: [
      { size: "XS", waist: "28-30", length: "9" },
      { size: "S", waist: "30-32", length: "9.5" },
      { size: "M", waist: "32-34", length: "10" },
      { size: "L", waist: "34-36", length: "10.5" },
      { size: "XL", waist: "36-38", length: "11" },
      { size: "XXL", waist: "38-40", length: "11.5" }
    ]
  }
];

const measurementTips = [
  {
    title: "Chest/Bust",
    description: "Measure around the fullest part of your chest, keeping the tape horizontal."
  },
  {
    title: "Waist",
    description: "Measure around your natural waistline, keeping the tape comfortably loose."
  },
  {
    title: "Length",
    description: "Measure from the highest point of the shoulder down to the desired length."
  },
  {
    title: "Sleeve",
    description: "Measure from the center back of the neck, over the shoulder, and down to the wrist."
  },
  {
    title: "Shoulder",
    description: "Measure from shoulder point to shoulder point across the back."
  }
];

export default function SizeGuidePage() {
  const [activeChart, setActiveChart] = useState(0);
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Size Guide</h1>
          <p className="text-xl text-gray-600">
            Find your perfect fit with our comprehensive sizing charts
          </p>
        </div>

        {/* Measurement Tips */}
        <div className="mb-8">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors"
          >
            <Info className="w-5 h-5" />
            <span>How to Measure</span>
            {showTips ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {showTips && (
            <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {measurementTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Ruler className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Pro Tip:</strong> All measurements are in inches. For the best fit, 
                  have someone help you measure, and wear the type of undergarments you plan 
                  to wear with the item.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {sizeCharts.map((chart, index) => (
              <button
                key={index}
                onClick={() => setActiveChart(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeChart === index
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {chart.category}
              </button>
            ))}
          </div>
        </div>

        {/* Size Chart */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Shirt className="w-5 h-5 mr-2" />
              {sizeCharts[activeChart].category}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  {Object.keys(sizeCharts[activeChart].sizes[0])
                    .filter(key => key !== 'size')
                    .map(key => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key.charAt(0).toUpperCase() + key.slice(1)} (in)
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sizeCharts[activeChart].sizes.map((sizeData, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sizeData.size}
                    </td>
                    {Object.entries(sizeData)
                      .filter(([key]) => key !== 'size')
                      .map(([key, value]) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {value}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fit Guide */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Fit Guide
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Regular Fit</h4>
                <p className="text-gray-600 text-sm">
                  Our standard fit with comfortable room for movement. Not too tight, not too loose.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Slim Fit</h4>
                <p className="text-gray-600 text-sm">
                  A more tailored fit that follows your body shape closely without being restrictive.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Oversized Fit</h4>
                <p className="text-gray-600 text-sm">
                  Relaxed, loose-fitting style for maximum comfort and a casual look.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Size Conversion</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">US</th>
                    <th className="text-left py-2">UK</th>
                    <th className="text-left py-2">EU</th>
                    <th className="text-left py-2">Chest (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="py-2">XS</td><td>6</td><td>32</td><td>34-36</td></tr>
                  <tr><td className="py-2">S</td><td>8</td><td>34</td><td>36-38</td></tr>
                  <tr><td className="py-2">M</td><td>10</td><td>36</td><td>38-40</td></tr>
                  <tr><td className="py-2">L</td><td>12</td><td>38</td><td>40-42</td></tr>
                  <tr><td className="py-2">XL</td><td>14</td><td>40</td><td>42-44</td></tr>
                  <tr><td className="py-2">XXL</td><td>16</td><td>42</td><td>44-46</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Still unsure about sizing?
          </h2>
          <p className="text-green-700 mb-6">
            Our customer support team is here to help you find the perfect fit. 
            Contact us with your measurements and we&apos;ll recommend the best size for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@bbn.com"
              className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}