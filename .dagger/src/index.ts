import {
  dag,
  Container,
  Directory,
  object,
  func,
  Platform,
  argument,
} from "@dagger.io/dagger"

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
  build(): Container {
    return dag
      .container({ platform: "linux/amd64" as Platform })
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
      .withExec(["pnpm", "turbo", "build"])
  }
}
