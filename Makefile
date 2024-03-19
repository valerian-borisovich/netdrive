.DEFAULT_GOAL := docs

.PHONY: install
install:
	cd ./packages/netdrive
	npm install


.PHONY: clean
clean:
	@echo "---------------------------"
	@echo "- Cleaning  files -"
	@echo "---------------------------"

	rm -rf `find . -type d -name build`
	rm -rf `find . -type d -name dist`
	exit 1

	rm -f `find . -type f -name 'package-lock.json' `
	rm -rf `find . -type d -name node_modules`

	exit 1

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

	@echo ""

.PHONY: docs
docs:
	@echo "-------------------------"
	@echo "- Serving documentation -"
	@echo "-------------------------"

	pdm run mkdocs serve

	@echo ""

.PHONY: build
b build:
	@echo "--------------------------"
	@echo "- Building -"
	@echo "--------------------------"

	yarn install
#	npm i && npm audit fix --force

	@echo "\a"

.PHONY: build-web
bw build-web:
	@echo "--------------------------"
	@echo "- Building web -"
	@echo "--------------------------"

	rm -rf ./packages/netdrive-web/dist
	yarn build-web

	cd ./packages/netdrive-web
#	npm i && npm audit fix --force
	npm run dev
	npm run build


.PHONY: build-dav
bd build-dav:
	@echo "--------------------------"
	@echo "- Building dav -"
	@echo "--------------------------"

#	npm i && npm audit fix --force
	@cd ./packages/netdrive-webdav
	@rm -rf ./dist
	npm run build
	@cd ../..


.PHONY: s start
s start:
	@echo "--------------------------"
	@echo "- Start -"
	@echo "--------------------------"

	@node ./packages/netdrive/app.js
