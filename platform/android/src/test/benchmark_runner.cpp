#include "runtime.hpp"
#include <mbgl/benchmark.hpp>

int main(int argc, char *argv[]) {
    if (!mbgl::android::init_runtime(argc, argv)) {
        return 1;
    }

    return mbgl::runBenchmark(argc, argv);
}
