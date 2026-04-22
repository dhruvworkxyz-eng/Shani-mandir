import React from "react";
import emailjs from "@emailjs/browser";
import { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

const ContactPage = ({ id }) => {
  const { t } = useLanguage();
  const form = useRef();
  const [loader, setloader] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setloader(true);

    emailjs
      .sendForm(
        "service_jjpb6tq",
        "template_eaw52ht",
        form.current,
        "vwSrJ918OllPQ-NVX"
      )
      .then(
        (result) => {
          setloader(false);
          console.log(result.text);
          toast.success(t("contact.emailSent", "Email sent successfully"));
          form.current.reset();
        },
        (error) => {
          setloader(false);
          console.log(error.text);
          toast.error(t("contact.emailFailed", "Failed to send email"));
        }
      );
  };

  return (
    <div
      className="flex flex-row bg-orange-100 w-full h-full px-50 py-50 ct-main"
      id={id}
    >
      <div className="flower-pattern"></div>
      <div className="left px-50 py-50 h-full w-full flex flex-col align-center justify-center mx-20 my-20">
        <div className="flex flex-col align-center justify-center map-div leading-9">
          <h1 className="font-bold text-2xl text-red-900 underline">{t("contact.address", "Address :")}</h1>
          <h1 className="font-bold text-xl text-red-900 leading-9">
            Shani Mandir ,Palla mod, By Pass, GT Karnal Rd, Garthi Khurad, Alipur, Delhi, 110036
          </h1>
          <br />

          <h1 className="font-bold text-2xl text-red-900 underline">{t("contact.contact", "Contact :")}</h1>
          <a href="tel:+919911921125" className="block mt-2 text-red-900 font-bold text-xl">
            +91 9911921125
          </a>
          <a
            href="mailto:Shanimandiralipur@gmail.com"
            className="block mt-2 text-red-900 font-bold text-xl break-all"
          >
            Shanimandiralipur@gmail.com
          </a>

          <a
            href="https://wa.me/919911921125"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:bg-green-700 transition duration-300"
          >
            <FaWhatsapp size={28} />
            {t("contact.whatsapp", "Chat on WhatsApp")}
          </a>
          <br />

          <h1 className="font-bold text-2xl text-red-900 underline">{t("contact.location", "Location :")}</h1>
          <iframe
            width="406"
            height="274"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            id="gmap_canvas"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3496.1788894613132!2d77.13787147550708!3d28.80374247557171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3668cb90009%3A0xb301a10545a1966b!2sShani%20Dham%20Mandir!5e0!3m2!1sen!2sin!4v1776498105367!5m2!1sen!2sin"
          ></iframe>
        </div>
      </div>

      <div className="right bg-orange-100 h-full w-full px-50 py-50">
        <section className="px-50 py-50">
          <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
            <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-red-900">
              {t("contact.sendMessage", "Send Message")}
            </h2>
            <form ref={form} onSubmit={sendEmail} className="space-y-8">
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-red-900">
                  {t("contact.enterEmail", "Enter Email*")}
                </label>
                <input
                  name="email"
                  type="email"
                  id="email"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  placeholder="name@gmail.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone number" className="block mb-2 text-sm font-medium text-red-900">
                  {t("contact.phone", "Phone Number*")}
                </label>
                <input
                  name="subject"
                  type="number"
                  id="subject"
                  className="block p-3 w-full text-sm rounded-lg border border-gray-300 shadow-sm"
                  placeholder="Let us know how we can help you"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-red-900">
                  {t("contact.comments", "Comments / Questions *")}
                </label>
                <textarea
                  name="msg"
                  id="message"
                  rows="6"
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300"
                  placeholder="Leave a comment..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-red-900 hover:bg-primary-800"
              >
                {t("contact.submit", "Submit")}
              </button>
            </form>
          </div>
        </section>
      </div>

      <ToastContainer theme="dark" />
    </div>
  );
};

export default ContactPage;
