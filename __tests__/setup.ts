import { vi } from "vitest";

vi.mock("src/utils/content", () => ({
  experienceData: [
    {
      id: "2",
      title: "Openbank",
      image: "/experience/openbank.svg",
      date_from: "June 2023",
      date_to: "now",
      url: "https://openbank.es/",
      description: "# Consulting Firm\n\n- Knowmad Mood\n- Plexus\n\n# Projects\n\n- Onboarding\n- Customer",
    },
    {
      id: "1",
      title: "RSI",
      image: "/experience/rsi.svg",
      date_from: "October 2021",
      date_to: "April 2023",
      url: "https://grupocajarural.es/",
      description: "# Consulting Firm\n\n- Devoteam\n\n# Projects\n\n- Onboarding\n- Customer\n\n# Tasks\n\n- Web application development using Vue.js and React.js\n- REST API integration in front-end applications\n- Unit and integration test development\n- Code documentation\n- Translations using i18n\n- Modification and elaboration of login pages\n- Internal SSO access elaboration\n- Modification of CSS styles\n\n# Skills\n\nvue.js, react.js, typescript, javascript, jest.js, node.js, html, css, jsp, oracle db, inkscape, jira, git, dbeaver, postman, invision, overflow",
    },
  ],
  portfolioData: [
    {
      id: "1",
      title: "ialvaro",
      image: "images/readme/ialvaro.png",
      url: "https://github.com/badwatt/ialvaro",
      description: "A website done by using TypeScript, React.js, Astro.js, Tailwind & Framer Motion",
    },
    {
      id: "2",
      title: "wrestic",
      image: "portfolio/wrestic/wrestic_mockup.png",
      url: "https://github.com/badwatt/wrestic",
      description: "Wrestic is a backup tool built in Rust that provides a wrapper around Restic, a popular backup program.",
    },
  ],
  biographyData: [
    {
      id: "3",
      bio: "I feel very fortunate to have found what I am passionate about and to make it my job.\nI have also worked managing, training and leading marketing teams at a national level.\nIf there is one thing that characterises me, it is that I am 100% involved in everything I do.\nI am hard-working, perfectionist and non-conformist.\nI have a direct and creative working style. And I put all the energy I get from working in what I am so enthusiastic about.",
    },
  ],
}));