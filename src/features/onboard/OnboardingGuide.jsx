import React from "react";
import Navbar from "../../components/Navbar";
import heroimg from "../../assets/heroimg.webp";
import img1 from "../../assets/img1.png";
import img2 from "../../assets/img2.png";
import img3 from "../../assets/Picture1.png";
import img4 from "../../assets/Picture2.png";
import img5 from "../../assets/Picture3.png";
import img6 from "../../assets/img7.png";
import img7 from "../../assets/img8.png";
import img8 from "../../assets/img9.png";
import img9 from "../../assets/img10.png";
import img10 from "../../assets/img11.png";
import img11 from "../../assets/img12.png";
import img12 from "../../assets/img13.png";
import img13 from "../../assets/img14.png";


const OnboardingGuide = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-teal-200">
      <Navbar />
      {/* Hero Section */}
      <section className="mt-10  py-25  lg:px-50 ">
        <div className="max-w-7xl  flex flex-col md:flex-row items-center justify-between">
          {/* Left Text Section */}
          <div className="w-full md:w-1/2 px-10  mb-12   text-left">
            <h1 className="text-3xl  lg:text-5xl font-bold leading-tight text-gray-800">
              Onboarding
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-800 ml-2">
                Guide
              </span>
              <br />
            </h1>
            <p className="text-gray-500 my-4  sm:text-md  lg:text-xl font-semibold">
              Foodchow's WhatsApp Embedded Sign-up provides an easy way to
              register a WhatsApp Access API App for your business/brand. This
              process is self-service and can be started from Foodchow's
              Dashboard.
            </p>

            <p className="mt-6   lg:text-lg text-gray-600">
              Registering a WhatsApp Business account will allow you to send and
              receive messages from your company's brand using Foodchow's APIs.
              Meta enforces certain restrictions and you will likely need to
              complete Meta Business Verification before making your App live.
            </p>
          </div>

          {/* Right Image Section */}
          <div className="w-1/2 relative lg:ml-20 flex justify-center">
            <img
              src={heroimg}
              alt="heroimg"
              className="rounded-3xl w-80 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Section 1 */}
      <section className="bg-gradient-to-r from-green-50 to-teal-200 py-5 px-10 lg:px-40 flex flex-col md:flex-row  space-x-15">
        <div className="w-full md:w-1/2 mb-4 lg:mb-12 text-left">
          <h3 className="text-2xl lg:text-4xl font-bold leading-tight text-gray-800 my-2">
            Prerequisites
          </h3>
          <h4 className="text-md lg:text-xl font-bold text-gray-500">
            Before you get started with this guide, you'll need:
          </h4>
          <div className="text-gray-600 my-3 lg:my-6 text-md lg:text-lg font-semibold">
            <ul>
              <li>1. A Foodchow account.</li>
              <li>2. A valid email address.</li>
              <li>
                3. A new phone number. Alternatively, you can migrate a live
                phone number.
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full md:w-1/2 mb-4 lg:mb-12 text-left">
          <p className="text-gray-600 my-1 lg:my-4 text-md lg:text-lg">
            The number must be able to receive an SMS or phone call. If the
            number can only receive phone calls, it cannot be using an IVR.
          </p>
          <p className="text-gray-600 mt-3 lg:mt-4 text-md lg:text-lg">
            If migrating from the current BSP to Foodchow using the Embedded
            Signup Flow, disable 2FA for the phone number at the source BSP.
          </p>
          <p className="mt-3 lg:mt-4 text-md lg:text-lg text-gray-600">
            During this process, you can either create a new Meta(Facebook)
            Business Account or select an existing one. We recommend using an
            existing Meta(Facebook) Business Account if someone within your
            company has already created and verified it. If this is the case,
            they will either need to invite you as an administrator with full
            access or you can share the Direct Facebook Registration link with
            the Meta(Facebook) business account owner. They can log in and
            complete the WhatsApp Business Account process.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-gradient-to-r from-green-50 to-teal-200 py-3 lg:py-5 px-5 sm:px-10 lg:px-40">
        <div className="mb-10 text-center sm:w-2xl lg:w-full">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">
            Let's Get Started
          </h1>
        </div>

        <div className="container mx-auto flex-col mb-12  space-y-12">
          <img
            src={img1}
            alt="img1"
            className="p-7 shadow-2xl mx-auto lg:w-110 lg:h-100"
          />
          <img src={img2} alt="img2" className="p-7 shadow-2xl mx-auto" />
          <p className="text-gray-600 font-semibold mt-10 mb-3 text-md lg:text-xl ">
            1. Start by logging into your Foodchow Dashboard. Then, select
            WhatsApp Select Continue with Facebook to proceed further. If you do
            not have access to the company's Facebook account, you can copy the
            URL and share it with your administrator
          </p>
          <p className="text-gray-600 font-semibold mt-5 mb-3 text-md lg:text-xl text-left">
            2. Select{" "}
            <span className="font-bold text-gray-700">
              Continue with Facebook
            </span>{" "}
            to proceed further. If you do not have the access to company's
            Facebook account, you can copy the URL and share it with your
            administrator.
          </p>{" "}
          <img src={img3} alt="img3" className="p-7 shadow-2xl mx-auto" />
          <p className="text-gray-600 font-semibold mt-20 mb-3 text-md lg:text-xl text-left mx-auto">
            3. Log into Facebook if you haven't already or click.
            <span className="font-bold text-gray-700">
              Continue as [your name]
            </span>{" "}
            if you're already signed in. After logging in, you will be shown an
            overview of the process of connecting your number to WhatsApp.
          </p>
          <img src={img4} alt="img4" className="p-7 shadow-2xl  mx-auto" />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            4. Select{" "}
            <span className="font-bold text-gray-700">Get Started.</span>
          </p>
          <img src={img5} alt="img5" className="p-7 shadow-2xl  mx-auto" />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            5. Fill in your business information and select.
            <span className="font-bold text-gray-700">Next.</span>
          </p>
          <img src={img6} alt="img6" className="p-7 shadow-2xl " />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            6. Next, you will be able to select a{" "}
            <span className="font-bold text-gray-700">
              WhatsApp Business Account (WABA)
            </span>{" "}
            and{" "}
            <span className="font-bold text-gray-700">
              WhatsApp Business Profile{" "}
            </span>
            or create a new one
          </p>
          <img src={img7} alt="img7" className="p-7 shadow-2xl" />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            7. Now, provide details for your business information.
          </p>
          <img src={img8} alt="img8" className="p-7 shadow-2xl mx-auto" />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            8. Create or select your WhatsApp Business account. Then, select{" "}
            <span className="font-bold text-gray-700">Next.</span>
          </p>
          <img src={img9} alt="img9" className="p-7 shadow-2xl mx-auto" />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            9. Provide a WhatsApp Business display name and select the category.
            Then, select <span className="font-bold text-gray-700">Next.</span>
          </p>
          <img src={img10} alt="img10" className="p-7 shadow-2xl mx-auto" />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            10. Next, you will receive a verification code on your registered
            phone number. Enter the verification code and select{" "}
            <span className="font-bold text-gray-700">Next.</span>
          </p>
          <img src={img11} alt="img11" className="p-7 shadow-2xl mx-auto" />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            11. Review the permissions requested and select{" "}
            <span className="font-bold text-gray-700">Continue.</span>
          </p>
          <img src={img12} alt="img12" className="p-7 shadow-2xl mx-auto " />
          <p className="text-gray-600 font-semibold mt-20 mb-2 text-md lg:text-xl text-left">
            12. You're all set to go. Select.{" "}
            <span className="font-bold  text-gray-700">Finish.</span>
          </p>
          <img src={img13} alt="img13" className="p-7 shadow-2xl  mx-auto" />
        </div>
      </section>
    </div>
  );
};

export default OnboardingGuide;
