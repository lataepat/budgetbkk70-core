# Public release handoff

Repository: [lataepat/budgetbkk70-core](https://github.com/lataepat/budgetbkk70-core).

The source archive is ready to place at the repository root, including `.github/workflows/ci.yml` and `.gitignore`. Do not put the separate private Codex application document in the repository.

For the first public release:

1. Create an empty public GitHub repository. Do not initialize another README or license.
2. Upload this repository's contents, preserving its folder structure.
3. Confirm the README, MIT license, and workflow are present, and that the workflow passes.
4. Use the real published repository URL in the Codex for OSS application.

When using an authenticated GitHub CLI, the equivalent command from an initialized checkout is:

```sh
gh repo create lataepat/budgetbkk70-core --public --source=. --remote=origin --push
```

Run it only after verifying the active account with `gh auth status`. This is a publication command, not a test. It was not run during preparation because this session has no usable GitHub publishing connection.

Do not manufacture stars, downloads, contributors, backdated commits, or testimonials. The existing deployed project and the checks described in the application are the evidence for this submission.
