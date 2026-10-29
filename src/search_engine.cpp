#include "search_engine.hpp"
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <set>

std::vector<std::string> ProspectusSearchEngine::tokenize(const std::string& input) {
    std::vector<std::string> tokens;
    std::stringstream ss(input);
    std::string word;
    
    while (ss >> word) {
        std::string cleanWord = "";
        for (char c : word) {
            if (std::isalnum(c)) {
                cleanWord += std::tolower(c);
            }
        }
        if (cleanWord.length() > 2) {
            tokens.push_back(cleanWord);
        }
    }
    return tokens;
}

bool ProspectusSearchEngine::loadData(const std::string& filepath) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        std::cerr << "[C++] Error opening prospectus file: " << filepath << std::endl;
        return false;
    }

    std::string line, currentChunk = "";
    int chunkId = 0;

    while (std::getline(file, line)) {
        if (line.empty() || line == "\r") {
            if (!currentChunk.empty()) {
                database.push_back({chunkId++, currentChunk});
                currentChunk = "";
            }
        } else {
            currentChunk += line + " ";
        }
    }
    if (!currentChunk.empty()) {
        database.push_back({chunkId++, currentChunk});
    }

    file.close();
    std::cout << "[C++] Successfully indexed " << database.size() << " sections from prospectus." << std::endl;
    return true;
}

std::string ProspectusSearchEngine::search(const std::string& query) {
    auto queryTokens = tokenize(query);
    if (queryTokens.empty() || database.empty()) {
        return "No relevant information found in the prospectus.";
    }

    int bestMatchId = -1;
    int maxScore = -1;

    for (const auto& chunk : database) {
        auto chunkTokens = tokenize(chunk.text);
        std::set<std::string> uniqueChunkTokens(chunkTokens.begin(), chunkTokens.end());

        int score = 0;
        for (const auto& qToken : queryTokens) {
            if (uniqueChunkTokens.count(qToken)) {
                score++;
            }
        }

        if (score > maxScore) {
            maxScore = score;
            bestMatchId = chunk.id;
        }
    }

    if (maxScore <= 0 || bestMatchId == -1) {
        return "I could not find specific details regarding that query in your prospectus file.";
    }

    return database[bestMatchId].text;
}
