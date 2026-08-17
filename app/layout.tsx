import type { Metadata } from "next";
import "./globals.css";

const directionContract = `<!--
THESIS: One oversized Sudbury arena ticket turns phrase-to-voice into an admission moment and refuses the generic generator card.
OWN-WORLD: Carolina-blue ticket stock, chocolate ink, rink white, the official Bulldogs mark, team key art, Shore 69 sweater, and punched perforation.
STORY: A fan recognizes the team, types a chirp, tears the action stub, and hears the line.
FIRST VIEWPORT: A dark team-photo field sits behind a ninety-percent-width horizontal ticket; identity is left, the phrase field dominates center, Speak is the right stub, and the sweater overlaps below.
FORM: Sudbury arena pass, grounded direction seven, seed 3177ce74; approved comp .impeccable/mocks/arena-ticket-horizontal.png.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export const metadata: Metadata = {
  title: "Shoresy TTS",
  description: "A small local phrase-to-voice utility.",
  icons: {
    icon: "/brand/shoresy-logo.png",
    shortcut: "/brand/shoresy-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <span
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: directionContract }}
        />
        {children}
      </body>
    </html>
  );
}
