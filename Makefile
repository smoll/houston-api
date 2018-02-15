IMAGE_NAME ?= astronomerinc/ap-houston-api

.DEFAULT_GOAL := build-image

build-image:
	docker build -t ${IMAGE_NAME} .
