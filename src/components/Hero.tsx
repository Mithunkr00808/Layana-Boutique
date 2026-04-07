import { getSiteSettings } from "@/lib/siteSettings";
import HeroSlider from "./HeroSlider";

export default async function Hero() {
  const { hero } = await getSiteSettings();

  return <HeroSlider images={hero.images} />;
}
