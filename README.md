# Image Mesh Drawer

Draws a mesh on an image.

## Openssl preparation

```bash
sudo mkdir -p /etc/imd/
cd /etc/imd/
sudo openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout server.key \
  -out server.crt \
  -days 365 \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

```

## Build
Before build check Dockerfile and change nginx architecture if necessary. Also check nginx.conf.

```bash
docker build -t image-mesh-drawer-frontend .
docker tag image-mesh-drawer-frontend madc0der/image-mesh-drawer-frontend:x64
docker push madc0der/image-mesh-drawer-frontend:x64
```

## Startup

```bash
sudo docker run -d -p 80:80 -p 443:443 \
  -v /etc/imd/:/etc/nginx/ssl:ro \
  --name image-mesh-drawer-frontend \
  madc0der/image-mesh-drawer-frontend
```