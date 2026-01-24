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
git apply ../adaptations.patch
yarn run build

yarn ng run showcase:build
cd apps/showcase/dist/browser
npx http-server ./ -p 4200 --proxy http://localhost:4200\? --cors --no-dotfiles -g -b
```

## Test Case

For gathering baseline:
```shell
cd ../..
npx playwright test ./tests/otter.spec.ts
yarn run otter-showcase-simple
yarn run otter-showcase-extensive
```


For gathering modified:
```shell
cd otter/otter
git cherry-pick 376a06d837bfce7584d7b981801d94787b0a5fce
yarn run build
yarn ng run showcase:build

cd ../..
yarn run otter-showcase-simple
yarn run otter-showcase-extensive
```

## Benchmark Results

`base.json` is an unoptimized version, that contains `shareReplay(1)` for the `translate()` function in the localization service.

`modified.json` is the optimized version, that modifies the `translate()` function to use `shareReplay({bufferSize: 1, refCount: true})`, thereby removing the cached value if unsubscribed.