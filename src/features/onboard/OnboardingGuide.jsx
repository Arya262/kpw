import React from "react";

const OnboardingGuide = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Onboarding Guide</h1>
      <p className="mb-2">
        Welcome to our platform! This guide will help you get started with Gupshup's WhatsApp Embedded Sign-up and more.
      </p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <strong>Create Your Account:</strong> Register your account and log in to the dashboard.
        </li>
        <li>
          <strong>Register WhatsApp API App:</strong> Go to Settings → Click “Start WhatsApp Registration”.
        </li>
        <li>
          <strong>Submit Business Details:</strong> Fill out the required Meta Business and phone number details.
        </li>
        <li>
          <strong>Get Approved:</strong> Once verified, you can start sending WhatsApp messages using templates.
        </li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">Need help? Visit the Help section or contact support.</p>
    </div>
  );
};

export default OnboardingGuide;
