import Head from "next/head";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";

export default function Home() {
  return (
    <>
      <Head>
        <title>Ouwibo Agent - Advanced AI Chat</title>
        <meta
          name="description"
          content="Experience advanced AI with Ouwibo Agent. Choose from multiple powerful models for your use case."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
    </>
  );
}
