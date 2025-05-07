import {
  dag,
  Container,
  Directory,
  object,
  func,
  Platform,
} from "@dagger.io/dagger"

@object()
export class DaggerArmIssueRepro {
  /**
   * Returns a container that echoes whatever string argument is provided
   */
  @func()
  build(): Container {
    return dag
      .container({ platform: "linux/amd64" as Platform })
      .from("public.ecr.aws/debian/debian:12-slim")
      .withExec(["mkdir", "-p", "/work/packages/workspace-dependencies/.turbo"])
  }
}
