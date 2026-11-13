import type { Metadata } from "next";
import { Geist, Geist_Mono, Nova_Slim, Junge, Philosopher, Mina, Inter, Poppins, Cormorant } from "next/font/google";
import Header from "../components/common/Header";
import RevealObserver from "../components/ui/RevealObserver";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const novaSlim = Nova_Slim({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-nova-slim",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});


const philosopher = Philosopher({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-philosopher",
});

const mina = Mina({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mina",
});

const junge = Junge({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-junge",
});

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const cormorant = Cormorant({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: {
    default: "Hot N Cool Restaurant",
    template: "Hot N Cool Restaurant | %s",
  },
  description:
    "Experience the taste of flavor at Hot N Cool Restaurant in Qatar. Authentic dining with multiple locations in Muaither, Al Mearad/Sailiya, and Madinat Khalifa. Open 24/7 for exceptional service.",
  keywords:
    "restaurant, qatar, dining, hot n cool, muaither, al mearad, sailiya, madinat khalifa, 24/7 service, authentic food",

  openGraph: {
    type: "website",
    title: {
      default: "Hot N Cool Restaurant",
      template: "Hot N Cool Restaurant | %s",
    },
    description:
      "Discover exceptional dining at Hot N Cool Restaurant. Multiple Qatar locations offering authentic flavors and 24/7 service for an unforgettable culinary experience.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
  className={`${geistSans.variable} ${geistMono.variable} ${novaSlim.variable} ${junge.variable} ${philosopher.variable} ${mina.variable} ${inter.variable} ${poppins.variable} ${cormorant.variable} font-[var(--font-poppins)] antialiased overflow-x-hidden`}
>

        {/* Runs before the body paints, so the hidden start state for
            scroll reveals only ever applies when JS is there to undo it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js-anim")`,
          }}
        />
        <RevealObserver />

        <div className="bg-brand-navy min-h-screen text-white">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
