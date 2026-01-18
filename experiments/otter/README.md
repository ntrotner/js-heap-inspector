# Otter UI Framework

Link to repository: https://github.com/AmadeusITGroup/otter

Base commit hash: 59e202965e59d2793e190e29d3a9bc15060075ea

Modified commit hash: 376a06d837bfce7584d7b981801d94787b0a5fce


## Setup

```shell
git clone git@github.com:AmadeusITGroup/otter.git
cd otter
git checkout 59e202965e59d2793e190e29d3a9bc15060075ea
yarn install
yarn run build
git apply ../adaptations.patch

yarn ng run showcase:run
```

## Test Case

For gathering baseline:
```shell
cd ../..
npx playwright test ./tests/otter.spec.ts
```


For gathering modified:
```shell
cd otter/otter
git cherry-pick 376a06d837bfce7584d7b981801d94787b0a5fce
yarn run build

cd ../..
npx playwright test ./tests/otter.spec.ts
```