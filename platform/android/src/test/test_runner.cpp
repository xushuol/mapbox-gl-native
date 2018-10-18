#include "runtime.hpp"
#include <mbgl/test.hpp>

int main(int argc, char *argv[]) {
    if (!mbgl::android::init_runtime(argc, argv)) {
        return 1;
    }

    mbgl::runTests(argc, argv);
}
