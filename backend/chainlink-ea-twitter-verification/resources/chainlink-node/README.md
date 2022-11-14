# Node

- VM
- DB
- VM external IP in DB connections
- Users & Databases: Create new

VM:

- Install docker (Debian & Ubuntu)

```sh
curl -sSL https://get.docker.com/ | sh
sudo usermod -aG docker $USER
exit
```

- Follow instructions on https://docs.chain.link/docs/running-a-chainlink-node/

SSH Tunelling

- gcloud auth login
- ```sh
  gcloud compute ssh instance-1 --project <YOUR_GCP_PROJECT_ID> --zone=<YOUR_GCP_ZONE> -- -L 6688:localhost:6688
  ```

```sh
# Basic
docker run -p 6688:6688 -v ~/.chainlink-mumbai:/chainlink -it --env-file=.env smartcontract/chainlink:1.9.0-root local n

# With detach
docker run --restart=always  -p 6688:6688 -d --name node-mumbai -v ~/.chainlink-mumbai:/chainlink -it --env-file=.env smartcontract/chainlink:1.9.0-root local n -p /chainlink/.password -a /chainlink/.api
```

Cloud function URL
https://us-central1-chainlink-node-366720.cloudfunctions.net/chainlink-ea-twitter
