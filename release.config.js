module.exports = {
  branches: ["master", "main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        releaseRules: [
          // Dependabot commits as chore(deps)/chore(deps-dev), which the
          // default ruleset never releases. Treat dependency updates as a
          // patch so security bumps ship without a manual nudge.
          { type: "chore", scope: "deps", release: "patch" },
          { type: "chore", scope: "deps-dev", release: "patch" },
          { type: "build", scope: "deps", release: "patch" },
        ],
      },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message:
          "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}",
      },
    ],
  ],
};
