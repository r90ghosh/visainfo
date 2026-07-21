import AnimatedBackground from '../src/components/AnimatedBackground';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import HomeClient from '../src/HomeClient';

export const metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <div className="app">
        <Header />
        <HomeClient />
        <Footer />
      </div>
    </>
  );
}
