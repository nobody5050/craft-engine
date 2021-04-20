P:=./src/js/game
A:=$(P)/LevelMVC/FacingDirection.js $(P)/LevelMVC/Position.js $(P)/LevelMVC/Utils.js
B:=$(P)/LevelMVC/AssetLoader.js $(P)/LevelMVC/AStarPathFinding.js $(P)/LevelMVC/AdjacencySet.js
C:=$(P)/Entities/BaseEntity.js $(P)/Entities/A*.js $(P)/Entities/Boat.js $(P)/Entities/C*.js $(P)/Entities/D*.js 
D:=$(P)/Entities/I*.js $(P)/Entities/P*.js $(P)/Entities/S*.js $(P)/Entities/T*.js $(P)/Entities/Z*.js
E:=$(P)/CommandQueue/*.js $(P)/LevelMVC/Level*.js $(P)/GameController.js
F:=$(P)

all:
	mkdir -p ./build/
	cp -r ./src/* ./build/
	cp ./demo/* ./build/
	cat $(P)/Levels/*.js ./src/js/levels.js > ./build/js/levels.js
	cat ./src/js/utils.js $(P)/API/*.js $(P)/Event/EventType.js $(A) $(B) $(C) $(D) $(E) > ./build/js/main.js

test:
	cd ./build/ && python3 -m http.server

clean:
	rm -rf ./build/
