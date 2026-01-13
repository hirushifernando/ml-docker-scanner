import docker

client = docker.from_env()

image_name = "ubuntu:latest"
image = client.images.pull(image_name)

print(f"Pulled image: {image.tags}")
