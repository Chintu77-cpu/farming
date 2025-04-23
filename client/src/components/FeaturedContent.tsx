import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeaturedArticle {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  readTime: string;
}

const FeaturedContent = () => {
  const { t } = useTranslation();

  // Featured article data would normally come from an API
  const articles: FeaturedArticle[] = [
    {
      id: 1,
      title: t("featuredContent.article1.title"),
      description: t("featuredContent.article1.description"),
      imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400&h=250",
      readTime: "5 min"
    },
    {
      id: 2,
      title: t("featuredContent.article2.title"),
      description: t("featuredContent.article2.description"),
      imageUrl: "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&q=80&w=400&h=250",
      readTime: "7 min"
    },
    {
      id: 3,
      title: t("featuredContent.article3.title"),
      description: t("featuredContent.article3.description"),
      imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=400&h=250",
      readTime: "6 min"
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-secondary-dark mb-6 text-center">
        {t("featuredContent.title")}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg text-secondary-dark mb-2">{article.title}</h3>
              <p className="text-sm text-gray-700 mb-3">{article.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{article.readTime} {t("featuredContent.read")}</span>
                <Button variant="link" className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
                  {t("featuredContent.readArticle")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturedContent;
