import { Credential } from "@totem-ai/core/credential"
import { EventV2 } from "@totem-ai/core/event"
import { FileSystem } from "@totem-ai/core/filesystem"
import { FSUtil } from "@totem-ai/core/fs-util"
import { Global } from "@totem-ai/core/global"
import { Npm } from "@totem-ai/core/npm"
import { PluginV2 } from "@totem-ai/core/plugin"
import { RepositoryCache } from "@totem-ai/core/repository-cache"
import { Ripgrep } from "@totem-ai/core/ripgrep"
import { SkillDiscovery } from "@totem-ai/core/skill/discovery"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { tempLocationLayer } from "../fixture/location"

export const PluginTestLayer = Layer.mergeAll(FileSystem.locationLayer, PluginV2.locationLayer).pipe(
  Layer.provideMerge(
    Layer.mergeAll(
      Credential.defaultLayer,
      EventV2.defaultLayer,
      FetchHttpClient.layer,
      FSUtil.defaultLayer,
      Global.defaultLayer,
      Layer.succeed(
        Npm.Service,
        Npm.Service.of({
          add: () => Effect.succeed({ directory: "", entrypoint: undefined }),
          install: () => Effect.void,
          which: () => Effect.succeed(undefined),
        }),
      ),
      RepositoryCache.defaultLayer,
      SkillDiscovery.defaultLayer,
      Ripgrep.defaultLayer,
      tempLocationLayer,
    ),
  ),
)
