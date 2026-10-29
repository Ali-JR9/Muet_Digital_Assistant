#include "search_engine.hpp"
#include <iostream>

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: ./search_engine <query_string>" << std::endl;
        return 1;
    }

    std::string query = argv[1];
    ProspectusSearchEngine engine;

    if (!engine.loadData("data/prospectus.txt")) {
        return 1;
    }

    std::cout << engine.search(query) << std::endl;
    return 0;
}
