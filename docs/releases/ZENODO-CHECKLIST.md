# Zenodo DOI — owner checklist (one-time, ~10 minutes)

Publishing a release does NOT create a DOI by itself. These steps require the
repository owner's accounts and cannot be performed by automation:

1. Sign in at https://zenodo.org (use "Sign in with GitHub").
2. Zenodo → account menu → **GitHub** → find
   `pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System`
   → flip the toggle **ON**. (Only repositories you own/admin appear.)
3. Back on GitHub: publish the release for tag `v2.0.0-alpha`
   (Releases → Draft a new release → choose the tag → paste
   `docs/releases/v2.0.0-alpha.md` as the description → Publish).
   Zenodo archives the release automatically and mints a DOI within minutes.
4. Copy the **Concept DOI** (the version-independent one) from the Zenodo
   record and add it to:
   - `CITATION.cff` → `doi:` field
   - README badges (optional): `https://zenodo.org/badge/DOI/<doi>.svg`
5. Every future GitHub release gets its own version DOI automatically.

Notes
- The toggle must be ON **before** the release is published; a release made
  earlier is not archived retroactively (re-publish or make a new tag).
- Zenodo reads `CITATION.cff` for metadata (title, authors: Skander Douki,
  Pixels Trade SA). Check the record after minting and correct metadata on
  Zenodo if needed.
