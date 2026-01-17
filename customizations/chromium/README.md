## Chromium Customizations

### Setup

- Setup chromium for development and build it [Checking out and building Chromium on Linux](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md)
- Initial build can take up to 1-2 days

### Patch

#### Access Metrics
- Apply `access.patch` on base commit `f5f394b2e3292dc15a07df28c37d506b92de4742` on the V8 repository.
- Around 900 files will be rebuilt, which takes ~1 hour.

