# Benchmark Results

`base.json` is an unoptimized version, that contains `shareReplay(1)` for the `translate()` function in the localization service.

`modified.json` is the optimized version, that modifies the `translate()` function to use `shareReplay({bufferSize: 1, refCount: true})`, thereby removing the cached value if unsubscribed.