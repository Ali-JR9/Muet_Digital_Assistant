cmake_minimum_required(VERSION 3.10)
project(MuetProspectusAI VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

add_executable(search_engine src/main.cpp src/search_engine.cpp)
