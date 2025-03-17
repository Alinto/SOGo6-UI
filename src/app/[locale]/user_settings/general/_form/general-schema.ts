"use client";
import { z } from "zod";

const schema = z.object({
  language: z.string(),
  timezone: z.string(),
  shortDateStyle: z.string(),
  longDateStyle: z.string(),
  timeStyle: z.string(),
  defaultView: z.string(),
  refreshFrequency: z.string(),
  enableNotifications: z.boolean(),
  animationLevel: z.string(),
});

const defaultValues = {
  language: "fr",
  timezone: "Europe/Paris",
  shortDateStyle: "01-Fév-25",
  longDateStyle: "Samedi, Février 01, 2025",
  timeStyle: "15:02",
  defaultView: "Mail",
  refreshFrequency: "Every 5 minutes",
  enableNotifications: false,
  animationLevel: "normal",
};

export { schema, defaultValues };
