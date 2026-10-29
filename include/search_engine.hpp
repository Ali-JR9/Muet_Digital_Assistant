#ifndef SEARCH_ENGINE_HPP
#define SEARCH_ENGINE_HPP

#include <string>
#include <vector>

struct Chunk {
    int id;
    std::string text;
};

class ProspectusSearchEngine {
private:
    std::vector<Chunk> database;
    std::vector<std::string> tokenize(const std::string& input);

public:
    bool loadData(const std::string& filepath);
    std::string search(const std::string& query);
};

#endif
