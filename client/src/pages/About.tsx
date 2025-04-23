import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-dark mb-6">
          {t("about.title")}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="ri-plant-line text-3xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold text-secondary-dark mb-2">
                {t("about.mission.title")}
              </h3>
              <p className="text-gray-700">
                {t("about.mission.description")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="ri-eye-line text-3xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold text-secondary-dark mb-2">
                {t("about.vision.title")}
              </h3>
              <p className="text-gray-700">
                {t("about.vision.description")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="ri-heart-line text-3xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold text-secondary-dark mb-2">
                {t("about.values.title")}
              </h3>
              <p className="text-gray-700">
                {t("about.values.description")}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-secondary-dark mb-6 text-center">
            {t("about.ourStory.title")}
          </h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">
              {t("about.ourStory.paragraph1")}
            </p>
            <p className="text-gray-700 mb-4">
              {t("about.ourStory.paragraph2")}
            </p>
            <p className="text-gray-700">
              {t("about.ourStory.paragraph3")}
            </p>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-secondary-dark mb-6 text-center">
            {t("about.whatWeDo.title")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start mb-4">
                <div className="bg-accent/10 p-2 rounded-full mr-4">
                  <i className="ri-book-open-line text-xl text-accent"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-dark mb-2">
                    {t("about.whatWeDo.education.title")}
                  </h3>
                  <p className="text-gray-700">
                    {t("about.whatWeDo.education.description")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start mb-4">
                <div className="bg-accent/10 p-2 rounded-full mr-4">
                  <i className="ri-robot-line text-xl text-accent"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-dark mb-2">
                    {t("about.whatWeDo.technology.title")}
                  </h3>
                  <p className="text-gray-700">
                    {t("about.whatWeDo.technology.description")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start mb-4">
                <div className="bg-accent/10 p-2 rounded-full mr-4">
                  <i className="ri-water-flash-line text-xl text-accent"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-dark mb-2">
                    {t("about.whatWeDo.sustainability.title")}
                  </h3>
                  <p className="text-gray-700">
                    {t("about.whatWeDo.sustainability.description")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start mb-4">
                <div className="bg-accent/10 p-2 rounded-full mr-4">
                  <i className="ri-team-line text-xl text-accent"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-dark mb-2">
                    {t("about.whatWeDo.community.title")}
                  </h3>
                  <p className="text-gray-700">
                    {t("about.whatWeDo.community.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-secondary-dark mb-6 text-center">
            {t("about.team.title")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-dark">
                  {t("about.team.member1.name")}
                </h3>
                <p className="text-accent text-sm mb-2">
                  {t("about.team.member1.role")}
                </p>
                <p className="text-gray-700 text-sm">
                  {t("about.team.member1.bio")}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-dark">
                  {t("about.team.member2.name")}
                </h3>
                <p className="text-accent text-sm mb-2">
                  {t("about.team.member2.role")}
                </p>
                <p className="text-gray-700 text-sm">
                  {t("about.team.member2.bio")}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-dark">
                  {t("about.team.member3.name")}
                </h3>
                <p className="text-accent text-sm mb-2">
                  {t("about.team.member3.role")}
                </p>
                <p className="text-gray-700 text-sm">
                  {t("about.team.member3.bio")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
