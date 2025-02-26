import type { Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: "responsive",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: "",
        dark: "dark",
        tritanopia: "tritanopia",
        dyslexia: "dyslexia",
        deuteranopia: "deuteranopia",
        protanopia: "protanopia",
      },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
