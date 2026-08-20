interface ImportMetaEnv {
  readonly TOTEM_CHANNEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "virtual:totem-server" {
  export namespace Server {
    export const listen: typeof import("../../../totem/dist/types/src/node").Server.listen
    export type Listener = import("../../../totem/dist/types/src/node").Server.Listener
  }
  export namespace Config {
    export const get: typeof import("../../../totem/dist/types/src/node").Config.get
    export type Info = import("../../../totem/dist/types/src/node").Config.Info
  }
  export const bootstrap: typeof import("../../../totem/dist/types/src/node").bootstrap
}
