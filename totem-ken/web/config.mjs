const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://totem.ai" : `https://${stage}.totem.ai`,
  console: stage === "production" ? "https://totem.ai/auth" : `https://${stage}.totem.ai/auth`,
  email: "help@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/anomalyco/totem",
  discord: "https://totem.ai/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}
