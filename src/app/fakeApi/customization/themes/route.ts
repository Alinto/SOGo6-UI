import { NextResponse } from 'next/server'

const data = `
:root {
    --background: 180 25% 40%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 180 25% 40%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --header-background: 180, 25%, 40%;
    --header-foreground: 240 5.3% 26.1%;
    --sidebar-background: 180, 25%, 40%;
    --sidebar-header-background: 180, 25%, 40%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 20%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 180 25% 40%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --header-background: 240 5.9% 10%;
    --header-foreground: 240 5.3% 26.1%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-header-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dyslexia {
    --background: 210 20% 93%; /* very light blue-gray */
    --foreground: 220 15% 20%; /* dark blue-gray */
    --card: 210 20% 98%; /* off-white */
    --card-foreground: 220 15% 20%;
    --popover: 210 20% 98%;
    --popover-foreground: 220 15% 20%;

    --primary: 220 80% 45%; /* strong blue */
    --primary-foreground: 0 0% 100%; /* white */

    --secondary: 210 16% 80%; /* light blue-gray */
    --secondary-foreground: 220 15% 20%;

    --muted: 210 16% 85%; /* muted blue-gray */
    --muted-foreground: 220 15% 40%;

    --accent: 30 100% 70%; /* soft orange for highlights */
    --accent-foreground: 220 15% 20%;

    --destructive: 0 80% 60%; /* strong red for errors */
    --destructive-foreground: 0 0% 100%;

    --border: 220 13% 40%;
    --input: 220 13% 40%;
    --ring: 220 80% 60%;

    --chart-1: 220 80% 45%; /* blue */
    --chart-2: 30 100% 70%; /* orange */
    --chart-3: 120 40% 50%; /* green */
    --chart-4: 270 60% 60%; /* purple */
    --chart-5: 0 80% 60%; /* red */

    --radius: 0.5rem;

    --header-background: 210 20% 93%;
    --header-foreground: 220 15% 20%;
    --sidebar-background: 210 20% 93%;
    --sidebar-header-background: 210 20% 93%;
    --sidebar-foreground: 220 15% 20%;
    --sidebar-primary: 220 80% 45%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 30 100% 70%;
    --sidebar-accent-foreground: 220 15% 20%;
    --sidebar-border: 220 13% 40%;
    --sidebar-ring: 220 80% 60%;
  }
  .tritanopia {
    /* Backgrounds and foregrounds: high contrast, avoid blue/yellow confusion */
    --background: 0 0% 95%; /* very light gray */
    --foreground: 240 5% 10%; /* very dark blue-gray */
    --card: 0 0% 100%;
    --card-foreground: 240 5% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 5% 10%;

    /* Primary: red (safe for tritanopia) */
    --primary: 0 80% 50%; /* strong red */
    --primary-foreground: 0 0% 100%; /* white */

    /* Secondary: green (safe for tritanopia) */
    --secondary: 120 40% 80%; /* light green */
    --secondary-foreground: 240 5% 10%;

    /* Muted: neutral gray */
    --muted: 0 0% 90%;
    --muted-foreground: 240 5% 40%;

    /* Accent: pink (safe for tritanopia) */
    --accent: 330 60% 70%; /* soft pink */
    --accent-foreground: 240 5% 10%;

    /* Destructive: dark red */
    --destructive: 0 70% 40%; /* dark red */
    --destructive-foreground: 0 0% 100%;

    /* Borders and rings: dark gray */
    --border: 220 13% 40%;
    --input: 220 13% 40%;
    --ring: 0 80% 60%;

    /* Chart colors: red, green, pink, orange, gray */
    --chart-1: 0 80% 50%; /* red */
    --chart-2: 120 40% 50%; /* green */
    --chart-3: 330 60% 60%; /* pink */
    --chart-4: 30 90% 60%; /* orange */
    --chart-5: 0 0% 50%; /* gray */

    --radius: 0.5rem;

    /* Sidebar and header: red and green for contrast */
    --header-background: 0 80% 50%;
    --header-foreground: 0 0% 100%;
    --sidebar-background: 0 80% 50%;
    --sidebar-header-background: 0 80% 50%;
    --sidebar-foreground: 0 0% 100%;
    --sidebar-primary: 120 40% 80%;
    --sidebar-primary-foreground: 240 5% 10%;
    --sidebar-accent: 330 60% 70%;
    --sidebar-accent-foreground: 240 5% 10%;
    --sidebar-border: 220 13% 40%;
    --sidebar-ring: 0 80% 60%;
  }
  .deuteranopia {
    /* Backgrounds and foregrounds: use high contrast, avoid red/green confusion */
    --background: 0 0% 95%; /* very light gray */
    --foreground: 240 5% 10%; /* very dark blue-gray */
    --card: 0 0% 100%;
    --card-foreground: 240 5% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 5% 10%;

    /* Primary: blue (safe for deuteranopia) */
    --primary: 220 80% 45%; /* strong blue */
    --primary-foreground: 0 0% 100%; /* white */

    /* Secondary: yellow/orange (safe for deuteranopia) */
    --secondary: 45 90% 85%; /* pale yellow */
    --secondary-foreground: 240 5% 10%;

    /* Muted: neutral gray */
    --muted: 0 0% 90%;
    --muted-foreground: 240 5% 40%;

    /* Accent: purple (safe for deuteranopia) */
    --accent: 270 60% 70%; /* soft purple */
    --accent-foreground: 240 5% 10%;

    /* Destructive: blue-gray (avoid red/green) */
    --destructive: 210 16% 45%; /* blue-gray */
    --destructive-foreground: 0 0% 100%;

    /* Borders and rings: dark blue-gray */
    --border: 220 13% 40%;
    --input: 220 13% 40%;
    --ring: 220 80% 60%;

    /* Chart colors: blue, yellow, purple, orange, cyan */
    --chart-1: 220 80% 45%; /* blue */
    --chart-2: 45 90% 60%; /* yellow */
    --chart-3: 270 60% 60%; /* purple */
    --chart-4: 30 90% 60%; /* orange */
    --chart-5: 180 60% 50%; /* cyan */

    --radius: 0.5rem;

    /* Sidebar and header: blue and yellow for contrast */
    --header-background: 220 80% 45%;
    --header-foreground: 0 0% 100%;
    --sidebar-background: 220 80% 45%;
    --sidebar-header-background: 220 80% 45%;
    --sidebar-foreground: 0 0% 100%;
    --sidebar-primary: 45 90% 85%;
    --sidebar-primary-foreground: 240 5% 10%;
    --sidebar-accent: 270 60% 70%;
    --sidebar-accent-foreground: 240 5% 10%;
    --sidebar-border: 220 13% 40%;
    --sidebar-ring: 220 80% 60%;
  }
  .protanopia {
    /* Backgrounds and foregrounds: high contrast, avoid reds/greens */
    --background: 0 0% 95%; /* very light gray */
    --foreground: 240 5% 10%; /* very dark blue-gray */
    --card: 0 0% 100%;
    --card-foreground: 240 5% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 5% 10%;

    /* Primary: blue (safe for protanopia) */
    --primary: 220 80% 45%; /* strong blue */
    --primary-foreground: 0 0% 100%; /* white */

    /* Secondary: yellow/orange (safe for protanopia) */
    --secondary: 45 90% 85%; /* pale yellow */
    --secondary-foreground: 240 5% 10%;

    /* Muted: neutral gray */
    --muted: 0 0% 90%;
    --muted-foreground: 240 5% 40%;

    /* Accent: purple (safe for protanopia) */
    --accent: 270 60% 70%; /* soft purple */
    --accent-foreground: 240 5% 10%;

    /* Destructive: blue-gray (avoid red/green) */
    --destructive: 210 16% 45%; /* blue-gray */
    --destructive-foreground: 0 0% 100%;

    /* Borders and rings: dark blue-gray */
    --border: 220 13% 40%;
    --input: 220 13% 40%;
    --ring: 220 80% 60%;

    /* Chart colors: blue, yellow, purple, orange, cyan */
    --chart-1: 220 80% 45%; /* blue */
    --chart-2: 45 90% 60%; /* yellow */
    --chart-3: 270 60% 60%; /* purple */
    --chart-4: 30 90% 60%; /* orange */
    --chart-5: 180 60% 50%; /* cyan */

    --radius: 0.5rem;

    /* Sidebar and header: blue and yellow for contrast */
    --header-background: 220 80% 45%;
    --header-foreground: 0 0% 100%;
    --sidebar-background: 220 80% 45%;
    --sidebar-header-background: 220 80% 45%;
    --sidebar-foreground: 0 0% 100%;
    --sidebar-primary: 45 90% 85%;
    --sidebar-primary-foreground: 240 5% 10%;
    --sidebar-accent: 270 60% 70%;
    --sidebar-accent-foreground: 240 5% 10%;
    --sidebar-border: 220 13% 40%;
    --sidebar-ring: 220 80% 60%;
  }
`

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
