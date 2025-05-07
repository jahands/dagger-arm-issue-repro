import {
  dag,
  Container,
  Directory,
  object,
  func,
  Platform,
  argument,
} from "@dagger.io/dagger"
import pMap from "p-map"

@object()
export class DaggerArmIssueRepro {
  source: Directory

  constructor(
    @argument({
      defaultPath: "/",
      ignore: ["**/node_modules/", "**/.turbo/", "**/dist/"],
    })
    source: Directory
  ) {
    this.source = source
  }

  @func()
  async build(): Promise<void> {
    const platforms = ["linux/amd64", "linux/arm64"] as Platform[]
    await pMap(platforms, async (platform) => {
      await dag
        .container({ platform })
        .from("public.ecr.aws/docker/library/node:22")
        .withExec(["npm", "install", "-g", "pnpm@10.10.0"])
        .withWorkdir("/work")
        .withDirectory("/work", this.source)
        .withExec([
          "pnpm",
          "install",
          "--frozen-lockfile",
          "--child-concurrency=10",
        ])
        .withExec([
          "pnpm",
          "turbo",
          "build",
          "-F",
          "./apps/*",
          "--log-order=grouped",
        ])
        .sync()
    })
  }
}
