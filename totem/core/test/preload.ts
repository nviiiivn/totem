import path from "path"

process.env.TOTEM_DB = ":memory:"
process.env.TOTEM_MODELS_PATH = path.join(import.meta.dir, "plugin", "fixtures", "models-dev.json")
process.env.TOTEM_DISABLE_MODELS_FETCH = "true"
