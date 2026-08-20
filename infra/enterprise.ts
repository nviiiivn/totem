import { SECRET } from "./secret"
import { shortDomain } from "./stage"

const storage = new sst.cloudflare.Bucket("EnterpriseStorage")

new sst.cloudflare.x.SolidStart("Teams", {
  domain: shortDomain,
  path: "totem-pole/enterprise",
  buildCommand: "bun run build:cloudflare",
  link: [SECRET.SupportApiKey],
  environment: {
    TOTEM_STORAGE_ADAPTER: "r2",
    TOTEM_STORAGE_ACCOUNT_ID: sst.cloudflare.DEFAULT_ACCOUNT_ID,
    TOTEM_STORAGE_ACCESS_KEY_ID: SECRET.R2AccessKey.value,
    TOTEM_STORAGE_SECRET_ACCESS_KEY: SECRET.R2SecretKey.value,
    TOTEM_STORAGE_BUCKET: storage.name,
  },
})
