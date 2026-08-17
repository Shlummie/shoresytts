---
name: "Shoresy TTS"
description: "A Sudbury arena pass that turns one typed chirp into a local voice line."
colors:
  arena-black: "#07090d"
  ticket-blue: "#a9d8ef"
  ticket-blue-deep: "#79b5d4"
  ticket-paper: "#f4f2eb"
  brown: "#55351f"
  brown-dark: "#2a190f"
  goal-red: "#df3028"
  rink-white: "#f7fbfb"
  placeholder-brown: "#715d50"
  error-red: "#84251f"
typography:
  display:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(3rem, 5vw, 5.2rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(2.8rem, 4.6vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.03em"
  body:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  field: "3px"
spacing:
  compact: "9px"
  ticket-inset: "18px"
  field-inline: "20px"
  section: "24px"
  viewport-inline: "clamp(18px, 3vw, 48px)"
components:
  ticket-pass:
    backgroundColor: "{colors.ticket-blue}"
    textColor: "{colors.brown-dark}"
    padding: "{spacing.ticket-inset}"
    width: "min(94vw, 1480px)"
  identity-lockup:
    textColor: "{colors.brown}"
    typography: "{typography.headline}"
    padding: "18px 28px 30px 16px"
  phrase-field:
    backgroundColor: "{colors.ticket-paper}"
    textColor: "{colors.brown-dark}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "18px 20px"
  action-stub:
    backgroundColor: "transparent"
    textColor: "{colors.brown-dark}"
    typography: "{typography.display}"
    padding: "36px 24px 44px 34px"
  action-stub-hover:
    backgroundColor: "{colors.brown}"
    textColor: "{colors.rink-white}"
  docket-output:
    backgroundColor: "{colors.ticket-paper}"
    textColor: "{colors.brown-dark}"
    padding: "14px 30px 18px"
---

# Design System: Shoresy TTS

## Overview

**Creative North Star: "The Sudbury Arena Pass"**

Shoresy TTS is a piece of game-night ephemera made functional: one oversized Carolina-blue admission ticket sits in a dark arena-photo field and turns phrase-to-voice into the act of tearing a stub. The world is specific to the Sudbury Blueberry Bulldogs through its mark, team imagery, Shore 69 kit, hockey-ticket typography, and chocolate-and-blue uniform palette, while interface copy avoids implying official affiliation.

The experience is dense like a printed pass, not spacious like a software dashboard. Visible paper grain, ink-like rules, chamfered stock, and punched perforation carry the material character; the phrase field and output docket remain practical, legible, and keyboard accessible inside that physical metaphor.

The interaction has one story and one hierarchy: recognize the team, type a chirp, activate the detachable Speak stub, then hear the returned line. Photography and apparel support atmosphere, while the ticket, Bulldogs mark, field label, status, and control carry the task.

**Key Characteristics:**

- One dominant Carolina-blue ticket rather than a generic generator card.
- Heavy compressed sports type paired with a practical sans-serif input face.
- Real paper texture, printed rules, clipped corners, and punched perforation.
- Dark, restrained team photography that frames rather than competes.
- One phrase, one action stub, and one attached result docket.

## Colors

The palette reads like a Carolina-blue paper ticket printed in chocolate ink under dark rink lighting, with goal red reserved for decisive marks and states.

### Primary

- **Carolina Ticket Blue** (`colors.ticket-blue`): Owns the ticket stock and therefore the largest interface surface.
- **Deep Ticket Blue** (`colors.ticket-blue-deep`): A supporting blue for tonal ticket detail when additional stock contrast is needed.

### Tertiary

- **Goal Red** (`colors.goal-red`): Marks score-like rules, input focus, playback accent, and the most important state cues.
- **Penalty Red** (`colors.error-red`): Carries error copy without turning the entire ticket into an alarm surface.

### Neutral

- **Arena Black** (`colors.arena-black`): Grounds the full viewport, perforation holes, and the darkest photographic fade.
- **Ivory Ticket Paper** (`colors.ticket-paper`): Gives the phrase field and output docket a writable paper surface.
- **Chocolate Ink** (`colors.brown`): Prints headlines, rules, metadata, and the interactive stub.
- **Dark Chocolate Ink** (`colors.brown-dark`): Provides the highest-contrast functional text on blue and ivory stock.
- **Rink White** (`colors.rink-white`): Supplies high-contrast text when the action stub reverses on hover.
- **Faded Ticket Ink** (`colors.placeholder-brown`): Keeps placeholder copy visibly subordinate to entered text.

### Named Rules

**The Admission Blue Rule.** Carolina Ticket Blue owns the primary interface surface; Goal Red is a precise scoring mark, never the page or ticket fill.

## Typography

**Display Font:** Oswald (with sans-serif fallback)

**Body Font:** Segoe UI (with Arial and sans-serif fallbacks)

**Character:** Oswald supplies the narrow, heavy cadence of a sports ticket and arena wordmark. Segoe UI keeps the phrase, status, and error language neutral enough to scan during a long local generation.

### Hierarchy

- **Display** (`typography.display`): The Speak verb on the detachable stub; it should be the strongest action word in view.
- **Headline** (`typography.headline`): The stacked Shoresy TTS identity, always uppercase and tightly set.
- **Title** (`typography.title`): The phrase-field label and other ticket-section headings.
- **Body** (`typography.body`): User-entered phrase text and practical supporting language.
- **Label** (`typography.label`): Compact all-caps stub notes and ticket metadata with wide tracking.

### Named Rules

**The Scoreboard Hierarchy Rule.** Use Oswald for identity, labels, numbers, and decisive verbs; use the practical sans-serif face for anything the user types or must read as live feedback.

## Layout

The desktop surface is a single horizontal ticket (`min(94vw, 1480px)`) with three columns: identity on the left, a deliberately dominant phrase field in the center, and the Speak stub on the right. The ticket enters below the photo's focal area, while the result docket spans the full ticket width and stays physically attached to its lower edge.

Viewport padding follows `spacing.viewport-inline` on desktop. At the compact breakpoint (980px), the same three-part structure compresses without changing priority. At the mobile breakpoint (760px), the ticket becomes a vertical pass in identity-field-action order, the perforation rotates to a horizontal tear line, and the docket becomes a one-column band. At the narrow breakpoint (420px), identity and copy insets tighten while the task order stays unchanged. The document supports a minimum viewport width of 320px.

Photography is a full-bleed atmospheric layer with a dark downward fade. It stays behind the ticket and never replaces ticket copy, the Bulldogs mark, visible focus, or status as functional communication.

## Elevation & Depth

Depth is structural rather than card-based. The ticket casts one broad ambient shadow plus one tighter contact shadow against the arena field; the phrase field uses a shallow inset shadow to feel pressed into the stock. Paper scans, photographic fading, border ink, and overlap do the remaining depth work.

### Shadow Vocabulary

- **Ticket Lift** (`0 32px 86px rgba(0, 0, 0, 0.52), 0 9px 24px rgba(0, 0, 0, 0.28)`): The sole large elevation treatment, reserved for the complete ticket.
- **Field Press** (`inset 0 3px 9px rgba(85, 53, 31, 0.08)`): The quiet inset depth inside the ivory writing surface.
- **Field Focus Halo** (`0 0 0 3px rgba(223, 48, 40, 0.22)`): Adds an accessible red focus response without lifting the field off the ticket.

### Named Rules

**The One Physical Layer Rule.** The ticket may lift from the arena; its internal regions stay attached with ink, texture, and inset depth rather than becoming separate floating cards.

## Shapes

The system uses cut stock instead of soft software containers. The main ticket has clipped 13px corners, an inset double-line effect, and a continuous printed baseline. The phrase field has only a slight 3px practical radius. The action boundary is a repeated row of punched circular holes that changes orientation with the ticket, making the button read as a detachable stub.

**The Stub Edge Rule.** Separate the primary action with punched perforation and ticket geometry, not with a pill, floating button, or generic divider.

## Components

### Ticket Pass

- **Shape:** Wide clipped paper stock with 13px chamfers and an inset chocolate rule.
- **Surface:** Carolina Ticket Blue plus the project paper scan; never a flat white app card.
- **Depth:** Uses Ticket Lift once around the complete pass.
- **Responsive behavior:** Holds three horizontal regions on desktop and stacks into one vertical pass at 760px.

### Identity Lockup

- **Composition:** Bulldogs mark, stacked Shoresy TTS headline, and a compact three-column metadata row.
- **Typography:** Oswald carries identity and values; small sans-serif labels provide ticket-docket detail.
- **Color:** Chocolate Ink on Carolina Ticket Blue, with Goal Red underlining TTS.

### Phrase Field

- **Style:** Ivory paper scan, square printed chocolate border, Field Press inset, and `components.phrase-field` spacing.
- **Focus:** Border changes to Goal Red and gains the Field Focus Halo.
- **Disabled:** Native interaction is blocked during generation while the field remains visually part of the ticket.

### Speak Stub

- **Shape:** Full ticket-height action region on desktop and full-width ticket end on mobile, joined by punched perforation.
- **Primary:** Transparent blue-stock background with Dark Chocolate Ink and a double Goal Red rule around the action verb.
- **Hover / Focus:** Hover reverses to Chocolate Ink and Rink White while shifting in the tear direction; keyboard focus uses a thick inset Goal Red outline.
- **Busy / Reduced Motion:** Busy state changes Speak to Wait and pulses the perforation. Reduced-motion preference collapses animation and transition durations.

### Output Docket

- **Style:** An attached Ivory Ticket Paper band with a chocolate top rule, never a separate result card.
- **Content:** Oswald status label, functional error copy, and a full-width native audio player accented in Goal Red.
- **Layout:** Label and result share one row on desktop and stack at the mobile breakpoint.

## Do's and Don'ts

### Do:

- **Do** make the ticket the dominant interface surface and keep the phrase field its largest functional region.
- **Do** use team photography as a dark atmospheric field behind legible ticket content.
- **Do** preserve the one-phrase, one-Speak-stub, one-attached-result sequence.
- **Do** maintain visible keyboard focus, honest busy feedback, and reduced-motion behavior.
- **Do** treat the Bulldogs mark and team imagery as world-building assets, never as evidence of official affiliation.

### Don't:

- **Don't** wrap the generator in a rounded white dashboard card or generic SaaS shell.
- **Don't** add navigation, setup instructions, configuration panels, or secondary actions to the main surface.
- **Don't** expand Goal Red into a large background; its restraint gives the scoring marks authority.
- **Don't** detach status or playback into a floating toast, modal, or unrelated card.
- **Don't** promise an exact actor voice clone, official endorsement, or fabricated performance claim through visual or interface copy.
