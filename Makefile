.DEFAULT_GOAL := build
# ###
# #####################################################################################################################
# ###    Full path of the current script
#THIS=$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || echo $0);
# ### The directory where current script resides
#DIR=$(dirname "${THIS}")
# ###
#PWD=$(pwd)
# ###
#

# all: hooks install build init serve
# default: init

#default:
#	@$(MAKE) -s help

.PHONY: setup
setup:
	npm install yarn -g
	npm install pm2 -g

	@echo "\a"


.PHONY: clean
clean:
	@echo "---------------------------"
	@echo "- Cleaning  files -"
	@echo "---------------------------"

	rm -rf `find . -type d -name build`
	rm -rf `find . -type d -name dist`
	rm -rf `find . -type d -name node_modules`
	rm -rf `find . -type d -name cache`
	rm -f `find . -type f -name 'yarn.lock' ` >/dev/null 2>&1
	rm -f `find . -type f -name 'package-lock.json' `  >/dev/null 2>&1
	rm -rf ./packages/server/theme
	rm -rf ./packages/server/plugins

#	exit 0
	rm -rf `find . -name __pycache__`
	rm -f `find . -type f -name '*.py[co]' `
	rm -f `find . -type f -name '*.rej' `
	rm -rf `find . -type d -name '*.egg-info' `
	rm -f `find . -type f -name '*~' `
	rm -f `find . -type f -name '.*~' `
	rm -rf .cache
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf htmlcov
	rm -f .coverage
	rm -f .coverage.*
	rm -f src/*.c pydantic/*.so
	rm -rf site
	rm -rf docs/_build
	rm -rf docs/.changelog.md docs/.version.md docs/.tmp_schema_mappings.html
	rm -rf codecov.sh
	rm -rf coverage.xml

	@echo "\a"


.PHONY: docs
docs:
	@echo "-------------------------"
	@echo "- Serving documentation -"
	@echo "-------------------------"

	mkdocs serve

	@echo "\a"


.PHONY: build
b build:
	@$(MAKE) -s clean
	@$(MAKE) -s setup

	@echo "--------------------------"
	@echo "- Building -"
	@echo "--------------------------"

	yarn install
	yarn build-web

	mkdir -p ./packages/server/theme/default
	mkdir -p ./packages/server/plugins

	cp -r ./packages/web/dist/* ./packages/server/theme/default
	cp -r ./packages/plugin/lib/* ./packages/server/plugins

	@echo "\a"


.PHONY: build-web
bw build-web:
	@echo "--------------------------"
	@echo "- Building web -"
	@echo "--------------------------"

	rm -rf ./packages/web/dist
	yarn build-web

	cd ./packages/web
#	npm i && npm audit fix --force
	npm run dev
	npm run build

	@echo "\a"


.PHONY: build-dav
bd build-dav:
	@echo "--------------------------"
	@echo "- Building dav -"
	@echo "--------------------------"

#	npm i && npm audit fix --force
	@cd ./packages/webdav
	@rm -rf ./dist
	npm run build
	@cd ../..

	@echo "\a"


.PHONY: s start
s start:
	@echo "--------------------------"
	@echo "- Start -"
	@echo "--------------------------"

#	@node ./packages/server/app.js

	@cd ./packages/server

	pm2 start app.js --name netdrive-server
	pm2 save
	pm2 startup

	@echo "\a"
