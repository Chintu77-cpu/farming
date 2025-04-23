import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <i className="ri-plant-line text-3xl mr-2"></i>
              <h2 className="font-bold text-xl">{t("footer.title")}</h2>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-accent-light transition-colors">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-accent-light transition-colors">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-accent-light transition-colors">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-accent-light transition-colors">
                <i className="ri-youtube-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-sm text-gray-300 hover:text-white transition-colors">
                    {t("nav.home")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-sm text-gray-300 hover:text-white transition-colors">
                    {t("nav.about")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/farming-tips">
                  <a className="text-sm text-gray-300 hover:text-white transition-colors">
                    {t("footer.farmingResources")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/weather">
                  <a className="text-sm text-gray-300 hover:text-white transition-colors">
                    {t("nav.weather")}
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("footer.contactUs")}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.resources")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/farming-tips">
                  <a className="text-sm text-gray-300 hover:text-white transition-colors">
                    {t("paddyGuide.title")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/water-conservation">
                  <a className="text-sm text-gray-300 hover:text-white transition-colors">
                    {t("waterConservation.title")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/soil-health">
                  <a className="text-sm text-gray-300 hover:text-white transition-colors">
                    {t("soilHealth.title")}
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("footer.sustainablePractices")}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("footer.faq")}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.contactUs")}</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="ri-mail-line mt-1 mr-2 text-accent-light"></i>
                <span className="text-sm text-gray-300">support@farmsustain.org</span>
              </li>
              <li className="flex items-start">
                <i className="ri-phone-line mt-1 mr-2 text-accent-light"></i>
                <span className="text-sm text-gray-300">+91 98765 43210</span>
              </li>
              <li className="flex items-start">
                <i className="ri-map-pin-line mt-1 mr-2 text-accent-light"></i>
                <span className="text-sm text-gray-300">
                  {t("footer.address")}
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-400 mb-4 md:mb-0">
            © {currentYear} {t("footer.title")}. {t("footer.allRightsReserved")}
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
              {t("footer.privacyPolicy")}
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
              {t("footer.termsOfService")}
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
              {t("footer.cookiePolicy")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
