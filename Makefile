image-build:
	docker build -t my-image:latest .

run:
	$(MAKE) image-build
	docker run my-image:latest
